import { readFile, writeFile } from 'node:fs/promises';
import { selectProjects } from '../lib/content.mjs';

const config = JSON.parse(await readFile(new URL('../content/projects.json', import.meta.url), 'utf8'));
const repos = [];
for (let page = 1; ; page++) {
  const response = await fetch(`https://api.github.com/users/${config.user}/repos?per_page=100&sort=pushed&page=${page}`, { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`GitHub: ${response.status}. Se conserva la copia local.`);
  const batch = await response.json();
  repos.push(...batch);
  if (batch.length < 100) break;
}
const snapshot = { updatedAt: new Date().toISOString(), excluded: config.excluded, projects: selectProjects(repos, config) };
await writeFile(new URL('../dist/data/projects.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n');
console.log(`${snapshot.projects.length} proyectos actualizados desde GitHub.`);
