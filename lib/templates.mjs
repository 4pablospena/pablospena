import { categories, escapeHTML as e } from './content.mjs';

const site = 'https://www.pablospena.com';
const dateLabel = date => new Date(`${date}T00:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function layout({ title, description, path, content, article }) {
  const canonical = `${site}${path}`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)} · Pablo Suárez Peña</title><meta name="description" content="${e(description)}"><meta name="theme-color" content="#141c21">
<link rel="canonical" href="${canonical}"><meta property="og:type" content="${article ? 'article' : 'website'}"><meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${canonical}">
${article ? `<meta property="article:published_time" content="${article.date}T00:00:00Z"><meta property="article:author" content="Pablo Suárez Peña">` : ''}
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="Blog de Pablo Suárez Peña" href="/blog/rss.xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600&family=Sora:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/blog.css"><script src="/blog.js" defer></script></head>
<body><a class="skip-link" href="#contenido">Saltar al contenido</a>
<header class="journal-header"><a class="journal-brand" href="/">Pablo Suárez Peña<span>un trabajo en evolución</span></a><nav aria-label="Navegación principal"><a href="/#proyectos">Proyectos</a><a href="/blog/" aria-current="page">Blog</a></nav></header>
<main id="contenido">${content}</main>
<footer class="journal-footer"><div><a href="/">Pablo Suárez Peña</a><span>Desde Asturias.</span></div><nav aria-label="Enlaces del blog"><a href="/blog/rss.xml">RSS</a><a href="mailto:pablosuarezpena4it@outlook.com">Contacto</a></nav></footer>
</body></html>\n`;
}

export function postCard(post, index) {
  return `<article class="journal-entry" data-post data-category="${post.category}" data-search="${e(`${post.title} ${post.summary}`)}">
    <div class="entry-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div><div class="entry-body">
    <div class="entry-meta"><span class="category-label">${categories[post.category]}</span><time datetime="${post.date}">${dateLabel(post.date)}</time><span>${post.minutes} min de lectura</span></div>
    <h2><a href="${post.url}">${e(post.title)}</a></h2><p>${e(post.summary)}</p></div><span class="entry-arrow" aria-hidden="true">↗</span>
  </article>`;
}

export function blogIndex(posts) {
  return layout({ title: 'Blog', description: 'Notas personales y de trabajo de Pablo Suárez Peña. Desarrollo, producto y lo que voy aprendiendo.', path: '/blog/', content: `
  <section class="journal-intro" aria-labelledby="blog-title"><span class="journal-kicker">05 / blog · notas de Pablo</span><h1 id="blog-title">Lo que voy<br><em>aprendiendo.</em></h1><div class="journal-intro-bottom"><p>Sobre el trabajo, los proyectos y lo que pasa fuera de la pantalla. Un espacio para escribir de vez en cuando.</p><span class="journal-edition">Personal &amp; trabajo<br>Sin una frecuencia fija.</span></div></section>
  <section class="journal-posts" aria-label="Publicaciones"><div class="journal-tools"><nav class="journal-filters" aria-label="Filtrar publicaciones"><button type="button" data-category-filter="all" aria-pressed="true">Todo <span>${posts.length}</span></button>${Object.entries(categories).map(([value, label]) => `<button type="button" data-category-filter="${value}" aria-pressed="false">${label} <span>${posts.filter(post => post.category === value).length}</span></button>`).join('')}</nav><label class="journal-search"><span>Buscar</span><input type="search" name="q" placeholder="Buscar una nota…" aria-label="Buscar publicaciones" autocomplete="off"></label></div>
  <p class="journal-results" data-results role="status" aria-live="polite">${posts.length} ${posts.length === 1 ? 'publicación' : 'publicaciones'}</p>
  <div class="journal-list">${posts.map(postCard).join('')}</div>
  <div class="journal-empty" data-empty ${posts.length ? 'hidden' : ''}><span class="empty-mark" aria-hidden="true">[ … ]</span><h2>${posts.length ? 'No hay notas con esa búsqueda.' : 'Las primeras notas llegarán aquí.'}</h2><p>${posts.length ? 'Prueba con otro término o cambia de categoría.' : 'Unas serán personales. Otras saldrán del trabajo y de lo que voy construyendo.'}</p><a href="${posts.length ? '/blog/' : '/#proyectos'}">${posts.length ? 'Ver todas las publicaciones' : 'Mientras tanto, ver los proyectos'}</a></div>
  </section>` });
}

export function blogArticle(post) {
  return layout({ title: post.title, description: post.summary, path: post.url, article: post, content: `
  <article class="journal-article"><a class="back-link" href="/blog/">← Todas las notas</a><header class="article-header"><div class="entry-meta"><a class="category-label" href="/blog/?category=${post.category}">${categories[post.category]}</a><time datetime="${post.date}">${dateLabel(post.date)}</time><span>${post.minutes} min de lectura</span></div><h1>${e(post.title)}</h1><p class="article-summary">${e(post.summary)}</p><div class="article-byline"><img src="/assets/pablo-portrait.webp" alt="" width="44" height="44"><span>Por Pablo Suárez Peña</span></div></header><div class="article-prose">${post.html}</div><footer class="article-end"><span>Gracias por leer.</span><a href="/blog/">Volver al blog</a></footer></article>` });
}

export function rssFeed(posts) {
  return `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Blog de Pablo Suárez Peña</title><link>${site}/blog/</link><description>Notas personales y de trabajo.</description><language>es</language><atom:link href="${site}/blog/rss.xml" rel="self" type="application/rss+xml"/>${posts.map(post => `<item><title>${e(post.title)}</title><link>${site}${post.url}</link><guid isPermaLink="true">${site}${post.url}</guid><description>${e(post.summary)}</description><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate></item>`).join('')}</channel></rss>\n`;
}
