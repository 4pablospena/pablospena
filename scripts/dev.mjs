import { createServer } from 'node:http';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

await build();
const directory = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));

let rebuilding = false, pending = false, debounce;
async function rebuild() {
  if (rebuilding) { pending = true; return; }
  rebuilding = true;
  do {
    pending = false;
    try { await build(); console.log('Blog actualizado. Recarga el navegador para verlo.'); }
    catch (error) { console.error(`No se pudo actualizar el blog: ${error.message}`); }
  } while (pending);
  rebuilding = false;
}
watch(new URL('../content/posts/', import.meta.url), { recursive: true }, () => {
  clearTimeout(debounce);
  debounce = setTimeout(rebuild, 150);
});

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let path = resolve(directory, `.${decodeURIComponent(url.pathname)}`);
    if (path !== directory && !path.startsWith(directory + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const data = await readFile(path);
    res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain' });
    res.end(error.code === 'ENOENT' ? 'Página no encontrada.' : 'No se pudo servir la página.');
  }
});
const port = Number(process.env.PORT || 4173);
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
