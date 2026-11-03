(() => {
  const filters = [...document.querySelectorAll('[data-category-filter]')];
  if (!filters.length) return;
  const search = document.querySelector('.journal-search input');
  const posts = [...document.querySelectorAll('[data-post]')];
  const empty = document.querySelector('[data-empty]');
  const results = document.querySelector('[data-results]');
  const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let category = 'all';

  function show(updateURL = true) {
    const query = normalise(search.value.trim());
    let count = 0;
    posts.forEach(post => {
      post.hidden = (category !== 'all' && post.dataset.category !== category) || !normalise(post.dataset.search).includes(query);
      if (!post.hidden) count++;
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.categoryFilter === category)));
    empty.hidden = count > 0;
    results.textContent = `${count} ${count === 1 ? 'publicación' : 'publicaciones'}`;
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
  filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.categoryFilter; show(); }));
  search.addEventListener('input', () => show());
  addEventListener('popstate', restore);
  restore();
})();
