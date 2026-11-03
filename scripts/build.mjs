import { readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
import { parsePost, projectCards } from '../lib/content.mjs';
import { blogIndex, blogArticle, rssFeed } from '../lib/templates.mjs';

export async function build(root = fileURLToPath(new URL('../', import.meta.url))) {
  const postsDirectory = join(root, 'content/posts');
  const posts = [];
  for (const filename of (await readdir(postsDirectory)).filter(name => name.endsWith('.md'))) {
    const post = parsePost(await readFile(join(postsDirectory, filename), 'utf8'), filename);
    if (post) posts.push(post);
  }
  posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  // Only generated pages are removed; article images live in assets/uploads.
  const blogDirectory = join(root, 'dist/blog');
  await rm(blogDirectory, { recursive: true, force: true });
  await mkdir(blogDirectory, { recursive: true });
  await writeFile(join(blogDirectory, 'index.html'), blogIndex(posts));
  await writeFile(join(blogDirectory, 'rss.xml'), rssFeed(posts));
  for (const [index, post] of posts.entries()) {
    const directory = join(blogDirectory, post.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'index.html'), blogArticle(post, index + 1));
  }
  await writeFile(join(root, 'dist/data/blog.json'), JSON.stringify({ posts: posts.map(({ html, ...post }) => post) }, null, 2) + '\n');
  const snapshot = JSON.parse(await readFile(join(root, 'dist/data/projects.json'), 'utf8'));
  const home = await readFile(join(root, 'dist/index.html'), 'utf8');
  if (!home.includes('<!-- project-list:start -->') || !home.includes('<!-- project-list:end -->')) throw new Error('Falta el marcador del catálogo de proyectos.');
  await writeFile(join(root, 'dist/index.html'), home.replace(/<!-- project-list:start -->[\s\S]*?<!-- project-list:end -->/, `<!-- project-list:start -->\n${projectCards(snapshot.projects)}\n<!-- project-list:end -->`));
  console.log(`Blog: ${posts.length} publicaciones. Proyectos: ${snapshot.projects.length}.`);
  return posts;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
