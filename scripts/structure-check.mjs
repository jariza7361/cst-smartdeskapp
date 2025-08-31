import fs from "node:fs";
const needIds = ["system-status","panels","ingest","setup-wizard","tests-modal","btn-fetch-verizon"];
const html = fs.readFileSync("index.html","utf8");
let ok = true;
for (const id of needIds) if (!new RegExp(`id=["']${id}["']`).test(html)) { console.error(`❌ missing #${id}`); ok = false; }
for (const p of ["public/app.js","public/assets/app.css"]) if (!fs.existsSync(p)) { console.error(`❌ missing ${p}`); ok = false; }
if (!ok) process.exit(1);
console.log("✅ Doctor: structure OK");