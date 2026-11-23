// Shared by the static build and the live catalog so both keep the same design.
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const artwork = new Set(['trazo', 'pulso', 'build-your-agents', 'siarem', 'facturas-excel-pdf', 'agentic-action-firewall']);
const groups = new Set(['products', 'agents', 'tools']);

export function safeWebsite(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function projectCards(projects, locale = 'es') {
  const english = locale === 'en';
  const translated = (value, className = '') => `<span${className ? ` class="${className}"` : ''} data-translation-text data-en="${escape(value.en)}">${escape(value[locale] || value.es)}</span>`;
  return projects.map(project => {
    const website = safeWebsite(project.website);
    const code = safeWebsite(project.url);
    const date = new Date(project.pushedAt);
    const dateLabel = Number.isNaN(date.valueOf()) ? '' : date.toLocaleDateString(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' });
    const image = artwork.has(project.name) ? project.name : 'project';
    return `<article class="project-entry${project.featured ? ' project-featured' : ''}" data-repository="${escape(project.name)}" data-project-group="${groups.has(project.group) ? project.group : 'tools'}">
      <div class="project-artwork"><img src="/assets/projects/${image}.svg" alt="" width="760" height="420" loading="lazy">${project.featured ? translated({ es: 'Último proyecto', en: 'Latest project' }, 'project-featured-label') : ''}</div>
      <div class="project-entry-content">
        <div class="project-entry-meta">${translated(project.category)}<time datetime="${escape(project.pushedAt)}">${escape(dateLabel)}</time></div>
        <h3>${escape(project.title)}</h3>
        <p data-translation-text data-en="${escape(project.description.en)}">${escape(project.description[locale] || project.description.es)}</p>
        <div class="tech-list">${project.stack.map(tech => `<span>${escape(tech)}</span>`).join('')}</div>
        <div class="project-entry-links">${code ? `<a href="${escape(code)}" target="_blank" rel="noopener noreferrer" data-translation-text data-en="View code">${english ? 'View code' : 'Ver código'}</a>` : ''}${website ? `<a class="project-website" href="${escape(website)}" target="_blank" rel="noopener noreferrer" data-translation-text data-en="Visit website">${english ? 'Visit website' : 'Visitar web'}</a>` : ''}</div>
      </div>
    </article>`;
  }).join('\n');
}
