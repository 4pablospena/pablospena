import { readFile, writeFile } from 'node:fs/promises';
import { todayInMadrid } from '../lib/content.mjs';

const [slug, ...extra] = process.argv.slice(2);
if (!slug || extra.length || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Uso: npm run post:new -- nombre-del-articulo');
  process.exitCode = 1;
} else {
  const template = await readFile(new URL('../content/templates/post.md', import.meta.url), 'utf8');
  const destination = new URL(`../content/posts/${slug}.md`, import.meta.url);
  try {
    await writeFile(destination, template.replace('{{date}}', todayInMadrid()), { flag: 'wx' });
    console.log(`Borrador creado en content/posts/${slug}.md. Edita el texto y cambia draft a false para publicarlo.`);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    console.error(`Ya existe content/posts/${slug}.md. El archivo se ha conservado.`);
    process.exitCode = 1;
  }
}
