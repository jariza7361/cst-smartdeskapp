// scripts/validate-entry.mjs
import { readFile } from 'fs/promises';

const INDEX_PATH = 'index.html';

async function main() {
  let html = '';
  try {
    html = await readFile(INDEX_PATH, 'utf8');
  } catch {
    console.error(
      `[validate-entry] Missing ${INDEX_PATH}. Move your entry to repo root and point it to /app.js.`,
    );
    process.exit(1);
  }

  const hasApp = /<script[^>]+src=["']\/app\.js["'][^>]*><\/script>/i.test(html);
  const hasSrcLeak = /<script[^>]+src=["']\/src\//i.test(html);

  if (!hasApp) {
    console.error(
      `[validate-entry] index.html must load "/app.js" from /public. Add: <script src="/app.js" defer></script>`,
    );
    process.exit(1);
  }
  if (hasSrcLeak) {
    console.error(
      `[validate-entry] Detected dev-only src="/src/...". Remove it and keep only "/app.js".`,
    );
    process.exit(1);
  }
  console.log(`[validate-entry] OK -> entry points to /app.js`);
}
main().catch((e) => {
  console.error(`[validate-entry] Unexpected error:`, e);
  process.exit(1);
});
