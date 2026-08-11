// Static site build. No dependencies: reads src/pages/*, renders HTML, writes dist/.
import { readdir, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const pagesDir = join(root, 'src', 'pages');

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(join(root, 'public'), dist, { recursive: true });

  const files = (await readdir(pagesDir)).filter((f) => f.endsWith('.mjs'));
  const modules = await Promise.all(files.map((f) => import(join(pagesDir, f))));
  const pages = modules.flatMap((m) => m.default);

  for (const page of pages) {
    const outDir = page.path === '/' ? dist : join(dist, page.path);
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, 'index.html'), page.render(), 'utf8');
    console.log(`  ${page.path.padEnd(38)} ${page.title}`);
  }
  console.log(`\nbuilt ${pages.length} pages into dist/`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
