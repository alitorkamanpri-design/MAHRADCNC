(function () {
  'use strict';

  Mahrad.initShell({ page: 'shop' });

  let allProducts = [];
  let categories = [];
  let page = 1;
  let view = window.matchMedia('(min-width: 1024px)').matches ? 'table' : 'grid';

  function readUrlState() {
    const sp = new URLSearchParams(window.location.search);
    const facets = {};
    sp.forEach((val, key) => {
      if (key.startsWith('facet.')) {
        const fk = key.slice(6);
        facets[fk] = facets[fk] || [];
        facets[fk].push(val);
      }
    });
    return {
      category: sp.get('category') || '',
      q: sp.get('q') || '',
      sort: sp.get('sort') || 'default',
      inStock: sp.get('inStock') === '1',
      page: Math.max(1, parseInt(sp.get('page') || '1', 10) || 1),
      facets,
    };
  }

  let state = readUrlState();
  page = state.page;

  function syncUrl() {
    const sp = new URLSearchParams();
    if (state.category) sp.set('category', state.category);
    if (state.q) sp.set('q', state.q);
    if (state.sort && state.sort !== 'default') sp.set('sort', state.sort);
    if (state.inStock) sp.set('inStock', '1');
    if (page > 1) sp.set('page', String(page));
    Object.entries(state.facets).forEach(([k, vals]) => {
      vals.forEach((v) => sp.append('facet.' + k, v));
    });
    const qs = sp.toString();
    history.replaceState(null, '', qs ? 'shop.html?' + qs : 'shop.html');
  }

  function activeCat() {
    return categories.find((c) => c.id === state.category) || null;
  }

  function filterProducts() {
    let list = allProducts.slice();
    if (state.category) list = list.filter((p) => p.categoryId === state.category);
    if (state.inStock) list = list.filter((p) => p.stock > 0);
    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.shortDesc && p.shortDesc.toLowerCase().includes(q))
      );
    }
    Object.entries(state.facets).forEach(([key, vals]) => {
      if (!vals.length) return;
      list = list.filter((p) => {
          if (key === 'برند') {
            const b = p.brand || (p.specs && p.specs['برند']);
            return b != null && vals.includes(String(b));
          }
          const v = p.specs && p.specs[key];
          return v != null && vals.includes(String(v));
        });
    });
    switch (state.sort) {
      case 'newest':
        list.sort((a, b) => (b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1));
        break;
      case 'bestseller':
        list.sort((a, b) => (b.isBestseller === a.isBestseller ? 0 : b.isBestseller ? 1 : -1));
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
    return list;
  }

  function facetOptions(baseList, key) {
    const set = new Set();
    baseList.forEach((p) => {
      if (p.specs && p.specs[key] != null) set.add(String(p.specs[key]));
    });
    if (key === 'برند') {
      baseList.forEach((p) => {
        if (p.brand) set.add(p.brand);
      });
    }
    return Array.from(set).sort();
  }

  function renderChips() {
    const host = document.getElementById('active-chips');
    if (!host) return;
    const chips = [];
    if (state.category) {
      const cat = activeCat();
      chips.push({ label: cat ? cat.name : state.category, clear: () => (state.category = '') });
    }
    if (state.q) chips.push({ label: 'جستجو: ' + state.q, clear: () => (state.q = '') });
    if (state.inStock) chips.push({ label: 'فقط موجود', clear: () => (state.inStock = false) });
    Object.entries(state.facets).forEach(([k, vals]) => {
      vals.forEach((v) => {
        chips.push({
          label: k + ': ' + v,
          clear: () => {
            state.facets[k] = state.facets[k].filter((x) => x !== v);
            if (!state.facets[k].length) delete state.facets[k];
          },
        });
      });
    });
    if (!chips.length) {
      host.innerHTML = '';
      host.classList.add('hidden');
      return;
    }
    host.classList.remove('hidden');
    host.innerHTML =
      chips
        .map(
          (c, i) => `
      <button type="button" data-chip="${i}" class="inline-flex items-center gap-2 bg-nav-soft text-nav text-xs font-medium px-md py-sm rounded-lg">
        ${Mahrad.escapeHtml(c.label)} <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>`
        )
        .join('') +
      `<button type="button" id="clear-all-filters" class="text-xs text-danger font-medium px-md py-sm">پاک کردن همه</button>`;

    host.querySelectorAll('[data-chip]').forEach((btn) => {
      btn.addEventListener('click', () => {
        chips[Number(btn.getAttribute('data-chip'))].clear();
        page = 1;
        renderAll();
      });
    });
    document.getElementById('clear-all-filters')?.addEventListener('click', () => {
      state = { category: '', q: '', sort: 'default', inStock: false, page: 1, facets: {} };
      page = 1;
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) sortSelect.value = 'default';
      renderAll();
    });
  }

  function renderFilters(hostId) {
    const host = document.getElementById(hostId);
    if (!host) return;

    const parents = {};
    categories.forEach((c) => {
      const p = c.parentName || 'سایر';
      if (!parents[p]) parents[p] = [];
      parents[p].push(c);
    });

    let html = `
      <label class="flex items-center gap-md px-lg py-md rounded-lg text-sm cursor-pointer hover:bg-bg-secondary">
        <input type="checkbox" id="${hostId}-instock" ${state.inStock ? 'checked' : ''} class="accent-primary">
        <span>فقط موجود</span>
      </label>
      <h3 class="text-sm font-semibold text-text-primary mt-lg mb-sm px-lg">دسته‌بندی</h3>
      <button type="button" data-cat="" class="w-full text-right px-lg py-md rounded-lg text-sm ${
        !state.category ? 'bg-nav-soft text-nav font-semibold' : 'hover:bg-bg-secondary text-text-secondary'
      }">همه محصولات</button>`;

    Object.entries(parents).forEach(([parentName, cats]) => {
      html += `<p class="text-xs text-text-muted px-lg mt-md mb-xs font-medium">${Mahrad.escapeHtml(parentName)}</p>`;
      cats.forEach((c) => {
        html += `<button type="button" data-cat="${Mahrad.escapeHtml(c.id)}" class="w-full text-right px-lg py-md rounded-lg text-sm ${
          state.category === c.id ? 'bg-nav-soft text-nav font-semibold' : 'hover:bg-bg-secondary text-text-secondary'
        }">${Mahrad.escapeHtml(c.name)}</button>`;
      });
    });

    const cat = activeCat();
    const baseForFacets = allProducts.filter((p) => !state.category || p.categoryId === state.category);
    const keys = cat && cat.facetKeys ? cat.facetKeys : ['برند'];
    keys.forEach((key) => {
      const opts = facetOptions(baseForFacets, key);
      if (!opts.length) return;
      html += `<h3 class="text-sm font-semibold text-text-primary mt-lg mb-sm px-lg">${Mahrad.escapeHtml(key)}</h3>`;
      opts.forEach((opt) => {
        const checked = state.facets[key] && state.facets[key].includes(opt);
        html += `<label class="flex items-center gap-md px-lg py-sm text-sm cursor-pointer hover:bg-bg-secondary rounded-lg">
          <input type="checkbox" data-facet-key="${Mahrad.escapeHtml(key)}" data-facet-val="${Mahrad.escapeHtml(opt)}" ${checked ? 'checked' : ''} class="accent-primary">
          <span>${Mahrad.escapeHtml(opt)}</span>
        </label>`;
      });
    });

    host.innerHTML = html;

    host.querySelector(`#${hostId}-instock`)?.addEventListener('change', (e) => {
      state.inStock = e.target.checked;
      page = 1;
      renderAll();
    });
    host.querySelectorAll('[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.category = btn.getAttribute('data-cat') || '';
        state.facets = {};
        page = 1;
        renderAll();
      });
    });
    host.querySelectorAll('[data-facet-key]').forEach((input) => {
      input.addEventListener('change', () => {
        const key = input.getAttribute('data-facet-key');
        const val = input.getAttribute('data-facet-val');
        state.facets[key] = state.facets[key] || [];
        if (input.checked) {
          if (!state.facets[key].includes(val)) state.facets[key].push(val);
        } else {
          state.facets[key] = state.facets[key].filter((x) => x !== val);
          if (!state.facets[key].length) delete state.facets[key];
        }
        page = 1;
        renderAll();
      });
    });
  }

  function renderProducts() {
    const list = filterProducts();
    const grid = document.getElementById('products-grid');
    const tableWrap = document.getElementById('products-table-wrap');
    const tableBody = document.getElementById('products-table-body');
    const empty = document.getElementById('shop-empty');
    const countEl = document.getElementById('result-count');
    const pager = document.getElementById('pager');

    if (countEl) countEl.textContent = list.length.toLocaleString('fa-IR') + ' محصول یافت شد';

    const totalPages = Math.max(1, Math.ceil(list.length / Mahrad.PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    const slice = list.slice((page - 1) * Mahrad.PAGE_SIZE, page * Mahrad.PAGE_SIZE);

    if (!list.length) {
      grid.classList.add('hidden');
      tableWrap.classList.add('hidden');
      empty.classList.remove('hidden');
      empty.innerHTML = Mahrad.emptyState(
        'fa-solid fa-box-open',
        'محصولی یافت نشد',
        'فیلتر یا عبارت جستجو را تغییر دهید.',
        { label: 'پاک کردن فیلترها', href: 'shop.html' }
      );
      if (pager) pager.innerHTML = '';
      return;
    }

    empty.classList.add('hidden');
    empty.innerHTML = '';

    if (view === 'table') {
      grid.classList.add('hidden');
      tableWrap.classList.remove('hidden');
      tableBody.innerHTML = slice.map(Mahrad.renderProductRow).join('');
    } else {
      tableWrap.classList.add('hidden');
      grid.classList.remove('hidden');
      grid.innerHTML = slice.map(Mahrad.renderProductCard).join('');
    }

    if (pager) {
      if (totalPages <= 1) pager.innerHTML = '';
      else {
        pager.innerHTML = `
          <button type="button" id="page-prev" class="px-lg py-md rounded-lg border border-border-medium text-sm disabled:opacity-40" ${page <= 1 ? 'disabled' : ''}>قبلی</button>
          <span class="text-sm text-text-secondary">صفحه ${page.toLocaleString('fa-IR')} از ${totalPages.toLocaleString('fa-IR')}</span>
          <button type="button" id="page-next" class="px-lg py-md rounded-lg border border-border-medium text-sm disabled:opacity-40" ${page >= totalPages ? 'disabled' : ''}>بعدی</button>`;
        document.getElementById('page-prev')?.addEventListener('click', () => {
          page -= 1;
          renderAll();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        document.getElementById('page-next')?.addEventListener('click', () => {
          page += 1;
          renderAll();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    }
  }

  function renderAll() {
    syncUrl();
    renderFilters('category-filters');
    renderFilters('category-filters-mobile');
    renderChips();
    renderProducts();
    document.getElementById('view-grid')?.classList.toggle('bg-nav-soft', view === 'grid');
    document.getElementById('view-table')?.classList.toggle('bg-nav-soft', view === 'table');
  }

  /* Drawer a11y */
  const drawer = document.getElementById('filter-drawer');
  function openDrawer() {
    drawer.hidden = false;
    drawer.classList.remove('hidden');
    const closeBtn = drawer.querySelector('[data-close-drawer]');
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer() {
    drawer.hidden = true;
    drawer.classList.add('hidden');
    document.getElementById('filter-open')?.focus();
  }
  document.getElementById('filter-open')?.addEventListener('click', openDrawer);
  drawer?.querySelectorAll('[data-close-drawer]').forEach((el) => el.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer();
    if (drawer && !drawer.hidden) Mahrad.trapFocus(drawer, e);
  });

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      page = 1;
      renderAll();
    });
  }

  document.getElementById('view-grid')?.addEventListener('click', () => {
    view = 'grid';
    renderAll();
  });
  document.getElementById('view-table')?.addEventListener('click', () => {
    view = 'table';
    renderAll();
  });

  Promise.all([Mahrad.loadJSON('data/products.json'), Mahrad.loadJSON('data/categories.json')])
    .then(([products, cats]) => {
      allProducts = products;
      categories = cats;
      renderAll();
    })
    .catch((err) => {
      console.error(err);
      Mahrad.toast('خطا در بارگذاری فروشگاه', 'error');
    });
})();
