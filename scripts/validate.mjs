import Ajv from "ajv/dist/2020.js";
import { readFileSync } from "node:fs";

const schema = JSON.parse(readFileSync(new URL("../schema/trip.schema.json", import.meta.url), "utf8"));
const file = process.argv[2] ?? new URL("../src/data/trip.json", import.meta.url).pathname;
const data = JSON.parse(readFileSync(file, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
if (!validate(data)) {
  console.error(`trip.json is INVALID against trip.schema.json (${file}):`);
  for (const e of validate.errors) console.error(`  ${e.instancePath || "/"} ${e.message} ${JSON.stringify(e.params)}`);
  process.exit(1);
}

// Referential integrity (beyond JSON Schema)
const errs = [];
const accIds = new Set(data.accommodations.map((a) => a.id));
const flIds = new Set(data.flights.map((f) => f.id));
for (const d of data.days) {
  if (d.accommodation_id && !accIds.has(d.accommodation_id)) errs.push(`${d.id}: unknown accommodation_id ${d.accommodation_id}`);
  for (const f of d.flight_ids) if (!flIds.has(f)) errs.push(`${d.id}: unknown flight id ${f}`);
}
if (errs.length) {
  console.error(errs.join("\n"));
  process.exit(1);
}
console.log(`trip.json valid (schema ${data.schema_version}).`);
