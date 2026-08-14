(function () {
  'use strict';

  Mahrad.initShell({ page: 'home' });

  Promise.all([
    Mahrad.loadJSON('data/home.json'),
    Mahrad.loadJSON('data/products.json'),
    Mahrad.loadJSON('data/categories.json'),
  ])
    .then(([home, products, categories]) => {
      const hero = home.hero;
      const brandEl = document.getElementById('hero-brand');
      const headlineEl = document.getElementById('hero-headline');
      const subtitleEl = document.getElementById('hero-subtitle');
      const imgEl = document.getElementById('hero-image');
      const ctas = document.getElementById('hero-ctas');

      if (brandEl) brandEl.textContent = hero.brand;
      if (headlineEl) headlineEl.textContent = hero.headline;
      if (subtitleEl) subtitleEl.textContent = hero.subtitle;
      if (imgEl) {
        imgEl.src = hero.image;
        imgEl.alt = hero.headline;
      }
      if (ctas) {
        ctas.innerHTML = `
          <a href="${hero.ctaPrimary.href}" class="bg-primary text-white px-xl py-md rounded-lg font-medium text-base leading-normal hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center gap-2">${Mahrad.escapeHtml(hero.ctaPrimary.label)}</a>
          <a href="${hero.ctaSecondary.href}" class="bg-white/10 text-white border border-white/30 px-xl py-md rounded-lg font-medium text-base leading-normal hover:bg-white/20 transition-all duration-200 inline-flex items-center gap-2">${Mahrad.escapeHtml(hero.ctaSecondary.label)}</a>`;
      }

      if (home.sections) {
        const n = document.getElementById('newest-title');
        const b = document.getElementById('best-title');
        const c = document.getElementById('cat-title');
        if (n) n.textContent = home.sections.newestTitle;
        if (b) b.textContent = home.sections.bestsellersTitle;
        if (c) c.textContent = home.sections.categoriesTitle;
      }

      const counts = {};
      products.forEach((p) => {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      });

      const catGrid = document.getElementById('categories-grid');
      if (catGrid) {
        catGrid.innerHTML = categories
          .map((cat) => Mahrad.renderCategoryCard(cat, counts[cat.id] || 0))
          .join('');
      }

      const newest = products.filter((p) => p.isNew).slice(0, 8);
      const newestFallback = newest.length ? newest : products.slice(0, 8);
      const newestGrid = document.getElementById('newest-grid');
      if (newestGrid) newestGrid.innerHTML = newestFallback.map(Mahrad.renderProductCard).join('');

      const best = products.filter((p) => p.isBestseller).slice(0, 8);
      const bestGrid = document.getElementById('bestseller-grid');
      if (bestGrid) bestGrid.innerHTML = best.map(Mahrad.renderProductCard).join('');

      const trust = document.getElementById('trust-row');
      if (trust && home.trust) {
        trust.innerHTML = home.trust
          .map(
            (t) => `
          <div class="flex items-start gap-lg">
            <span class="w-12 h-12 rounded-xl bg-bg-primary text-accent flex items-center justify-center text-lg shrink-0 shadow-sm" aria-hidden="true"><i class="${t.icon}"></i></span>
            <div>
              <h3 class="text-lg font-semibold text-text-primary leading-snug mb-xs">${Mahrad.escapeHtml(t.title)}</h3>
              <p class="text-sm text-text-secondary leading-relaxed">${Mahrad.escapeHtml(t.text)}</p>
            </div>
          </div>`
          )
          .join('');
      }
    })
    .catch((err) => {
      console.error(err);
      Mahrad.toast('خطا در بارگذاری داده‌ها', 'error');
    });
})();
