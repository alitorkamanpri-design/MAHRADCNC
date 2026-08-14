(function () {
  'use strict';

  Mahrad.initShell({ page: 'shop' });

  const slug = Mahrad.qs('slug');
  const id = Mahrad.qs('id');

  Promise.all([
    Mahrad.loadJSON('data/products.json'),
    Mahrad.loadJSON('data/categories.json'),
    Mahrad.loadJSON('data/kits.json').catch(() => ({ kits: [] })),
  ])
    .then(([products, categories, kitsData]) => {
      const product = Mahrad.findProduct(products, { id, slug });
      const root = document.getElementById('pdp-root');

      if (!product) {
        root.innerHTML = Mahrad.emptyState(
          'fa-solid fa-circle-exclamation',
          'محصول یافت نشد',
          'این محصول در کاتالوگ موجود نیست.',
          { label: 'بازگشت به فروشگاه', href: 'shop.html' }
        );
        document.getElementById('related-section')?.classList.add('hidden');
        return;
      }

      document.title = product.name + ' — MahradCNC';
      Mahrad.setMeta('description', product.shortDesc || product.name);
      Mahrad.setMeta('og:title', product.name, true);
      Mahrad.setMeta('og:description', product.shortDesc || product.name, true);
      Mahrad.setMeta('og:image', product.image, true);

      const absImage = new URL(product.image, window.location.href).href;
      Mahrad.injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        brand: product.brand || 'MahradCNC',
        image: absImage,
        description: product.description || product.shortDesc,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'IRR',
          price: product.price,
          availability:
            product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
      });

      const cat = categories.find((c) => c.id === product.categoryId);
      const crumb = document.getElementById('breadcrumb');
      if (crumb) {
        crumb.innerHTML = `
          <a href="index.html" class="hover:text-primary">خانه</a>
          <span class="mx-sm">/</span>
          <a href="shop.html" class="hover:text-primary">فروشگاه</a>
          ${
            cat
              ? `<span class="mx-sm">/</span><a href="shop.html?category=${encodeURIComponent(cat.id)}" class="hover:text-primary">${Mahrad.escapeHtml(cat.name)}</a>`
              : ''
          }
          <span class="mx-sm">/</span>
          <span class="text-text-secondary">${Mahrad.escapeHtml(product.name)}</span>`;
      }

      const wished = Mahrad.isWishlisted(product.id);
      const out = product.stock <= 0;
      const inquiry = Mahrad.needsInquiry(product);
      const gallery = product.gallery && product.gallery.length ? product.gallery : [product.image];
      const specEntries = Object.entries(product.specs || {});
      const keySpecs = specEntries.slice(0, 5);

      const specsRows = specEntries
        .map(
          ([k, v]) => `
          <tr class="border-b border-border-light">
            <th class="text-right py-md px-lg text-sm text-text-secondary font-medium w-1/3 bg-bg-secondary">${Mahrad.escapeHtml(k)}</th>
            <td class="py-md px-lg text-sm text-text-primary">${Mahrad.escapeHtml(String(v))}</td>
          </tr>`
        )
        .join('');

      const datasheet =
        product.datasheetUrl
          ? `<a href="${Mahrad.escapeHtml(product.datasheetUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-sm text-primary hover:underline"><i class="fa-solid fa-file-pdf"></i> دانلود دیتاشیت</a>`
          : `<span class="inline-flex items-center gap-2 text-sm text-text-muted" title="به‌زودی"><i class="fa-solid fa-file-pdf"></i> دیتاشیت به‌زودی</span>`;

      let ctaHtml = '';
      if (out) {
        ctaHtml = `
          <a href="${Mahrad.waInquiryUrl(product)}" target="_blank" rel="noopener" class="bg-nav text-white px-xl py-md rounded-lg font-medium text-base inline-flex items-center gap-2">استعلام قیمت</a>
          <a href="tel:02133980931" class="border border-border-medium px-xl py-md rounded-lg font-medium text-base inline-flex items-center gap-2">تماس</a>`;
      } else if (inquiry) {
        ctaHtml = `
          <button type="button" id="add-cart-btn" class="bg-primary text-white px-xl py-md rounded-lg font-medium text-base hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center gap-2">
            <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> افزودن به سبد
          </button>
          <a href="${Mahrad.waInquiryUrl(product)}" target="_blank" rel="noopener" class="bg-nav text-white px-xl py-md rounded-lg font-medium text-base inline-flex items-center gap-2">استعلام / مشاوره</a>`;
      } else {
        ctaHtml = `
          <button type="button" id="add-cart-btn" class="bg-primary text-white px-xl py-md rounded-lg font-medium text-base hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center gap-2">
            <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i> افزودن به سبد
          </button>`;
      }

      root.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3xl">
          <div>
            <div class="bg-bg-primary border border-border-light rounded-xl overflow-hidden shadow-sm aspect-square mb-md">
              <img id="main-image" src="${Mahrad.escapeHtml(gallery[0])}" alt="${Mahrad.escapeHtml(product.name)}" class="w-full h-full object-cover">
            </div>
            <div class="flex gap-sm overflow-x-auto" id="thumbs">
              ${gallery
                .map(
                  (src, i) => `
                <button type="button" data-src="${Mahrad.escapeHtml(src)}" class="shrink-0 w-20 h-20 rounded-lg border ${i === 0 ? 'border-primary' : 'border-border-light'} overflow-hidden" aria-label="تصویر ${i + 1}">
                  <img src="${Mahrad.escapeHtml(src)}" alt="" class="w-full h-full object-cover">
                </button>`
                )
                .join('')}
            </div>
          </div>
          <div class="flex flex-col gap-lg">
            ${cat ? `<a href="shop.html?category=${encodeURIComponent(cat.id)}" class="text-sm text-nav hover:text-primary w-fit">${Mahrad.escapeHtml(cat.name)}</a>` : ''}
            ${product.brand ? `<p class="text-sm font-medium text-nav">${Mahrad.escapeHtml(product.brand)}</p>` : ''}
            <h1 class="text-2xl md:text-3xl font-bold text-text-primary leading-tight">${Mahrad.escapeHtml(product.name)}</h1>
            <p class="text-sm text-text-muted font-mono dir-ltr text-left">SKU: ${Mahrad.escapeHtml(product.sku)}</p>

            <dl class="grid grid-cols-2 sm:grid-cols-3 gap-md bg-bg-primary border border-border-light rounded-xl p-lg">
              ${keySpecs
                .map(
                  ([k, v]) => `
                <div>
                  <dt class="text-xs text-text-muted mb-xs">${Mahrad.escapeHtml(k)}</dt>
                  <dd class="text-sm font-semibold text-text-primary">${Mahrad.escapeHtml(String(v))}</dd>
                </div>`
                )
                .join('')}
              <div>
                <dt class="text-xs text-text-muted mb-xs">واحد</dt>
                <dd class="text-sm font-semibold">${Mahrad.escapeHtml(product.unit || 'عدد')}</dd>
              </div>
              <div>
                <dt class="text-xs text-text-muted mb-xs">زمان ارسال</dt>
                <dd class="text-sm font-semibold">${(product.leadTimeDays || 3).toLocaleString('fa-IR')} روز</dd>
              </div>
            </dl>

            <div class="flex items-center gap-md flex-wrap">
              ${
                product.stock > 0
                  ? `<span class="inline-flex items-center gap-1.5 bg-success-soft text-success px-2.5 py-1 rounded-md text-xs font-medium">${product.stock.toLocaleString('fa-IR')} عدد موجود</span>`
                  : '<span class="inline-flex items-center gap-1.5 bg-danger-soft text-danger px-2.5 py-1 rounded-md text-xs font-medium">ناموجود</span>'
              }
              ${product.isBestseller ? '<span class="inline-flex items-center gap-1.5 bg-accent-soft text-accent px-2.5 py-1 rounded-md text-xs font-medium">پرفروش</span>' : ''}
            </div>

            <div class="flex items-baseline gap-md">
              <span class="text-2xl font-bold text-primary">${Mahrad.formatPrice(product.price)}</span>
              ${
                product.compareAtPrice && product.compareAtPrice > product.price
                  ? `<span class="text-sm text-text-muted line-through">${Mahrad.formatPrice(product.compareAtPrice)}</span>`
                  : ''
              }
            </div>

            <p class="text-base text-text-secondary leading-relaxed">${Mahrad.escapeHtml(product.description || product.shortDesc)}</p>
            <div>${datasheet}</div>

            <div class="flex flex-wrap items-center gap-md mt-md">
              ${
                !out
                  ? `<div class="flex items-center border border-border-medium rounded-lg overflow-hidden">
                <button type="button" id="qty-minus" class="w-10 h-11 text-text-secondary hover:bg-bg-secondary" aria-label="کاهش">−</button>
                <input id="qty-input" type="number" min="1" max="${product.stock}" value="1" class="w-14 h-11 text-center outline-none text-base border-x border-border-medium" aria-label="تعداد">
                <button type="button" id="qty-plus" class="w-10 h-11 text-text-secondary hover:bg-bg-secondary" aria-label="افزایش">+</button>
              </div>`
                  : ''
              }
              ${ctaHtml}
              <button type="button" id="wish-btn" class="w-11 h-11 rounded-lg border border-border-medium flex items-center justify-center hover:border-primary transition-colors duration-150" aria-label="علاقه‌مندی" aria-pressed="${wished}">
                <i class="${wished ? 'fa-solid text-primary' : 'fa-regular'} fa-heart" aria-hidden="true"></i>
              </button>
              <button type="button" data-action="compare" data-id="${Mahrad.escapeHtml(product.id)}" class="w-11 h-11 rounded-lg border border-border-medium flex items-center justify-center hover:border-nav" aria-label="مقایسه">
                <i class="fa-solid fa-code-compare" aria-hidden="true"></i>
              </button>
            </div>

            <div class="bg-bg-primary border border-border-light rounded-xl overflow-hidden mt-lg">
              <h2 class="text-lg font-semibold px-xl py-lg border-b border-border-light">مشخصات فنی</h2>
              <table class="w-full">${specsRows || '<tr><td class="p-lg text-sm text-text-muted">مشخصاتی ثبت نشده</td></tr>'}</table>
            </div>
          </div>
        </div>`;

      document.getElementById('thumbs')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-src]');
        if (!btn) return;
        document.getElementById('main-image').src = btn.getAttribute('data-src');
        document.querySelectorAll('#thumbs [data-src]').forEach((b) => {
          b.classList.toggle('border-primary', b === btn);
          b.classList.toggle('border-border-light', b !== btn);
        });
      });

      const qtyInput = document.getElementById('qty-input');
      const clampQty = () => {
        if (!qtyInput) return 1;
        let v = Number(qtyInput.value) || 1;
        v = Math.max(1, Math.min(product.stock, v));
        qtyInput.value = v;
        return v;
      };
      document.getElementById('qty-minus')?.addEventListener('click', () => {
        qtyInput.value = Math.max(1, Number(qtyInput.value) - 1);
      });
      document.getElementById('qty-plus')?.addEventListener('click', () => {
        qtyInput.value = Math.min(product.stock, Number(qtyInput.value) + 1);
      });
      document.getElementById('add-cart-btn')?.addEventListener('click', () => {
        Mahrad.addToCart(product.id, clampQty(), products);
      });
      document.getElementById('wish-btn')?.addEventListener('click', () => {
        const on = Mahrad.toggleWishlist(product.id);
        const btn = document.getElementById('wish-btn');
        const icon = btn.querySelector('i');
        icon.className = on ? 'fa-solid fa-heart text-primary' : 'fa-regular fa-heart';
        btn.setAttribute('aria-pressed', String(on));
      });

      const related = products
        .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
        .slice(0, 4);
      document.getElementById('related-grid').innerHTML = related.map(Mahrad.renderProductCard).join('');

      /* Kits / complementary */
      const kits = (kitsData.kits || []).filter(
        (k) => k.productIds && k.productIds.includes(product.id)
      );
      const kitHost = document.getElementById('kits-grid');
      const kitSection = document.getElementById('kits-section');
      if (kits.length && kitHost) {
        const ids = new Set();
        kits.forEach((k) => k.productIds.forEach((pid) => ids.add(pid)));
        ids.delete(product.id);
        const comps = [...ids]
          .map((pid) => products.find((p) => p.id === pid))
          .filter(Boolean)
          .slice(0, 4);
        if (comps.length) {
          kitSection?.classList.remove('hidden');
          kitHost.innerHTML = comps.map(Mahrad.renderProductCard).join('');
        }
      }
    })
    .catch((err) => {
      console.error(err);
      Mahrad.toast('خطا در بارگذاری محصول', 'error');
    });
})();
