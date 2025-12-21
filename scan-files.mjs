import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const EXCLUDE_REGEX = /(\/|\\)(node_modules|\.git|dist|build|\.next|\.vercel|coverage)(\/|\\)|(\.map$)|(\.log$)/i;

const files = [];
const emptyDirs = [];
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  if (!entries.length) { emptyDirs.push(rel(dir)); return; }
  let kept = 0;
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (EXCLUDE_REGEX.test(full)) continue;
    if (e.isDirectory()) {
      const before = files.length;
      walk(full);
      const after = files.length;
      if (after === before) emptyDirs.push(rel(full));
    } else if (e.isFile()) {
      files.push(full);
      kept++;
    }
  }
}
const rel = p => path.relative(ROOT, p).replaceAll("\\", "/");

function sha256OfFile(p) {
  const hash = crypto.createHash("sha256");
  const buf = fs.readFileSync(p);
  hash.update(buf);
  return hash.digest("hex");
}

console.log("Scanning…");
walk(ROOT);

const items = [];
let totalBytes = 0;
for (const f of files) {
  const st = fs.statSync(f);
  const ext = path.extname(f).toLowerCase() || "";
  const mtimeIso = new Date(st.mtimeMs).toISOString();
  const sizeBytes = st.size;
  let sha256 = "";
  try { sha256 = sha256OfFile(f); } catch { sha256 = ""; }
  totalBytes += sizeBytes;
  items.push({ path: rel(f), sizeBytes, mtimeIso, sha256, ext });
}

items.sort((a,b)=>a.path.localeCompare(b.path));

// Write JSON/CSV
fs.writeFileSync("FILES.json", JSON.stringify(items, null, 2));
fs.writeFileSync("FILES.csv",
  ["path,sizeBytes,mtimeIso,sha256,ext", ...items.map(i =>
    `"${i.path.replaceAll('"','""')}",${i.sizeBytes},${i.mtimeIso},${i.sha256},${i.ext}`
  )].join("\n")
);

// Extension counts
const extCounts = {};
for (const i of items) extCounts[i.ext || "(none)"] = (extCounts[i.ext || "(none)"] || 0) + 1;
fs.writeFileSync("EXTENSION_COUNTS.json", JSON.stringify(Object.fromEntries(
  Object.entries(extCounts).sort((a,b)=>b[1]-a[1])
), null, 2));

// Largest 50
const largest = [...items].sort((a,b)=>b.sizeBytes-a.sizeBytes).slice(0,50);
fs.writeFileSync("TOP_50_LARGEST.json", JSON.stringify(largest, null, 2));

// Empty dirs
fs.writeFileSync("EMPTY_DIRS.txt", emptyDirs.sort().join("\n") + "\n");

// Manifest
const kb = totalBytes / 1024;
const mb = kb / 1024;
const gb = mb / 1024;
const sizeStr = gb >= 1 ? `${gb.toFixed(2)} GB` : `${mb.toFixed(2)} MB`;
const manifest = [
  "# MANIFEST",
  "",
  `- Total files: ${items.length}`,
  `- Total size: ${sizeStr}`,
  `- Unique extensions: ${Object.keys(extCounts).length}`,
  "",
  "## Top extensions",
  ...Object.entries(extCounts).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([e,c]) => `- ${e}: ${c}`),
  "",
  "## Top 20 largest files",
  ...largest.slice(0,20).map(i => `- ${i.path} — ${(i.sizeBytes/1048576).toFixed(2)} MB`),
  "",
  "## Empty directories (kept paths with no files after excludes)",
  ...(emptyDirs.length ? emptyDirs.slice(0,200) : ["(none)"])
].join("\n");
fs.writeFileSync("MANIFEST.md", manifest);
console.log("Done. Wrote FILES.json, FILES.csv, EXTENSION_COUNTS.json, TOP_50_LARGEST.json, EMPTY_DIRS.txt, MANIFEST.md");