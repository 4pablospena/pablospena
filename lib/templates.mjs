import { categories, escapeHTML as e } from './content.mjs';

const site = 'https://www.pablospena.com';
const dateLabel = date => new Date(`${date}T00:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const folio = number => String(number).padStart(2, '0');

function authorStamp() {
  return `<a class="author-stamp" href="/#sobre-mi"><img src="/assets/pablo-portrait.webp" alt="" width="72" height="64"><span>Pablo Suárez Peña<small>Asturias, España</small></span></a>`;
}

function archiveSidebar(post, number) {
  return `<aside class="archive-sidebar" aria-label="Ficha del cuaderno">
    <div class="archive-folio"><span class="micro-label" data-preview-label>${post ? 'Nota seleccionada' : 'Notas publicadas'}</span><span class="folio-number" data-preview-number aria-hidden="true">${folio(number)}</span></div>
    <dl class="archive-facts"><div><dt>Fecha</dt><dd data-preview-date>${post ? dateLabel(post.date) : 'Por escribir'}</dd></div><div><dt>Sección</dt><dd data-preview-category>${post ? categories[post.category] : 'Personal / Trabajo'}</dd></div><div><dt>Lectura</dt><dd data-preview-minutes>${post ? `${post.minutes} min` : 'A tu ritmo'}</dd></div></dl>
    <div class="archive-note"><span class="micro-label">Sobre estas notas</span><p data-preview-summary>${post ? e(post.summary) : 'Lo que aprendo en el trabajo y lo que me pasa fuera de él. Sin una frecuencia fija.'}</p></div>
    ${authorStamp()}
  </aside>`;
}

function layout({ title, description, path, content, article }) {
  const canonical = `${site}${path}`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)} · Pablo Suárez Peña</title><meta name="description" content="${e(description)}"><meta name="theme-color" content="#141c21">
<link rel="canonical" href="${canonical}"><meta property="og:type" content="${article ? 'article' : 'website'}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${canonical}">
${article ? `<meta property="article:published_time" content="${article.date}T00:00:00Z"><meta property="article:author" content="Pablo Suárez Peña">` : ''}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="Blog de Pablo Suárez Peña" href="/blog/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@400;500;600&family=Sora:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/blog.css"><script src="/blog.js" defer></script></head>
<body class="${article ? 'article-page' : 'archive-page'}"><a class="skip-link" href="#contenido">Saltar al contenido</a><div class="journal-frame">
<header class="journal-header"><a class="journal-brand" href="/" aria-label="Pablo Suárez Peña, inicio">pablo suárez peña<span class="brand-period" aria-hidden="true">.</span></a><a class="journal-name" href="/blog/" aria-current="page">Cuaderno<span>Personal / Trabajo</span></a><nav aria-label="Navegación principal"><a href="/">Inicio</a><a href="/#proyectos">Proyectos <span aria-hidden="true">↗</span></a></nav></header>
<main id="contenido" class="${article ? 'article-layout' : 'archive-layout'}">${content}</main>
<footer class="journal-footer"><span>© Pablo Suárez Peña</span><span>Un archivo en construcción.</span><nav aria-label="Enlaces del blog"><a href="/blog/rss.xml">RSS <span aria-hidden="true">↗</span></a><a href="mailto:pablosuarezpena4it@outlook.com">Escríbeme <span aria-hidden="true">↗</span></a></nav></footer>
</div>
</body></html>\n`;
}

export function postCard(post, index) {
  return `<article class="journal-entry${index === 0 ? ' is-selected' : ''}" data-post data-number="${folio(index + 1)}" data-category="${post.category}" data-summary="${e(post.summary)}" data-date="${dateLabel(post.date)}" data-minutes="${post.minutes}" data-search="${e(`${post.title} ${post.summary}`)}">
    <span class="entry-index" aria-hidden="true">[${folio(index + 1)}]</span><div class="entry-body"><div class="entry-meta"><span>${categories[post.category]}</span><time datetime="${post.date}">${dateLabel(post.date)}</time></div>
    <h2><a href="${post.url}">${e(post.title)}</a></h2><p class="entry-summary">${e(post.summary)}</p></div><span class="entry-arrow" aria-hidden="true">↗</span>
  </article>`;
}

export function blogIndex(posts) {
  return layout({ title: 'Cuaderno — Blog', description: 'Notas personales y de trabajo de Pablo Suárez Peña. Desarrollo, producto y lo que voy aprendiendo.', path: '/blog/', content: `
  ${archiveSidebar(posts[0], posts.length ? 1 : 0)}
  <section class="archive-content" aria-labelledby="blog-title"><div class="archive-heading"><h1 id="blog-title">Índice de notas</h1><span class="micro-label">Más recientes primero <span aria-hidden="true">↓</span></span></div>
  <div class="journal-list">${posts.map(postCard).join('')}</div>
  <div class="journal-empty" data-empty ${posts.length ? 'hidden' : ''}><span class="empty-eyebrow">${posts.length ? 'Búsqueda / 0 resultados' : 'Cuaderno abierto / 0 notas'}</span><h2>${posts.length ? 'Nada por<br><span>aquí.</span>' : 'Todavía<br><span>por escribir.</span>'}</h2><div class="empty-bottom"><span class="empty-symbol" aria-hidden="true">↳</span><div><p>${posts.length ? 'Prueba con otra palabra o cambia de sección.' : 'Este cuaderno aún no tiene notas publicadas. Las próximas aparecerán aquí.'}</p><a href="${posts.length ? '/blog/' : '/#proyectos'}">${posts.length ? 'Ver todas las notas' : 'Explorar los proyectos'} <span aria-hidden="true">↗</span></a></div></div></div>
  </section>
  <aside class="archive-tools" aria-label="Explorar el archivo"><span class="micro-label">Secciones</span><nav class="journal-filters" aria-label="Filtrar publicaciones"><button type="button" data-category-filter="all" aria-pressed="true">Todas <span>${folio(posts.length)}</span></button>${Object.entries(categories).map(([value, label]) => `<button type="button" data-category-filter="${value}" aria-pressed="false">${label} <span>${folio(posts.filter(post => post.category === value).length)}</span></button>`).join('')}</nav><label class="journal-search"><span class="micro-label">Buscar en el archivo</span><span class="search-field"><input type="search" name="q" placeholder="Una palabra…" aria-label="Buscar publicaciones" autocomplete="off"><span aria-hidden="true">↵</span></span></label>
  <p class="journal-results" data-results role="status" aria-live="polite">${posts.length} ${posts.length === 1 ? 'nota publicada' : 'notas publicadas'}</p><div class="archive-colophon"><span class="status-mark">En curso</span><p>Escribo cuando tengo<br>algo que contar.</p><a href="/blog/rss.xml">Seguir por RSS <span aria-hidden="true">↗</span></a></div></aside>` });
}

export function blogArticle(post, number = 1) {
  return layout({ title: post.title, description: post.summary, path: post.url, article: post, content: `
  ${archiveSidebar(post, number)}
  <article class="journal-article"><a class="back-link" href="/blog/">← Volver al índice</a><header class="article-header"><div class="entry-meta"><a class="category-label" href="/blog/?category=${post.category}">${categories[post.category]}</a><span>Nota ${folio(number)}</span></div><h1>${e(post.title)}</h1><p class="article-summary">${e(post.summary)}</p><div class="article-byline">Escrito por Pablo Suárez Peña<time datetime="${post.date}">${dateLabel(post.date)}</time></div></header><div class="article-prose">${post.html}</div><footer class="article-end"><span>Fin de la nota / ${folio(number)}</span><a href="/blog/">Todas las notas <span aria-hidden="true">↗</span></a></footer></article>
  <aside class="article-margin" aria-label="Navegación de lectura"><nav class="article-outline" aria-label="En esta nota" data-outline hidden><span class="micro-label">En esta nota</span><ol data-outline-list></ol></nav><div class="reading-status" data-reading-status hidden><label class="micro-label" for="reading-progress">Lectura <span data-reading-value>0%</span></label><progress id="reading-progress" max="100" value="0">0%</progress></div><a class="margin-back" href="/blog/">← Índice de notas</a></aside>` });
}

export function rssFeed(posts) {
  return `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Blog de Pablo Suárez Peña</title><link>${site}/blog/</link><description>Notas personales y de trabajo.</description><language>es</language><atom:link href="${site}/blog/rss.xml" rel="self" type="application/rss+xml"/>${posts.map(post => `<item><title>${e(post.title)}</title><link>${site}${post.url}</link><guid isPermaLink="true">${site}${post.url}</guid><description>${e(post.summary)}</description><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate></item>`).join('')}</channel></rss>\n`;
}
