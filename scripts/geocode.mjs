// One-off build-time geocoder (NOT used at runtime). Uses Nominatim (OSM), max 1 req/sec.
// Usage: node scripts/geocode.mjs [--force] [--report path]
// Writes `location: {lat, lng, maps_query}` into src/data/trip.json. Anything not found or outside
// the expected area for that day stays null and is listed in the report.
import { readFileSync, writeFileSync } from "node:fs";

const TRIP = new URL("../src/data/trip.json", import.meta.url);
const UA = "trip-lens-geocoder/0.1 (one-off personal trip planner; contact tinn.jittjana@agoda.com)";
const force = process.argv.includes("--force");
const reportPath = process.argv.includes("--report") ? process.argv[process.argv.indexOf("--report") + 1] : null;

// Sanity boxes [south, west, north, east] per day: items must fall inside, else rejected.
const BOX = {
  1: [40.4, 140.2, 41.0, 141.0],
  2: [40.4, 140.2, 41.0, 141.0],
  3: [40.1, 140.4, 41.0, 141.6],
  4: [39.5, 140.3, 40.2, 141.2],
  5: [39.3, 140.2, 40.2, 141.4],
  6: [39.5, 140.9, 39.9, 141.4],
  7: [38.1, 140.7, 39.3, 141.6],
  8: [37.9, 140.3, 38.5, 141.3],
  9: [37.2, 139.9, 37.9, 140.6],
  10: [35.4, 139.3, 37.6, 140.6],
  11: [35.5, 139.3, 35.9, 139.95],
  12: [35.5, 139.3, 35.9, 139.95],
  13: [35.5, 139.3, 35.9, 139.95],
};
const CTX = { 1: "Aomori", 2: "Hirosaki", 3: "Aomori", 4: "Akita", 5: "Akita", 6: "Morioka", 7: "Miyagi", 8: "Sendai", 9: "Fukushima", 10: "Koriyama", 11: "Tokyo", 12: "Tokyo", 13: "Tokyo" };
// Per-item context overrides where the day's context city is wrong for that item.
const ITEM_CTX = {
  "Jogakura Bridge": "Hirosaki",
  "Roadside Station Oyu": "Kazuno",
  "Kazunoshi Sogo Undo Koen": "Kazuno",
  "Hakkoda Ropeway": "Aomori",
  "Tsurunoyu Onsen": "Senboku",
  "Kakunodate": "Senboku",
  "Chusonji Temple": "Hiraizumi",
  "Geibikei Gorge & Pokemon Train": "Ichinoseki",
  "Shiohamako": "Shiogama",
  "Goshogake Onsen": "Hachimantai",
  "Tamagawa Onsen": "Senboku",
  "Hachimantai Onuma Pond": "Hachimantai",
  "Michinoku Lakeside": "Shiroishi",
  "Parco Sendai": "Sendai",
};
// Extra queries (English variants / Japanese names) tried after the defaults. Results still go through the same area check.
const ALT = {
  "Toys R Us at Ciina Ciina mall": ["Toys R Us Aomori", "トイザらス 青森"],
  "Aomori Bay": ["Aomori Bay Bridge"],
  "Aomori Bank Memorial Museum": ["青森銀行記念館", "Former Aomori Bank Memorial Hall"],
  "Hirosaki Apple Park": ["弘前りんご公園", "Apple Park Hirosaki"],
  "Hirosaki City Library": ["弘前市立弘前図書館", "Hirosaki Municipal Library"],
  "Nakano Momiji-yama": ["中野もみじ山", "Nakano Momijiyama"],
  "Shinmachi Street": ["Shinmachi, Hirosaki"],
  "Aomori Gyosai Center": ["青森魚菜センター", "Nokkedon Aomori"],
  "Hasshoku Center": ["八食センター", "Hasshoku Center Hachinohe"],
  "Taisho Roman Tearoom": ["大正浪漫喫茶室", "Taisho Roman Tea Room"],
  "Robata to Oden Koronagi": ["Koronagi Hirosaki"],
  "Tsutanuma Pond": ["蔦沼", "Tsutanuma"],
  "Oirase": ["奥入瀬渓流", "Oirase Gorge"],
  "Towada Lake Cruise": ["十和田湖遊覧船", "Towada Lake cruise boat"],
  "Roadside Station Oyu": ["道の駅 おおゆ", "Michi-no-Eki Oyu"],
  "Kazunoshi Sogo Undo Koen": ["鹿角市総合運動公園", "Kazuno Sports Park"],
  "Hachimantai Onuma Pond": ["八幡平 大沼", "Hachimantai Onuma"],
  "Goshogake Onsen": ["後生掛温泉", "Goshogake"],
  "Sakura no Sato (Kakunodate)": ["さくらの里 角館", "Sakura no Sato Kakunodate"],
  "Sato Yosuke": ["佐藤養助", "Sato Yosuke Akita"],
  "Seijiro Sushi": ["清次郎"],
  "Morioka JR Station": ["盛岡駅", "Morioka Station"],
  "Pyon Pyon Sya": ["ぴょんぴょん舎", "Pyonpyonsha"],
  "Azumaya Honten": ["東家 本店 盛岡", "Azumaya Morioka"],
  "Fukuda Pan": ["福田パン", "Fukuda Bread Morioka"],
  "Hamburg Restaurant Bell": ["ハンバーグレストランベル", "Hamburg Bell Morioka"],
  "Chusonji Temple": ["中尊寺", "Chuson-ji"],
  "Geibikei Gorge & Pokemon Train": ["猊鼻渓", "Geibikei"],
  "Gyutan Cuisine Kaku Brandome Main Store": ["Gyutan Kaku Sendai"],
  "Shiohamako": ["Shiohama Shiogama"],
  "Parco Sendai": ["仙台パルコ", "Sendai PARCO"],
  "Michinoku Lakeside": ["みちのく湖畔公園", "Michinoku Lake Park"],
  "JR Fruit Park Sendai": ["JRフルーツパーク仙台あらはま", "Fruit Park Sendai Arahama"],
  "Taiyaki Taikishi": ["Taikishi Sendai"],
  "Bandai Azuma Skyline": ["磐梯吾妻スカイライン", "Bandai-Azuma Skyline"],
  "Goshikinuma Pond": ["五色沼", "Goshikinuma"],
  "Rokumonya": ["Rokumonya Tokyo"],
};
// Day area pins (spec DC-2) with fallbacks queries.
const DAY_PIN = {
  1: ["Aomori city, Aomori Prefecture"], 2: ["Aomori city, Aomori Prefecture"],
  3: ["Lake Towada", "Towada Lake, Akita"], 4: ["Lake Tazawa", "Tazawa-ko"],
  5: ["Morioka"], 6: ["Morioka"], 7: ["Chuson-ji", "中尊寺", "Chusonji"], 8: ["Sendai"],
  9: ["Bandai-Azuma Skyline", "磐梯吾妻スカイライン", "Jododaira"], 10: ["Tokyo"], 11: ["Tokyo"], 12: ["Tokyo"], 13: ["Tokyo"],
};
const HOTEL_BOX = (id) => ({ "acc-01": 1, "acc-02": 3, "acc-03": 4, "acc-04": 5, "acc-05": 8, "acc-06": 9, "acc-07": 11 })[id];
const HOTEL_Q = {
  "acc-01": ["Aomori city, Aomori Prefecture"], // city centre, NOT the private house address
  "acc-02": ["Kamenoi Hotel Akita Yuze", "亀の井ホテル 秋田湯瀬", "Kamenoi Hotel Yuze"],
  "acc-03": ["Cerulean Resort Aoni", "Cerulean Resort"],
  "acc-04": ["Daiwa Roynet Hotel Morioka Ekimae", "ダイワロイネットホテル盛岡駅前", "Daiwa Roynet Hotel Morioka"],
  "acc-05": ["Rakuten STAY x EAGLES", "楽天ステイ 仙台", "Rakuten STAY Sendai"],
  "acc-06": ["Daiwa Roynet Hotel Koriyama", "ダイワロイネットホテル郡山"],
  "acc-07": ["MIMARU Tokyo Shinjuku West", "MIMARU東京 新宿ウエスト", "MIMARU Shinjuku"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;
const log = [];
async function nominatim(q, box) {
  const wait = 1100 - (Date.now() - last);
  if (wait > 0) await sleep(wait);
  const p = new URLSearchParams({ q, format: "jsonv2", countrycodes: "jp", limit: "5", "accept-language": "en" });
  if (box) { p.set("viewbox", `${box[1]},${box[2]},${box[3]},${box[0]}`); p.set("bounded", "1"); }
  last = Date.now();
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${p}`, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${q}`);
  return res.json();
}
const inBox = (r, b) => +r.lat >= b[0] && +r.lat <= b[2] && +r.lon >= b[1] && +r.lon <= b[3];
const inJapan = (r) => +r.lat >= 30 && +r.lat <= 46 && +r.lon >= 128 && +r.lon <= 146;

async function resolve(label, queries, box, mapsQuery) {
  for (const [i, q] of queries.entries()) {
    try {
      // bounded first (strong), then unbounded with post-check
      for (const bounded of [true, false]) {
        const rs = await nominatim(q, bounded ? box : null);
        const hit = rs.find((r) => inJapan(r) && inBox(r, box));
        if (hit) {
          log.push({ label, status: "ok", q, bounded, display: hit.display_name, type: `${hit.category}/${hit.type}`, lat: +hit.lat, lng: +hit.lon });
          return { lat: +(+hit.lat).toFixed(6), lng: +(+hit.lon).toFixed(6), maps_query: mapsQuery };
        }
      }
    } catch (e) { log.push({ label, status: "error", q, error: String(e) }); }
  }
  log.push({ label, status: "FAILED", queries });
  return null;
}

const trip = JSON.parse(readFileSync(TRIP, "utf8"));
const dayPinByNum = {};
for (const d of trip.days) {
  const n = d.day_number;
  if (!force && d.location) continue;
  const key = DAY_PIN[n].join("|");
  if (dayPinByNum[key] === undefined)
    dayPinByNum[key] = await resolve(`day ${n} pin`, DAY_PIN[n], BOX[n], DAY_PIN[n][0]);
  d.location = dayPinByNum[key];
}
for (const a of trip.accommodations) {
  if (!force && a.location) continue;
  a.location = await resolve(`hotel ${a.id} ${a.name}`, HOTEL_Q[a.id], BOX[HOTEL_BOX(a.id)], `${a.name}, ${a.city}`);
}
for (const d of trip.days) {
  const n = d.day_number;
  for (const kind of ["sightseeing", "food"]) {
    for (const it of d[kind]) {
      if (!force && it.location) continue;
      const ctx = ITEM_CTX[it.name] ?? CTX[n];
      it.location = await resolve(`day ${n} ${kind} ${it.id} ${it.name}`, [`${it.name}, ${ctx}`, it.name, ...(ALT[it.name] ?? [])], BOX[n], `${it.name}, ${ctx}, Japan`);
    }
  }
}
writeFileSync(TRIP, JSON.stringify(trip, null, 2) + "\n");
const out = log.map((l) => JSON.stringify(l)).join("\n");
if (reportPath) writeFileSync(reportPath, out + "\n");
console.log(out);
