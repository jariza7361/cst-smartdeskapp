import { spawnSync } from "node:child_process";
const base = process.env.BASE_URL || "http://localhost:5173";
const paths = ["/","/app.js","/assets/app.css","/api/fetch"];
for (const p of paths) {
  const r = spawnSync("curl",["-s","-o","/dev/null","-w","%{http_code}",`${base}${p}`]);
  const code = r.stdout.toString().trim();
  console.log(`${p} -> ${code}`);
  if (code !== "200") process.exit(1);
}
console.log("✅ Smoke OK");
