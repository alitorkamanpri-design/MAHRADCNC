(function () {
  'use strict';

  Mahrad.initShell({ page: 'landing' });

  Promise.all([
    Mahrad.loadJSON('data/landing.json'),
    Mahrad.loadJSON('data/products.json'),
    Mahrad.loadJSON('data/categories.json'),
  ])
    .then(([landing, products, categories]) => {
      const hero = landing.hero;
      document.getElementById('land-brand').textContent = hero.brand;
      document.getElementById('land-headline').textContent = hero.headline;
      document.getElementById('land-subtitle').textContent = hero.subtitle;
      const img = document.getElementById('land-hero-img');
      img.src = hero.image;
      img.alt = hero.headline;

      document.getElementById('land-ctas').innerHTML = `
        <a href="${hero.ctaPrimary.href}" class="bg-primary text-white px-xl py-md rounded-lg font-medium text-base hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center gap-2">${Mahrad.escapeHtml(hero.ctaPrimary.label)}</a>
        <a href="${hero.ctaSecondary.href}" class="bg-white/10 text-white border border-white/30 px-xl py-md rounded-lg font-medium text-base hover:bg-white/20 transition-all duration-200 inline-flex items-center gap-2">${Mahrad.escapeHtml(hero.ctaSecondary.label)}</a>`;

      document.getElementById('features-grid').innerHTML = landing.features
        .map(
          (f) => `
        <div class="bg-bg-primary border border-border-light rounded-xl p-2xl shadow-sm text-center md:text-right">
          <span class="inline-flex w-12 h-12 rounded-xl bg-nav-soft text-nav items-center justify-center text-lg mb-lg" aria-hidden="true"><i class="${f.icon}"></i></span>
          <h3 class="text-xl font-semibold mb-sm leading-snug">${Mahrad.escapeHtml(f.title)}</h3>
          <p class="text-sm text-text-secondary leading-relaxed">${Mahrad.escapeHtml(f.text)}</p>
        </div>`
        )
        .join('');

      document.getElementById('stats-row').innerHTML = landing.stats
        .map((s) => {
          let value = s.value;
          if (s.dynamic === 'products') value = products.length.toLocaleString('fa-IR') + '+';
          if (s.dynamic === 'categories') value = categories.length.toLocaleString('fa-IR');
          return `
        <div>
          <p class="text-3xl font-bold mb-sm">${Mahrad.escapeHtml(value)}</p>
          <p class="text-sm text-white/80">${Mahrad.escapeHtml(s.label)}</p>
        </div>`;
        })
        .join('');

      const featured = (landing.featuredProductIds || [])
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean);
      document.getElementById('featured-grid').innerHTML = featured.map(Mahrad.renderProductCard).join('');

      const cases = document.getElementById('cases-grid');
      if (cases && landing.caseStudies) {
        cases.innerHTML = landing.caseStudies
          .map(
            (c) => `
          <article class="bg-bg-primary border border-border-light rounded-xl p-2xl shadow-sm">
            <h3 class="text-lg font-semibold mb-sm">${Mahrad.escapeHtml(c.title)}</h3>
            <p class="text-sm text-text-secondary leading-relaxed">${Mahrad.escapeHtml(c.text)}</p>
          </article>`
          )
          .join('');
      }

      const banner = landing.ctaBanner;
      document.getElementById('cta-banner').innerHTML = `
        <div>
          <h2 class="text-2xl font-semibold text-text-primary mb-sm">${Mahrad.escapeHtml(banner.title)}</h2>
          <p class="text-sm text-text-secondary leading-relaxed">${Mahrad.escapeHtml(banner.text)}</p>
        </div>
        <div class="flex flex-wrap gap-md shrink-0">
          <a href="${banner.button.href}" class="bg-primary text-white px-xl py-md rounded-lg font-medium text-base hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center gap-2">${Mahrad.escapeHtml(banner.button.label)}</a>
          ${
            banner.secondary
              ? `<a href="${banner.secondary.href}" class="bg-nav text-white px-xl py-md rounded-lg font-medium text-base inline-flex items-center gap-2">${Mahrad.escapeHtml(banner.secondary.label)}</a>`
              : ''
          }
        </div>`;
    })
    .catch((err) => {
      console.error(err);
      Mahrad.toast('خطا در بارگذاری لندینگ', 'error');
    });
})();
