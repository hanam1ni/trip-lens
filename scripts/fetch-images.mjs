// One-off thumbnail fetcher (NOT part of `npm run build`). Wikimedia/Wikidata only.
// Usage: node scripts/fetch-images.mjs [--force] [--dry] [--only id1,id2]
// Writes public/images/<id>.<ext> and src/data/images.json (manifest with attribution).
// Hard rule: an item is accepted only if a Wikidata entity (in Japan, with P18) matches by
// name AND location. Anything uncertain is skipped.
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { extname } from "node:path";

const TRIP = new URL("../src/data/trip.json", import.meta.url);
const OUT_DIR = new URL("../public/images/", import.meta.url);
const MANIFEST = new URL("../src/data/images.json", import.meta.url);
const UA = "TripLens/0.1 (personal trip site)";
const force = process.argv.includes("--force");
const dry = process.argv.includes("--dry");
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1].split(",") : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_BYTES = 60 * 1024;

// Items that are generic / chains / not a specific place: never looked up.
const SKIP = {
  "acc-01": "private home",
  "d01-s03": "chain store",
  "d02-s04": "chain (Starbucks)",
  "d03-s06": "generic rest stop",
  "d07-f01": "generic (rest area along the way)",
  "d10-f01": "generic (breakfast in Koriyama)",
  "d06-s03": "ticket office, not a place with a photo",
  "d08-f02": "generic snack",
  "d06-f05": "generic takeaway",
  "d07-f04": "generic snack",
};
// Search-term overrides (candidate generation only; acceptance still needs name+location checks).
const QUERY = {
  "d01-s01": ["Nebuta Museum Warasse"],
  "d02-s03": ["Hirosaki City Library", "弘前市立図書館"],
  "d03-s05": ["Lake Towada"],
};
// Hand-picked Commons files (owner-approved), used as-is without the name/location checks.
const MANUAL = {
  "d05-s01": { file: "Tsurunoyu Onsen 01.jpg", wikidata_id: "Q11675866" }, // Category:Tsurunoyu Onsen (Akita)
  "d09-s02": { file: "260731 Yanaginuma Goshikinuma Kitashiobara Fukushima pref Japan01s3.jpg", wikidata_id: null }, // Urabandai, not Nikko's Goshiki Pond
};
// Natural/large features get the looser 5 km radius.
const LARGE = new Set(["nature", "scenic_route", "onsen", "park", "town"]);

const trip = JSON.parse(readFileSync(TRIP, "utf8"));
const accById = Object.fromEntries(trip.accommodations.map((a) => [a.id, a]));

const items = [];
for (const a of trip.accommodations) {
  items.push({ id: a.id, name: a.name, kind: "accommodation", loc: a.location, ctx: a.city, anchor: null, cat: "hotel" });
}
for (const d of trip.days) {
  for (const p of d.sightseeing) items.push({ id: p.id, name: p.name, kind: "place", loc: p.location, ctx: d.travel_city, anchor: d.location, cat: p.category });
  for (const f of d.food) items.push({ id: f.id, name: f.name, kind: "food", loc: f.location, ctx: d.travel_city, anchor: d.location, cat: "food" });
}

const hasCoord = (l) => l && typeof l.lat === "number" && typeof l.lng === "number";
const km = (a, b) => {
  const R = 6371, rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9぀-ヿ一-鿿]+/g, "");

async function api(url) {
  for (let attempt = 0; attempt < 6; attempt++) {
    await sleep(700 + attempt * 4000);
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (r.status === 429 || r.status >= 500) continue;
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.json();
  }
  throw new Error(`gave up (rate limited) ${url}`);
}

async function searchIds(term) {
  const ids = new Set();
  for (const lang of ["en", "ja"]) {
    const j = await api(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&limit=7&language=${lang}&uselang=${lang}&search=${encodeURIComponent(term)}`);
    for (const s of j.search ?? []) ids.add(s.id);
  }
  // Wikipedia fulltext search (en) -> wikibase item
  const w = await api(`https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=5&gsrsearch=${encodeURIComponent(term)}&prop=pageprops&ppprop=wikibase_item`);
  for (const p of Object.values(w.query?.pages ?? {})) if (p.pageprops?.wikibase_item) ids.add(p.pageprops.wikibase_item);
  return [...ids];
}

async function getEntities(ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 40) {
    const j = await api(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels|aliases|claims|sitelinks&languages=en|ja&ids=${ids.slice(i, i + 40).join("|")}`);
    Object.assign(out, j.entities ?? {});
  }
  return out;
}

const claim = (e, p) => e.claims?.[p]?.[0]?.mainsnak?.datavalue?.value;
function entityInfo(e) {
  const names = new Set(), labels = new Set();
  for (const l of ["en", "ja"]) {
    if (e.labels?.[l]) { names.add(e.labels[l].value); labels.add(e.labels[l].value); }
    for (const a of e.aliases?.[l] ?? []) names.add(a.value);
  }
  if (e.sitelinks?.enwiki) names.add(e.sitelinks.enwiki.title);
  const c = claim(e, "P625");
  const country = (e.claims?.P17 ?? []).map((x) => x.mainsnak?.datavalue?.value?.id);
  return {
    id: e.id, labels: [...labels], label: e.labels?.en?.value ?? e.labels?.ja?.value ?? e.id, names: [...names],
    coord: c ? { lat: c.latitude, lng: c.longitude } : null,
    p18: claim(e, "P18"), japan: country.includes("Q17"),
  };
}

function nameMatch(itemName, names) {
  const n = norm(itemName);
  if (!n) return null;
  for (const x of names) {
    const m = norm(x);
    if (m === n) return "exact";
  }
  return null;
}

async function decide(it) {
  const terms = QUERY[it.id] ?? [it.name];
  const ids = new Set();
  for (const t of terms) for (const id of await searchIds(t)) ids.add(id);
  if (!ids.size) return { reason: "no Wikidata candidates" };
  const ents = await getEntities([...ids]);
  const cands = [];
  for (const e of Object.values(ents)) {
    if (e.missing !== undefined) continue;
    const info = entityInfo(e);
    cands.push({ ...info, match: nameMatch(it.name, info.names), labelMatch: nameMatch(it.name, info.labels) === "exact" });
  }
  const log = cands.filter((c) => c.match || (c.coord && hasCoord(it.loc) && km(c.coord, it.loc) < 2)).map((c) => `${c.id}:${c.label}${c.p18 ? "" : "(noP18)"}`);
  const here = hasCoord(it.loc) ? it.loc : null;
  const large = LARGE.has(it.cat);
  const radius = large ? 5 : 2;
  const good = [];
  for (const c of cands) {
    if (!c.match || !c.p18 || !c.japan || !c.coord) continue;
    if (here) {
      const d = km(c.coord, here);
      if (d <= radius) good.push({ ...c, why: `${c.match} name match, ${d.toFixed(2)} km from item coords (limit ${radius})`, dist: d });
    } else if (c.match === "exact" && hasCoord(it.anchor)) {
      const d = km(c.coord, it.anchor);
      if (d <= 30) good.push({ ...c, why: `exact name match, no item coords; ${d.toFixed(1)} km from day location (limit 30)`, dist: d });
    }
  }
  if (good.length === 0) return { reason: cands.some((c) => c.match) ? "name matched but failed location/P18/Japan check" : "no name-matching Wikidata entity", log };
  // If several qualify, prefer those whose primary label equals the item name; still skip if >1 remain.
  if (good.length > 1 && good.some((g) => g.labelMatch)) good.splice(0, good.length, ...good.filter((g) => g.labelMatch));
  const uniq = new Set(good.map((g) => g.id));
  if (uniq.size > 1) return { reason: `ambiguous: ${good.map((g) => g.id + ":" + g.label).join(", ")}`, log };
  return { ok: good[0], log };
}

const strip = (s) => (s ?? "").replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s+/g, " ").trim();

async function fetchImage(fileName, id) {
  for (const width of [480, 360, 280, 200]) {
    const j = await api(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${width}&titles=${encodeURIComponent("File:" + fileName)}`);
    const page = Object.values(j.query.pages)[0];
    const ii = page.imageinfo?.[0];
    if (!ii) throw new Error("no imageinfo");
    const md = ii.extmetadata ?? {};
    const url = ii.thumburl || ii.url;
    await sleep(300);
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (!r.ok) throw new Error(`download ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX_BYTES && width > 200) continue;
    const ext = (extname(new URL(url).pathname) || ".jpg").toLowerCase();
    if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) throw new Error("unsupported ext " + ext);
    const file = `${id}${ext}`;
    writeFileSync(new URL(file, OUT_DIR), buf);
    return {
      file, bytes: buf.length,
      source_page: ii.descriptionurl,
      author: strip(md.Artist?.value) || "Unknown",
      license: strip(md.LicenseShortName?.value) || "Unknown",
      license_url: strip(md.LicenseUrl?.value) || null,
    };
  }
}

mkdirSync(OUT_DIR, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const report = [];
function saveManifest() {
  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + "\n");
}
for (const it of items) {
  if (only && !only.includes(it.id)) continue;
  if (SKIP[it.id]) { report.push(`SKIP  ${it.id} | ${it.name} | ${SKIP[it.id]}`); continue; }
  if (!force && manifest[it.id] && existsSync(new URL(manifest[it.id].file, OUT_DIR))) { report.push(`KEEP  ${it.id} | ${it.name} | already present`); continue; }
  try {
    if (MANUAL[it.id]) {
      if (dry) { report.push(`WOULD ${it.id} | ${it.name} | manual | ${MANUAL[it.id].file}`); continue; }
      const m = await fetchImage(MANUAL[it.id].file, it.id);
      manifest[it.id] = { file: m.file, source_page: m.source_page, author: m.author, license: m.license, license_url: m.license_url, wikidata_id: MANUAL[it.id].wikidata_id };
      saveManifest();
      report.push(`OK    ${it.id} | ${it.name} | manual | ${m.file} ${m.bytes}B ${m.license} / ${m.author}`);
      continue;
    }
    const r = await decide(it);
    if (!r.ok) { report.push(`SKIP  ${it.id} | ${it.name} | ${r.reason}${r.log?.length ? " | seen: " + r.log.join("; ") : ""}`); continue; }
    const g = r.ok;
    if (dry) { report.push(`WOULD ${it.id} | ${it.name} | ${g.label} ${g.id} | ${g.why} | ${g.p18}`); continue; }
    const m = await fetchImage(g.p18, it.id);
    manifest[it.id] = { file: m.file, source_page: m.source_page, author: m.author, license: m.license, license_url: m.license_url, wikidata_id: g.id };
    saveManifest(); // persist after each image so an interrupted run keeps what it fetched
    report.push(`OK    ${it.id} | ${it.name} | ${g.label} ${g.id} | ${g.why} | ${m.file} ${m.bytes}B ${m.license} / ${m.author}`);
  } catch (e) {
    report.push(`ERR   ${it.id} | ${it.name} | ${e.message}`);
  }
}
if (!dry) saveManifest();
console.log(report.join("\n"));
