// Live sections rendered inside the portrait deck: GitHub activity and writing.
(() => {
  const USER = '4pablospena';
  const CACHE_KEY = 'psp-feeds-v1';
  const CACHE_TTL = 15 * 60 * 1000;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const strings = {
    es: {
      title: ['El código,', 'en movimiento.'],
      lead: 'Commits, revisiones y experimentos. Lo que construyo, a la vista.',
      recentTitle: 'actividad reciente',
      reposTitle: 'repositorios',
      year: 'último año',
      tabs: ['resumen', 'reciente', 'repos'],
      stats: ['contribuciones · último año', 'días con actividad', 'racha más larga', 'repos públicos'],
      days: n => `${n} ${n === 1 ? 'día' : 'días'}`,
      contributions: (n, date) => `${n} ${n === 1 ? 'contribución' : 'contribuciones'} · ${date}`,
      less: 'menos', more: 'más',
      langs: 'lenguajes en mis repositorios',
      loading: 'Cargando actividad…',
      error: 'GitHub no responde ahora mismo. El código sigue ahí.',
      source: 'en vivo · API pública de GitHub',
      profile: 'perfil en GitHub ↗',
      noDescription: 'Sin descripción, de momento.',
      lastPush: (when, repo) => `Último push ${when} · ${repo}`,
      homeTotal: 'contribuciones en el último año',
      homeActive: n => `${n} días con actividad`,
      events: {
        PushEvent: p => `push a ${branch(p.ref)}`,
        CreateEvent: p => p.ref_type === 'repository' ? 'creó el repositorio' : `creó ${p.ref_type === 'branch' ? 'la rama' : p.ref_type} ${p.ref || ''}`,
        DeleteEvent: p => `borró ${p.ref_type === 'branch' ? 'la rama' : p.ref_type} ${p.ref || ''}`,
        PullRequestEvent: p => `${({ opened: 'abrió', closed: 'cerró', reopened: 'reabrió', merged: 'fusionó' })[p.action] || p.action} un pull request`,
        PullRequestReviewEvent: () => 'revisó un pull request',
        PullRequestReviewCommentEvent: () => 'comentó en una revisión',
        IssuesEvent: p => `${({ opened: 'abrió', closed: 'cerró', reopened: 'reabrió' })[p.action] || p.action} una issue`,
        IssueCommentEvent: () => 'comentó en una issue',
        WatchEvent: () => 'marcó con estrella',
        ForkEvent: () => 'hizo fork',
        ReleaseEvent: () => 'publicó una release',
        PublicEvent: () => 'hizo público el repositorio'
      },
      writing: {
        head: 'posts y redacciones',
        title: ['Lo que aprendo,', 'por escrito.'],
        lead: 'Posts y redacciones sobre producto, desarrollo y agentes de IA.',
        count: n => `${n} ${n === 1 ? 'escrito' : 'escritos'}`,
        read: 'leer',
        emptyTitle: 'Escribiendo el siguiente.',
        emptyCopy: 'Comparto lo que aprendo construyendo producto y agentes. Mientras llegan aquí, lo encuentras en mi actividad de LinkedIn.',
        all: 'ver todo en LinkedIn'
      }
    },
    en: {
      title: ['Code,', 'in motion.'],
      lead: 'Commits, reviews and experiments. What I build, in the open.',
      recentTitle: 'recent activity',
      reposTitle: 'repositories',
      year: 'last year',
      tabs: ['overview', 'recent', 'repos'],
      stats: ['contributions · last year', 'active days', 'longest streak', 'public repos'],
      days: n => `${n} ${n === 1 ? 'day' : 'days'}`,
      contributions: (n, date) => `${n} ${n === 1 ? 'contribution' : 'contributions'} · ${date}`,
      less: 'less', more: 'more',
      langs: 'languages across my repositories',
      loading: 'Loading activity…',
      error: 'GitHub is not answering right now. The code is still there.',
      source: 'live · GitHub public API',
      profile: 'GitHub profile ↗',
      noDescription: 'No description, for now.',
      lastPush: (when, repo) => `Last push ${when} · ${repo}`,
      homeTotal: 'contributions in the last year',
      homeActive: n => `${n} active days`,
      events: {
        PushEvent: p => `pushed to ${branch(p.ref)}`,
        CreateEvent: p => p.ref_type === 'repository' ? 'created the repository' : `created ${p.ref_type} ${p.ref || ''}`,
        DeleteEvent: p => `deleted ${p.ref_type} ${p.ref || ''}`,
        PullRequestEvent: p => `${p.action} a pull request`,
        PullRequestReviewEvent: () => 'reviewed a pull request',
        PullRequestReviewCommentEvent: () => 'commented on a review',
        IssuesEvent: p => `${p.action} an issue`,
        IssueCommentEvent: () => 'commented on an issue',
        WatchEvent: () => 'starred',
        ForkEvent: () => 'forked',
        ReleaseEvent: () => 'published a release',
        PublicEvent: () => 'made the repository public'
      },
      writing: {
        head: 'posts and writing',
        title: ['What I learn,', 'in writing.'],
        lead: 'Posts and pieces on product, development and AI agents.',
        count: n => `${n} ${n === 1 ? 'piece' : 'pieces'}`,
        read: 'read',
        emptyTitle: 'Writing the next one.',
        emptyCopy: 'I share what I learn building product and agents. Until it lands here, you can find it in my LinkedIn activity.',
        all: 'see everything on LinkedIn'
      }
    }
  };
  const TYPE_LABELS = {
    PushEvent: 'push', CreateEvent: 'create', DeleteEvent: 'delete', PullRequestEvent: 'pr',
    PullRequestReviewEvent: 'review', PullRequestReviewCommentEvent: 'review', IssuesEvent: 'issue',
    IssueCommentEvent: 'comment', WatchEvent: 'star', ForkEvent: 'fork', ReleaseEvent: 'release', PublicEvent: 'public'
  };
  const LINKEDIN_ACTIVITY = 'https://www.linkedin.com/in/pablospena/recent-activity/all/';

  function branch(ref = '') { return ref.replace('refs/heads/', ''); }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function relative(iso, locale) {
    const seconds = (new Date(iso) - Date.now()) / 1000;
    const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    for (const [unit, size] of units) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
    return format.format(Math.round(seconds), 'second');
  }
  function shortDate(iso, locale, withYear = true) {
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}), timeZone: 'UTC' });
  }

  async function getJSON(url) {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.json();
  }

  // The unauthenticated GitHub API allows 60 requests per hour per IP, so the
  // last good response is kept and reused whenever a source fails.
  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch { return null; }
  }
  let githubPromise;
  function loadGitHub() {
    if (githubPromise) return githubPromise;
    const cached = readCache();
    if (cached && Date.now() - cached.at < CACHE_TTL) return (githubPromise = Promise.resolve(cached.data));
    const stale = cached?.data || {};
    githubPromise = Promise.allSettled([
      getJSON(`https://api.github.com/users/${USER}`),
      getJSON(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=30`),
      getJSON(`https://api.github.com/users/${USER}/events/public?per_page=40`),
      getJSON(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`)
    ]).then(([user, repos, events, calendar]) => {
      const data = {
        user: user.value || stale.user || null,
        repos: repos.value || stale.repos || [],
        events: events.value || stale.events || [],
        calendar: calendar.value || stale.calendar || null
      };
      if (!data.user && !data.calendar && !data.events.length) throw new Error('github unavailable');
      const complete = [user, repos, events, calendar].every(result => result.status === 'fulfilled');
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: complete ? Date.now() : cached?.at || 0, data })); } catch { /* quota */ }
      return data;
    });
    githubPromise.catch(() => { githubPromise = null; });
    return githubPromise;
  }

  let writingPromise;
  function loadWriting() {
    writingPromise ||= getJSON('/data/writing.json')
      .then(data => (data.posts || []).filter(post => post.title && post.url).sort((a, b) => String(b.date).localeCompare(String(a.date))))
      .catch(() => []);
    return writingPromise;
  }

  function calendarStats(calendar) {
    const days = calendar?.contributions || [];
    let longest = 0, run = 0, active = 0;
    days.forEach(day => {
      if (day.count > 0) { active++; run++; longest = Math.max(longest, run); } else run = 0;
    });
    return { total: calendar?.total?.lastYear ?? days.reduce((sum, day) => sum + day.count, 0), active, longest };
  }

  function heatmap(calendar, t, locale) {
    const days = calendar.contributions;
    const wrap = el('figure', 'gh-heatmap');
    const grid = el('div', 'gh-grid');
    grid.setAttribute('role', 'img');
    const offset = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
    for (let i = 0; i < offset; i++) grid.append(el('span', 'gh-cell is-pad'));
    days.forEach((day, i) => {
      const cell = el('span', 'gh-cell');
      cell.dataset.level = day.level;
      cell.style.setProperty('--col', Math.floor((i + offset) / 7));
      cell.title = t.contributions(day.count, shortDate(day.date, locale));
      grid.append(cell);
    });
    grid.style.setProperty('--weeks', Math.ceil((days.length + offset) / 7));
    const stats = calendarStats(calendar);
    grid.setAttribute('aria-label', `${stats.total} ${t.stats[0]}`);
    const legend = el('figcaption', 'gh-legend');
    legend.append(el('span', '', t.less));
    for (let level = 0; level <= 4; level++) { const swatch = el('span', 'gh-cell'); swatch.dataset.level = level; legend.append(swatch); }
    legend.append(el('span', '', t.more));
    wrap.append(grid, legend);
    return wrap;
  }

  function statBlock(value, label) {
    const block = el('div', 'gh-stat');
    const number = el('strong', '', value);
    block.append(number, el('span', '', label));
    return block;
  }

  function countUp(root) {
    if (reducedMotion.matches) return;
    root.querySelectorAll('.gh-stat strong').forEach(node => {
      const match = node.textContent.match(/^(\d[\d.,]*)(.*)$/);
      if (!match) return;
      const target = Number(match[1].replace(/[.,]/g, ''));
      const suffix = match[2];
      const start = performance.now();
      const formatter = new Intl.NumberFormat(document.documentElement.lang, { useGrouping: 'always' });
      const tick = now => {
        const progress = Math.min(1, (now - start) / 900);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = formatter.format(Math.round(target * eased)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function overview(data, t, locale) {
    const box = el('div', 'gh-overview');
    const numbers = new Intl.NumberFormat(locale, { useGrouping: 'always' });
    const stats = el('div', 'gh-stats');
    if (data.calendar) {
      const s = calendarStats(data.calendar);
      stats.append(statBlock(numbers.format(s.total), t.stats[0]), statBlock(numbers.format(s.active), t.stats[1]), statBlock(t.days(s.longest), t.stats[2]));
    }
    const publicRepos = data.user?.public_repos ?? data.repos.length;
    if (publicRepos) stats.append(statBlock(String(publicRepos), t.stats[3]));
    box.append(stats);
    if (data.calendar?.contributions?.length) box.append(heatmap(data.calendar, t, locale));
    const langs = languages(data.repos, t);
    if (langs) box.append(langs);
    return box;
  }

  function languages(repoList, t) {
    const counts = new Map();
    repoList.filter(repo => !repo.fork && repo.language).forEach(repo => counts.set(repo.language, (counts.get(repo.language) || 0) + 1));
    const sorted = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (!sorted.length) return null;
    const box = el('div', 'gh-langs');
    const bar = el('div', 'gh-langs-bar');
    const list = el('ul', 'gh-langs-list');
    sorted.forEach(([name, count], i) => {
      const tone = String(1 - i * .18);
      const segment = el('span');
      segment.style.setProperty('--share', count); segment.style.setProperty('--tone', tone); segment.style.setProperty('--i', i);
      bar.append(segment);
      const item = el('li', '', name);
      item.style.setProperty('--tone', tone);
      item.append(el('b', '', String(count)));
      list.append(item);
    });
    bar.setAttribute('aria-hidden', 'true');
    box.append(el('span', 'gh-langs-title', t.langs), bar, list);
    return box;
  }

  function groupEvents(events) {
    const groups = [];
    events.forEach(event => {
      const last = groups.at(-1);
      const sameDay = last && last.event.created_at.slice(0, 10) === event.created_at.slice(0, 10);
      if (last && sameDay && last.event.type === event.type && last.event.repo.name === event.repo.name) last.count++;
      else groups.push({ event, count: 1 });
    });
    return groups;
  }

  function recent(data, t, locale) {
    const list = el('ol', 'gh-events');
    groupEvents(data.events).slice(0, 8).forEach(({ event, count }) => {
      const describe = t.events[event.type];
      if (!describe) return;
      const item = el('li', 'gh-event');
      item.style.setProperty('--i', list.children.length);
      const type = el('span', 'gh-event-type', TYPE_LABELS[event.type] || event.type.replace('Event', '').toLowerCase());
      const body = el('div', 'gh-event-body');
      const link = el('a', '', event.repo.name.replace(`${USER}/`, ''));
      link.href = `https://github.com/${event.repo.name}`; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const what = el('p', '', `${describe(event.payload || {})}${count > 1 ? ` ×${count}` : ''}`);
      body.append(link, what);
      const when = el('time', 'gh-event-time', relative(event.created_at, locale));
      when.dateTime = event.created_at;
      item.append(type, body, when);
      list.append(item);
    });
    return list.children.length ? list : el('p', 'live-loading', t.error);
  }

  function repos(data, t, locale) {
    const list = el('ul', 'gh-repos');
    data.repos.filter(repo => !repo.fork && repo.name !== USER).slice(0, 6).forEach((repo, i) => {
      const item = el('li', 'gh-repo');
      item.style.setProperty('--i', i);
      const link = el('a', 'gh-repo-name', repo.name);
      link.href = repo.html_url; link.target = '_blank'; link.rel = 'noopener noreferrer';
      const meta = el('span', 'gh-repo-meta', [repo.language, relative(repo.pushed_at, locale)].filter(Boolean).join(' · '));
      item.append(link, el('p', '', repo.description || t.noDescription), meta);
      list.append(item);
    });
    return list.children.length ? list : el('p', 'live-loading', t.error);
  }

  function shell(tabs) {
    const root = el('div', 'portrait-deck live-deck');
    const nav = el(tabs ? 'nav' : 'div', tabs ? 'deck-tabs' : 'deck-tabs feed-head');
    const article = el('article', 'deck-card');
    article.tabIndex = 0;
    article.setAttribute('aria-live', 'polite');
    const foot = el('div', 'deck-controls live-foot');
    root.append(nav, article, foot);
    return { root, nav, article, foot };
  }

  function footLink(foot, text, href, label) {
    const note = el('span', 'live-source');
    note.append(el('i', 'live-dot'), document.createTextNode(label));
    const link = el('a', '', text);
    link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer';
    foot.replaceChildren(note, link);
  }

  function renderActivity(body, locale) {
    const t = strings[locale] || strings.es;
    const { root, nav, article, foot } = shell(true);
    footLink(foot, t.profile, `https://github.com/${USER}`, t.source);
    article.append(el('p', 'live-loading', t.loading));
    body.replaceChildren(root);
    loadGitHub().then(data => {
      if (!root.isConnected) return;
      const views = [overview, recent, repos];
      const show = index => {
        [...nav.children].forEach((button, n) => button.setAttribute('aria-pressed', String(n === index)));
        article.replaceChildren(views[index](data, t, locale));
        article.scrollTop = 0;
        if (index === 0) countUp(article);
      };
      t.tabs.forEach((label, index) => {
        const button = el('button', '', label);
        button.type = 'button';
        button.addEventListener('click', () => show(index));
        button.addEventListener('keydown', event => {
          const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
          if (!step) return;
          event.preventDefault();
          const next = (index + step + views.length) % views.length;
          show(next); nav.children[next].focus();
        });
        nav.append(button);
      });
      show(0);
    }).catch(() => {
      if (!root.isConnected) return;
      article.replaceChildren(el('p', 'live-loading', t.error));
    });
  }

  function renderWriting(body, locale) {
    const t = (strings[locale] || strings.es).writing;
    const { root, nav, article, foot } = shell(false);
    nav.append(el('span', '', t.head));
    footLink(foot, t.all, LINKEDIN_ACTIVITY, 'linkedin');
    body.replaceChildren(root);
    loadWriting().then(posts => {
      if (!root.isConnected) return;
      if (!posts.length) {
        const empty = el('div', 'writing-empty');
        empty.append(el('h2', '', t.emptyTitle), el('p', '', t.emptyCopy));
        const link = el('a', '', t.all);
        link.href = LINKEDIN_ACTIVITY; link.target = '_blank'; link.rel = 'noopener noreferrer';
        empty.append(link);
        article.replaceChildren(empty);
        return;
      }
      nav.append(el('span', 'feed-count', t.count(posts.length)));
      const list = el('ol', 'writing-list');
      posts.forEach((post, i) => {
        const item = el('li', 'writing-item');
        item.style.setProperty('--i', i);
        const meta = el('span', 'writing-meta', [post.platform || 'linkedin', post.date && shortDate(post.date, locale)].filter(Boolean).join(' · '));
        const link = el('a', 'writing-title', post.title);
        link.href = post.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        item.append(meta, link);
        if (post.summary) item.append(el('p', '', post.summary));
        list.append(item);
      });
      article.replaceChildren(list);
    });
  }

  const renderers = { actividad: renderActivity, escritos: renderWriting };
  let locale = 'es';

  function paintHome() {
    const target = document.querySelector('[data-gh-home]');
    if (!target) return;
    loadGitHub().then(data => {
      if (!data.calendar?.contributions?.length) return;
      const stats = calendarStats(data.calendar);
      const t = strings[locale] || strings.es;
      const total = new Intl.NumberFormat(locale, { useGrouping: 'always' }).format(stats.total);
      target.querySelector('.gh-home-total').replaceChildren(el('b', '', total), document.createTextNode(` ${t.homeTotal}`));
      const push = data.events.find(event => event.type === 'PushEvent');
      const last = target.querySelector('.gh-home-last');
      last.replaceChildren();
      if (push) last.append(el('i', 'live-dot'), document.createTextNode(t.lastPush(relative(push.created_at, locale), push.repo.name.replace(`${USER}/`, ''))));
      else last.textContent = t.homeActive(stats.active);
      target.hidden = false;
      target.setAttribute('aria-label', `${total} ${t.homeTotal}. ${last.textContent}`);
      const navCount = document.querySelector('[data-gh-nav]');
      if (navCount) {
        const figure = new Intl.NumberFormat(locale, { useGrouping: 'always' }).format(stats.total);
        navCount.textContent = figure;
        navCount.closest('button')?.setAttribute('aria-label', `${figure} ${t.stats[0]}`);
      }
    }).catch(() => { target.hidden = true; });
  }

  window.PSPFeeds = {
    has: id => id in renderers,
    render: (id, body, nextLocale = locale) => renderers[id]?.(body, nextLocale),
    setLocale: next => { locale = strings[next] ? next : 'es'; paintHome(); }
  };
  paintHome();
})();
