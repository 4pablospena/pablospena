import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parsePost, renderMarkdown, selectProjects, projectCards } from '../lib/content.mjs';
import { safeWebsite } from '../dist/project-renderer.js';
import { build } from '../scripts/build.mjs';

const article = (metadata = '', body = 'Un texto con **formato**.') => `---\ntitle: Una nota\nsummary: Un resumen personal.\ndate: '2026-01-10'\ncategory: personal\n${metadata}---\n${body}`;

test('publica artículos con fecha, categoría, lectura y URL propia', () => {
  const post = parsePost(article(), 'una-nota.md', '2026-11-03');
  assert.equal(post.url, '/blog/una-nota/');
  assert.equal(post.minutes, 1);
  assert.match(post.html, /<strong>formato<\/strong>/);
});

test('los borradores incompletos no se publican', () => {
  assert.equal(parsePost('---\ndraft: true\n---\nUna nota privada.', 'borrador.md'), null);
});

test('rechaza categorías, fechas y estados incorrectos', () => {
  assert.throws(() => parsePost(article().replace('category: personal', 'category: constructor'), 'nota.md'), /categoría/);
  assert.throws(() => parsePost(article().replace('2026-01-10', '2026-02-30'), 'nota.md'), /fecha/);
  assert.throws(() => parsePost(article().replace("'2026-01-10'", '2026-02-30'), 'nota.md'), /fecha/);
  assert.throws(() => parsePost(article(), '../nota.md'), /nombre de archivo/);
  assert.throws(() => parsePost(article('draft: "false"\n'), 'nota.md'), /draft/);
  assert.throws(() => parsePost(article().replace('2026-01-10', '2099-01-10'), 'nota.md'), /futura/);
  assert.throws(() => parsePost(article('', ''), 'nota.md'), /vacío/);
});

test('el contenido no ejecuta scripts, eventos ni URLs javascript o data', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n<img src="/assets/photo.png" onerror="alert(2)">\n\n[abrir](javascript:alert%281%29)\n\n![imagen](data:text/html,hello)');
  assert.doesNotMatch(html, /<script|onerror|javascript:|data:text/);
  assert.match(html, /src="\/assets\/photo.png"/);
  assert.match(html, /loading="lazy"/);
});

test('conserva código, listas, tablas y enlaces seguros', () => {
  const html = renderMarkdown('```js\nconst n = 1;\n```\n\n- Primero\n- Segundo\n\n[Web](https://example.com)\n\n| A | B |\n| - | - |\n| 1 | 2 |');
  assert.match(html, /<pre><code class="language-js">/);
  assert.match(html, /<li>Primero/);
  assert.match(html, /href="https:\/\/example.com"/);
  assert.match(html, /<table>/);
});

test('excluye Mission Control, forks, archivados y repos privados', () => {
  const config = { user: '4pablospena', excluded: ['Agentic-missioncontrol'], overrides: {} };
  const repos = [
    { name: 'AGENTIC-MISSIONCONTROL' }, { name: 'fork', fork: true },
    { name: 'archive', archived: true }, { name: 'private', private: true },
    { name: 'old', pushed_at: '2025-01-01', html_url: 'https://github.com/old' },
    { name: 'pulso', pushed_at: '2026-11-02', html_url: 'https://github.com/pulso' }
  ];
  assert.deepEqual(selectProjects(repos, config).map(project => project.name), ['pulso', 'old']);
});

test('publica las webs HTTPS de todos los proyectos y rechaza URLs ejecutables o con credenciales', () => {
  const config = { user: '4pablospena', excluded: [], overrides: {} };
  const projects = selectProjects([
    { name: 'pulso', homepage: 'https://pulso.example/', pushed_at: '2026-11-02' },
    { name: 'unsafe', homepage: 'javascript:alert(1)', pushed_at: '2026-11-01' }
  ], config);
  assert.equal(projects[0].website, 'https://pulso.example/');
  assert.equal(projects[1].website, null);
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', '//example.com', 'https://user:secret@example.com', null]) {
    assert.equal(safeWebsite(url), null);
  }
});

test('el catálogo comparte traducciones y filtros, escapando contenido de GitHub', () => {
  const project = {
    name: 'trazo', title: '<script>alert(1)</script>', featured: true, group: 'tools',
    category: { es: 'Lienzo + IA', en: 'Canvas + AI' },
    description: { es: '<img src=x onerror="alert(1)">', en: 'A canvas & AI' },
    stack: ['React', '<svg onload=alert(1)>'], pushedAt: '2026-11-22T19:22:35Z',
    url: 'https://github.com/4pablospena/trazo', website: 'javascript:alert(1)'
  };
  const spanish = projectCards([project]);
  const english = projectCards([project], 'en');
  assert.match(spanish, /data-project-group="tools"/);
  assert.match(spanish, /project-featured/);
  assert.match(spanish, /\/assets\/projects\/trazo.svg/);
  assert.doesNotMatch(spanish, /<script|<img src=x|<svg onload|href="javascript:/);
  assert.match(english, />Canvas \+ AI<|>Latest project</);
  assert.match(english, />A canvas &amp; AI<\/p>/);
  assert.match(english, />View code<\/a>/);
  assert.match(projectCards([{ ...project, name: '../../unknown', group: 'unexpected' }]), /\/assets\/projects\/project.svg/);
});

test('el blog publica, actualiza y retira artículos al editar sus archivos Markdown', async t => {
  const root = await mkdtemp(join(tmpdir(), 'pspweb-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'content/posts'), { recursive: true });
  await mkdir(join(root, 'dist/data'), { recursive: true });
  await mkdir(join(root, 'dist/blog/retirada'), { recursive: true });
  await writeFile(join(root, 'dist/blog/retirada/index.html'), 'Antigua publicación');
  await writeFile(join(root, 'dist/index.html'), '<!-- project-list:start --><!-- project-list:end -->');
  await writeFile(join(root, 'dist/data/projects.json'), '{"projects": []}');
  await writeFile(join(root, 'content/posts/nota.md'), article());
  await writeFile(join(root, 'content/posts/borrador.md'), article('draft: true\n', 'BORRADOR_SECRETO'));
  await build(root);
  const files = await readdir(join(root, 'dist/blog'));
  assert.deepEqual(files.sort(), ['index.html', 'nota', 'rss.xml']);
  const index = await readFile(join(root, 'dist/blog/index.html'), 'utf8');
  assert.match(index, /\/blog\/nota\//);
  assert.doesNotMatch(index, /BORRADOR_SECRETO|borrador/);
  assert.doesNotMatch(index, /\/admin\/|Acceso de autor/);
  const feed = JSON.parse(await readFile(join(root, 'dist/data/blog.json'), 'utf8'));
  assert.equal(feed.posts.length, 1);
  assert.equal(feed.posts[0].category, 'personal');
  assert.equal(feed.posts[0].html, undefined);
  const rss = await readFile(join(root, 'dist/blog/rss.xml'), 'utf8');
  assert.match(rss, /<guid isPermaLink="true">https:\/\/www.pablospena.com\/blog\/nota\//);
  await writeFile(join(root, 'content/posts/nota.md'), article().replace('Una nota', 'Una nota editada'));
  await build(root);
  assert.match(await readFile(join(root, 'dist/blog/nota/index.html'), 'utf8'), /<h1>Una nota editada<\/h1>/);
  assert.match(await readFile(join(root, 'dist/blog/rss.xml'), 'utf8'), /<title>Una nota editada<\/title>/);
  await writeFile(join(root, 'content/posts/nota.md'), article('draft: true\n'));
  await build(root);
  assert.deepEqual((await readdir(join(root, 'dist/blog'))).sort(), ['index.html', 'rss.xml']);
  assert.deepEqual(JSON.parse(await readFile(join(root, 'dist/data/blog.json'), 'utf8')).posts, []);
});
