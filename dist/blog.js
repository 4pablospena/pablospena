(() => {
  const filters = [...document.querySelectorAll('[data-category-filter]')];

  if (filters.length) {
    const search = document.querySelector('.journal-search input');
    const posts = [...document.querySelectorAll('[data-post]')];
    const empty = document.querySelector('[data-empty]');
    const results = document.querySelector('[data-results]');
    const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const preview = {
      number: document.querySelector('[data-preview-number]'),
      label: document.querySelector('[data-preview-label]'),
      date: document.querySelector('[data-preview-date]'),
      category: document.querySelector('[data-preview-category]'),
      minutes: document.querySelector('[data-preview-minutes]'),
      summary: document.querySelector('[data-preview-summary]')
    };
    let category = 'all';

    function select(post) {
      posts.forEach(item => item.classList.toggle('is-selected', item === post));
      preview.number.textContent = post?.dataset.number || '00';
      preview.label.textContent = post ? 'Nota seleccionada' : 'Notas visibles';
      preview.date.textContent = post?.dataset.date || 'Por escribir';
      preview.category.textContent = post ? (post.dataset.category === 'trabajo' ? 'Trabajo' : 'Personal') : 'Personal / Trabajo';
      preview.minutes.textContent = post ? `${post.dataset.minutes} min` : 'A tu ritmo';
      preview.summary.textContent = post?.dataset.summary || 'Lo que aprendo en el trabajo y lo que me pasa fuera de él. Sin una frecuencia fija.';
    }

    function show(updateURL = true) {
      const query = normalise(search.value.trim());
      let count = 0;
      posts.forEach(post => {
        post.hidden = (category !== 'all' && post.dataset.category !== category) || !normalise(post.dataset.search).includes(query);
        if (!post.hidden) count++;
      });
      filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.categoryFilter === category)));
      empty.hidden = count > 0;
      results.textContent = `${count} ${count === 1 ? 'nota publicada' : 'notas publicadas'}`;
      select(posts.find(post => !post.hidden));
      if (!updateURL) return;
      const url = new URL(location.href);
      if (category === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', category);
      if (search.value.trim()) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    }

    function restore() {
      const params = new URLSearchParams(location.search);
      const value = params.get('category');
      category = filters.some(button => button.dataset.categoryFilter === value) ? value : 'all';
      search.value = params.get('q') || '';
      show(false);
    }
    posts.forEach(post => {
      post.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') select(post); });
      post.addEventListener('focusin', () => select(post));
    });
    filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.categoryFilter; show(); }));
    search.addEventListener('input', () => show());
    addEventListener('popstate', restore);
    restore();
    return;
  }

  const article = document.querySelector('.journal-article');
  if (!article) return;
  const headings = [...article.querySelectorAll('.article-prose h2, .article-prose h3')];
  const outline = document.querySelector('[data-outline]');
  const list = document.querySelector('[data-outline-list]');
  const links = headings.map((heading, index) => {
    heading.id ||= `apartado-${index + 1}`;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.dataset.level = heading.tagName.slice(1);
    item.append(link);
    list.append(item);
    return link;
  });
  outline.hidden = !headings.length;
  document.querySelector('[data-reading-status]').hidden = false;
  const progress = document.querySelector('#reading-progress');
  const value = document.querySelector('[data-reading-value]');
  let scheduled = false;
  function update() {
    scheduled = false;
    const distance = document.documentElement.scrollHeight - innerHeight;
    const percentage = distance > 0 ? Math.max(0, Math.min(100, Math.round(scrollY / distance * 100))) : 100;
    progress.value = percentage;
    progress.textContent = `${percentage}%`;
    value.textContent = `${percentage}%`;
    let active = 0;
    headings.forEach((heading, index) => { if (heading.getBoundingClientRect().top < innerHeight * .3) active = index; });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  update();
})();
