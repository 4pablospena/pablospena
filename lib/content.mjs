import matter from 'gray-matter';
import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const markdown = new Marked({ gfm: true });
export const categories = { personal: 'Personal', trabajo: 'Trabajo' };
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
export const todayInMadrid = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export function renderMarkdown(source) {
  return sanitizeHtml(markdown.parse(source), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'title', 'loading'], code: ['class'] },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowProtocolRelative: false,
    transformTags: { img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }) }
  });
}

export function parsePost(source, filename, today = todayInMadrid()) {
  const { data, content } = matter(source);
  if (data.draft === true) return null;
  if (data.draft !== undefined && data.draft !== false) throw new Error(`${filename}: draft debe ser true o false`);
  const slug = filename.replace(/\.md$/, '');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${filename}: nombre de archivo no válido`);
  for (const field of ['title', 'summary']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) throw new Error(`${filename}: falta ${field}`);
  }
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date || '');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] || '';
  const originalDate = frontmatter.match(/^date:\s*['"]?(\d{4}-\d{2}-\d{2})/m)?.[1];
  if (originalDate && originalDate !== date) throw new Error(`${filename}: fecha no válida`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error(`${filename}: fecha no válida`);
  if (date > today) throw new Error(`${filename}: la fecha es futura; guarda el artículo como borrador`);
  if (typeof data.category !== 'string' || !Object.hasOwn(categories, data.category)) throw new Error(`${filename}: categoría no válida`);
  if (!content.trim()) throw new Error(`${filename}: el artículo está vacío`);
  return {
    slug, title: data.title.trim(), summary: data.summary.trim(), date, category: data.category,
    minutes: Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200)),
    url: `/blog/${slug}/`, html: renderMarkdown(content)
  };
}

export function selectProjects(repos, config) {
  const excluded = new Set(config.excluded.map(name => name.toLowerCase()));
  return repos.filter(repo => !repo.fork && !repo.archived && !repo.private && !excluded.has(repo.name.toLowerCase()))
    .sort((a, b) => String(b.pushed_at).localeCompare(String(a.pushed_at)))
    .map(repo => ({
      name: repo.name, title: repo.name, description: { es: repo.description || 'Proyecto personal en GitHub.', en: repo.description || 'A personal project on GitHub.' },
      category: { es: 'Proyecto', en: 'Project' }, stack: repo.language ? [repo.language] : [],
      ...config.overrides[repo.name], url: `https://github.com/${config.user}/${encodeURIComponent(repo.name)}`,
      website: repo.name === 'build-your-agents' ? repo.homepage : null,
      pushedAt: repo.pushed_at
    }));
}

export function projectCards(projects) {
  return projects.map((project, index) => `<article class="project-entry" data-repository="${escapeHTML(project.name)}">
    <div class="project-entry-meta"><span>${String(index + 1).padStart(2, '0')} / <span data-translation-text data-en="${escapeHTML(project.category.en)}">${escapeHTML(project.category.es)}</span></span><time datetime="${escapeHTML(project.pushedAt)}">${new Date(project.pushedAt).toLocaleDateString('es', { month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></div>
    <h3>${escapeHTML(project.title)}</h3><p data-translation-text data-en="${escapeHTML(project.description.en)}">${escapeHTML(project.description.es)}</p>
    <div class="tech-list">${project.stack.map(tech => `<span>${escapeHTML(tech)}</span>`).join('')}</div>
    <div class="project-entry-links"><a href="${escapeHTML(project.url)}" target="_blank" rel="noopener noreferrer" data-en="View code">Ver código</a>${project.website ? `<a href="${escapeHTML(project.website)}" target="_blank" rel="noopener noreferrer" data-en="Visit website">Visitar web</a>` : ''}</div>
  </article>`).join('\n');
}
