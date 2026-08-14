/**
 * MahradCNC — Shared App Core (Industrial Catalog)
 */
(function (global) {
  'use strict';

  const STORAGE = {
    cart: 'mahrad_cart',
    wishlist: 'mahrad_wishlist',
    user: 'mahrad_user',
    orders: 'mahrad_orders',
    compare: 'mahrad_compare',
  };

  const WA_NUMBER = '989010669940';
  const INQUIRY_PRICE = 50000000;
  const PAGE_SIZE = 24;

  const DEFAULT_USER = {
    name: 'کاربر مهمان',
    phone: '',
    email: '',
    address: '',
    company: '',
    economicCode: '',
  };

  let _productCache = null;

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function loadJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path);
    return res.json();
  }

  async function getProducts() {
    if (_productCache) return _productCache;
    _productCache = await loadJSON('data/products.json');
    return _productCache;
  }

  function formatPrice(n) {
    if (n == null || Number.isNaN(n)) return '—';
    return Number(n).toLocaleString('fa-IR') + ' تومان';
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function productUrl(product) {
    if (product.slug) return 'product.html?slug=' + encodeURIComponent(product.slug);
    return 'product.html?id=' + encodeURIComponent(product.id);
  }

  function findProduct(products, { id, slug } = {}) {
    if (slug) {
      const bySlug = products.find((p) => p.slug === slug);
      if (bySlug) return bySlug;
    }
    if (id) return products.find((p) => p.id === id) || null;
    return null;
  }

  function needsInquiry(product) {
    if (!product) return false;
    if (product.stock <= 0) return true;
    if (product.price >= INQUIRY_PRICE) return true;
    if (product.stock < 5) return true;
    return false;
  }

  function canAddToCart(product) {
    return product && product.stock > 0;
  }

  function waInquiryUrl(payload) {
    let text = '';
    if (typeof payload === 'string') text = payload;
    else if (payload && payload.sku) {
      text =
        'استعلام قیمت MahradCNC\n' +
        'محصول: ' +
        payload.name +
        '\nSKU: ' +
        payload.sku +
        '\nبرند: ' +
        (payload.brand || '—') +
        '\nلطفاً قیمت و موجودی را اعلام کنید.';
    } else if (payload && payload.lines) {
      text = 'سفارش / استعلام سبد MahradCNC\n' + payload.lines;
    } else {
      text = 'سلام، درخواست مشاوره قطعات CNC از سایت MahradCNC';
    }
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  function keySpec(product) {
    const specs = product.specs || {};
    const keys = Object.keys(specs);
    if (!keys.length) return product.brand || '—';
    return keys
      .slice(0, 2)
      .map((k) => k + ': ' + specs[k])
      .join(' | ');
  }

  /* Cart */
  function getCart() {
    return readJSON(STORAGE.cart, []);
  }

  function setCart(items) {
    writeJSON(STORAGE.cart, items);
    updateCartBadges();
    document.dispatchEvent(new CustomEvent('mahrad:cart'));
  }

  function addToCart(productId, qty, products) {
    const q = Math.max(1, qty || 1);
    const list = products || _productCache;
    const product = list ? list.find((p) => p.id === productId) : null;
    if (product && product.stock <= 0) {
      toast('این محصول ناموجود است', 'error');
      return;
    }
    const cart = getCart();
    const existing = cart.find((i) => i.productId === productId);
    let nextQty = existing ? existing.qty + q : q;
    if (product && nextQty > product.stock) {
      nextQty = product.stock;
      toast('حداکثر موجودی: ' + product.stock, 'info');
    }
    if (existing) existing.qty = nextQty;
    else cart.push({ productId, qty: nextQty });
    setCart(cart);
    toast('به سبد اضافه شد', 'success');
  }

  function updateCartQty(productId, qty, products) {
    let cart = getCart();
    const list = products || _productCache;
    const product = list ? list.find((p) => p.id === productId) : null;
    if (qty <= 0) cart = cart.filter((i) => i.productId !== productId);
    else {
      const item = cart.find((i) => i.productId === productId);
      let q = qty;
      if (product && q > product.stock) q = product.stock;
      if (item) item.qty = q;
    }
    setCart(cart);
  }

  function removeFromCart(productId) {
    setCart(getCart().filter((i) => i.productId !== productId));
  }

  function cartCount() {
    return getCart().reduce((s, i) => s + i.qty, 0);
  }

  function cartTotal(products) {
    const map = Object.fromEntries(products.map((p) => [p.id, p]));
    return getCart().reduce((sum, i) => {
      const p = map[i.productId];
      return sum + (p ? p.price * i.qty : 0);
    }, 0);
  }

  /* Wishlist */
  function getWishlist() {
    return readJSON(STORAGE.wishlist, []);
  }

  function setWishlist(ids) {
    writeJSON(STORAGE.wishlist, ids);
    document.dispatchEvent(new CustomEvent('mahrad:wishlist'));
  }

  function toggleWishlist(productId) {
    const list = getWishlist();
    const idx = list.indexOf(productId);
    if (idx >= 0) {
      list.splice(idx, 1);
      setWishlist(list);
      toast('از علاقه‌مندی‌ها حذف شد', 'info');
      return false;
    }
    list.push(productId);
    setWishlist(list);
    toast('به علاقه‌مندی‌ها اضافه شد', 'success');
    return true;
  }

  function isWishlisted(productId) {
    return getWishlist().includes(productId);
  }

  /* Compare */
  function getCompare() {
    return readJSON(STORAGE.compare, []);
  }

  function toggleCompare(productId) {
    const list = getCompare();
    const idx = list.indexOf(productId);
    if (idx >= 0) {
      list.splice(idx, 1);
      writeJSON(STORAGE.compare, list);
      toast('از مقایسه حذف شد', 'info');
      return false;
    }
    if (list.length >= 3) {
      toast('حداکثر ۳ محصول برای مقایسه', 'error');
      return false;
    }
    list.push(productId);
    writeJSON(STORAGE.compare, list);
    toast('به مقایسه اضافه شد', 'success');
    return true;
  }

  /* User & Orders */
  function getUser() {
    return readJSON(STORAGE.user, { ...DEFAULT_USER });
  }

  function setUser(user) {
    writeJSON(STORAGE.user, { ...DEFAULT_USER, ...user });
  }

  function getOrders() {
    return readJSON(STORAGE.orders, []);
  }

  function addOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    writeJSON(STORAGE.orders, orders);
  }

  function toast(message, type) {
    let host = document.getElementById('mahrad-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'mahrad-toast-host';
      host.className =
        'fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-sm items-center pointer-events-none w-full max-w-sm px-lg';
      document.body.appendChild(host);
    }
    const colors =
      type === 'success'
        ? 'bg-success text-white'
        : type === 'error'
          ? 'bg-danger text-white'
          : 'bg-nav text-white';
    const el = document.createElement('div');
    el.className =
      colors +
      ' px-xl py-md rounded-lg shadow-md text-sm font-medium animate-fade-in pointer-events-auto';
    el.setAttribute('role', 'status');
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.2s ease';
      setTimeout(() => el.remove(), 220);
    }, 2200);
  }

  function badgeHtml(product) {
    const parts = [];
    if (product.stock <= 0) {
      parts.push(
        '<span class="inline-flex items-center gap-1.5 bg-danger-soft text-danger px-2.5 py-1 rounded-md text-xs font-medium">ناموجود</span>'
      );
    } else if (product.compareAtPrice && product.compareAtPrice > product.price) {
      parts.push(
        '<span class="inline-flex items-center gap-1.5 bg-primary-soft text-primary px-2.5 py-1 rounded-md text-xs font-medium">تخفیف</span>'
      );
    }
    if (product.isBestseller || (product.badges && product.badges.includes('bestseller'))) {
      parts.push(
        '<span class="inline-flex items-center gap-1.5 bg-accent-soft text-accent px-2.5 py-1 rounded-md text-xs font-medium">پرفروش</span>'
      );
    }
    if (product.isNew || (product.badges && product.badges.includes('new'))) {
      parts.push(
        '<span class="inline-flex items-center gap-1.5 bg-info-soft text-info px-2.5 py-1 rounded-md text-xs font-medium">جدید</span>'
      );
    }
    return parts.join('');
  }

  function stockLabel(product) {
    if (product.stock <= 0) return '<span class="text-xs text-danger">ناموجود</span>';
    return (
      '<span class="text-xs text-text-muted">' +
      product.stock.toLocaleString('fa-IR') +
      ' ' +
      escapeHtml(product.unit || 'عدد') +
      '</span>'
    );
  }

  function cardActions(product) {
    const out = !canAddToCart(product);
    const inquiry = needsInquiry(product);
    if (out) {
      return `<a href="${waInquiryUrl(product)}" target="_blank" rel="noopener" class="bg-nav text-white shrink-0 rounded-lg font-medium text-sm leading-normal hover:opacity-90 transition-all duration-200 inline-flex items-center justify-center gap-2 px-md py-md lg:px-lg" aria-label="استعلام">استعلام</a>`;
    }
    if (inquiry) {
      return `<div class="flex items-center gap-xs shrink-0">
        <a href="${waInquiryUrl(product)}" target="_blank" rel="noopener" class="hidden lg:inline-flex bg-nav text-white rounded-lg text-xs font-medium px-md py-md hover:opacity-90">استعلام</a>
        <button type="button" class="bg-primary text-white rounded-lg font-medium text-base leading-normal hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center justify-center gap-2 w-10 h-10 lg:w-auto lg:h-auto lg:px-lg lg:py-md" data-action="add-cart" data-id="${escapeHtml(product.id)}" aria-label="افزودن به سبد">
          <i class="fa-solid fa-plus lg:hidden" aria-hidden="true"></i>
          <span class="hidden lg:inline">افزودن</span>
        </button>
      </div>`;
    }
    return `<button type="button" class="bg-primary text-white shrink-0 rounded-lg font-medium text-base leading-normal hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center justify-center gap-2 w-10 h-10 lg:w-auto lg:h-auto lg:px-lg lg:py-md" data-action="add-cart" data-id="${escapeHtml(product.id)}" aria-label="افزودن به سبد">
      <i class="fa-solid fa-plus lg:hidden" aria-hidden="true"></i>
      <span class="hidden lg:inline">افزودن</span>
      <i class="fa-solid fa-cart-shopping hidden lg:inline text-sm" aria-hidden="true"></i>
    </button>`;
  }

  function renderProductCard(product) {
    const wished = isWishlisted(product.id);
    const href = productUrl(product);
    const priceBlock =
      product.compareAtPrice && product.compareAtPrice > product.price
        ? `<div class="flex flex-col gap-xs">
            <span class="text-xs text-text-muted line-through">${formatPrice(product.compareAtPrice)}</span>
            <span class="text-base font-semibold text-primary leading-normal">${formatPrice(product.price)}</span>
          </div>`
        : `<span class="text-base font-semibold text-primary leading-normal">${formatPrice(product.price)}</span>`;

    return `
<article class="bg-bg-primary border border-border-light rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200 animate-fade-in group" data-product-id="${escapeHtml(product.id)}">
  <div class="relative aspect-square bg-bg-tertiary overflow-hidden">
    <a href="${href}" class="block w-full h-full" aria-label="${escapeHtml(product.name)}">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy" width="400" height="400">
    </a>
    <div class="absolute top-sm right-sm flex flex-col gap-xs">${badgeHtml(product)}</div>
    <button type="button" class="absolute top-sm left-sm w-9 h-9 rounded-lg bg-bg-primary/90 border border-border-light flex items-center justify-center text-text-secondary hover:text-primary transition-colors duration-150" data-action="wishlist" data-id="${escapeHtml(product.id)}" aria-label="علاقه‌مندی" aria-pressed="${wished}">
      <i class="${wished ? 'fa-solid' : 'fa-regular'} fa-heart ${wished ? 'text-primary' : ''}" aria-hidden="true"></i>
    </button>
  </div>
  <div class="p-lg flex flex-col gap-sm flex-1">
    ${product.brand ? `<p class="text-xs text-nav font-medium">${escapeHtml(product.brand)}</p>` : ''}
    <a href="${href}" class="block">
      <h3 class="text-sm md:text-base font-semibold text-text-primary leading-snug line-clamp-2 hover:text-nav transition-colors duration-150">${escapeHtml(product.name)}</h3>
    </a>
    <p class="text-xs text-text-muted leading-normal font-mono dir-ltr text-left">${escapeHtml(product.sku)}</p>
    ${stockLabel(product)}
    <div class="mt-auto flex items-end justify-between gap-sm pt-sm">
      ${priceBlock}
      ${cardActions(product)}
    </div>
  </div>
</article>`;
  }

  function renderProductRow(product) {
    const href = productUrl(product);
    const out = !canAddToCart(product);
    return `
<tr class="border-b border-border-light hover:bg-bg-secondary/80 transition-colors duration-150" data-product-id="${escapeHtml(product.id)}">
  <td class="py-md px-md">
    <a href="${href}" class="flex items-center gap-md min-w-0">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="w-12 h-12 rounded-md object-cover bg-bg-tertiary shrink-0" loading="lazy">
      <span class="text-sm font-medium text-text-primary line-clamp-2">${escapeHtml(product.name)}</span>
    </a>
  </td>
  <td class="py-md px-md text-xs font-mono dir-ltr text-left text-text-muted whitespace-nowrap">${escapeHtml(product.sku)}</td>
  <td class="py-md px-md text-xs text-text-secondary hidden md:table-cell">${escapeHtml(keySpec(product))}</td>
  <td class="py-md px-md whitespace-nowrap">${stockLabel(product)}</td>
  <td class="py-md px-md text-sm font-semibold text-primary whitespace-nowrap">${formatPrice(product.price)}</td>
  <td class="py-md px-md text-left">
    ${
      out
        ? `<a href="${waInquiryUrl(product)}" target="_blank" rel="noopener" class="bg-nav text-white text-xs px-md py-sm rounded-lg inline-flex">استعلام</a>`
        : `<button type="button" class="bg-primary text-white text-xs px-md py-sm rounded-lg inline-flex items-center gap-1" data-action="add-cart" data-id="${escapeHtml(product.id)}"><i class="fa-solid fa-plus" aria-hidden="true"></i> افزودن</button>`
    }
  </td>
</tr>`;
  }

  function renderCategoryCard(cat, count) {
    return `
<a href="shop.html?category=${encodeURIComponent(cat.id)}" class="bg-bg-primary border border-border-light rounded-xl shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-nav/30 transition-all duration-200 group">
  <div class="aspect-[4/3] bg-bg-tertiary overflow-hidden">
    <img src="${escapeHtml(cat.image)}" alt="${escapeHtml(cat.name)}" class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" loading="lazy">
  </div>
  <div class="p-lg flex items-center justify-between gap-sm">
    <div class="flex items-center gap-md min-w-0">
      <span class="w-10 h-10 rounded-lg bg-nav-soft text-nav flex items-center justify-center shrink-0" aria-hidden="true"><i class="${escapeHtml(cat.icon)}"></i></span>
      <div class="min-w-0">
        <h3 class="text-base font-semibold text-text-primary leading-snug truncate">${escapeHtml(cat.name)}</h3>
        <p class="text-xs text-text-muted">${count != null ? count + ' محصول' : escapeHtml(cat.parentName || '')}</p>
      </div>
    </div>
    <i class="fa-solid fa-chevron-left text-text-muted text-sm" aria-hidden="true"></i>
  </div>
</a>`;
  }

  function navLinkClass(page, current) {
    const active = page === current;
    return active
      ? 'text-nav font-semibold'
      : 'text-text-secondary hover:text-primary transition-colors duration-150';
  }

  function renderHeader(currentPage) {
    const count = cartCount();
    const q = new URLSearchParams(window.location.search).get('q') || '';
    return `
<header class="sticky top-0 z-50 bg-bg-primary/95 backdrop-blur border-b border-border-light">
  <div class="max-w-7xl mx-auto px-lg md:px-3xl">
    <div class="flex items-center justify-between gap-lg py-md">
      <a href="index.html" class="flex items-center gap-sm shrink-0" aria-label="MahradCNC صفحه اصلی">
        <img src="img/icon.png" alt="MahradCNC" class="h-10 md:h-12 w-auto object-contain">
      </a>
      <div class="hidden md:block flex-1 max-w-xl relative" id="header-search-wrap">
        <form action="shop.html" method="get" role="search" class="w-full" id="header-search-form">
          <div class="flex w-full border border-border-medium rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-focus transition-all duration-200">
            <label for="header-search" class="sr-only">جستجوی محصول</label>
            <input id="header-search" name="q" type="search" value="${escapeHtml(q)}" autocomplete="off" placeholder="جستجو مدل، SKU یا نام قطعه..." class="flex-1 px-lg py-3 text-base text-text-primary outline-none bg-transparent leading-normal">
            <button type="submit" class="px-xl bg-primary text-white hover:bg-primary-hover transition-colors duration-150" aria-label="جستجو">
              <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            </button>
          </div>
        </form>
        <div id="search-suggest" class="hidden absolute top-full inset-x-0 mt-sm bg-bg-primary border border-border-light rounded-xl shadow-md z-50 max-h-72 overflow-y-auto" role="listbox"></div>
      </div>
      <div class="flex items-center gap-sm md:gap-lg">
        <a href="compare.html" class="hidden sm:inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary" aria-label="مقایسه"><i class="fa-solid fa-code-compare" aria-hidden="true"></i><span class="hidden lg:inline">مقایسه</span></a>
        <a href="dashboard.html" class="hidden sm:inline-flex items-center gap-2 text-sm ${navLinkClass('dashboard', currentPage)}" aria-label="حساب کاربری">
          <i class="fa-regular fa-user" aria-hidden="true"></i>
          <span class="hidden lg:inline">حساب من</span>
        </a>
        <a href="checkout.html" class="hidden lg:inline-flex relative items-center gap-2 text-sm ${navLinkClass('checkout', currentPage)}" aria-label="سبد خرید">
          <i class="fa-solid fa-cart-shopping text-lg" aria-hidden="true"></i>
          <span>سبد</span>
          <span class="mahrad-cart-badge absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-primary text-white text-xs flex items-center justify-center ${count ? '' : 'hidden'}">${count}</span>
        </a>
        <button type="button" id="mobile-menu-btn" class="lg:hidden w-10 h-10 rounded-lg border border-border-light flex items-center justify-center text-text-primary" aria-label="منو" aria-expanded="false" aria-controls="mobile-menu">
          <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
      </div>
    </div>
    <nav class="hidden lg:flex items-center gap-3xl pb-md text-sm" aria-label="منوی اصلی">
      <a href="index.html" class="${navLinkClass('home', currentPage)}">صفحه اصلی</a>
      <a href="shop.html" class="${navLinkClass('shop', currentPage)}">فروشگاه</a>
      <a href="landing.html" class="${navLinkClass('landing', currentPage)}">کمپین صنعتی</a>
      <a href="rfq.html" class="${navLinkClass('rfq', currentPage)}">درخواست قیمت</a>
      <a href="checkout.html" class="${navLinkClass('checkout', currentPage)}">سبد خرید</a>
      <a href="dashboard.html" class="${navLinkClass('dashboard', currentPage)}">داشبورد</a>
      <a href="tel:02133980931" class="mr-auto text-text-secondary hover:text-primary transition-colors duration-150 inline-flex items-center gap-2">
        <i class="fa-solid fa-phone" aria-hidden="true"></i>
        ۰۲۱-۳۳۹۸۰۹۳۱
      </a>
    </nav>
  </div>
  <div id="mobile-menu" class="hidden lg:hidden border-t border-border-light bg-bg-primary px-lg py-lg" hidden>
    <form action="shop.html" method="get" class="mb-lg md:hidden" role="search">
      <div class="flex border border-border-medium rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-focus">
        <input id="mobile-search" name="q" type="search" value="${escapeHtml(q)}" placeholder="جستجو..." class="flex-1 px-lg py-3 text-base outline-none bg-transparent">
        <button type="submit" class="px-lg bg-primary text-white" aria-label="جستجو"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>
    </form>
    <nav class="flex flex-col gap-md text-base" aria-label="منوی موبایل">
      <a href="index.html" class="py-sm ${navLinkClass('home', currentPage)}">صفحه اصلی</a>
      <a href="shop.html" class="py-sm ${navLinkClass('shop', currentPage)}">فروشگاه</a>
      <a href="landing.html" class="py-sm ${navLinkClass('landing', currentPage)}">کمپین صنعتی</a>
      <a href="rfq.html" class="py-sm ${navLinkClass('rfq', currentPage)}">درخواست قیمت</a>
      <a href="compare.html" class="py-sm">مقایسه</a>
      <a href="checkout.html" class="py-sm ${navLinkClass('checkout', currentPage)}">سبد خرید</a>
      <a href="dashboard.html" class="py-sm ${navLinkClass('dashboard', currentPage)}">داشبورد</a>
    </nav>
  </div>
</header>`;
  }

  function renderFooter() {
    const wa = waInquiryUrl('سلام، درخواست مشاوره از سایت MahradCNC');
    return `
<footer class="bg-text-primary text-white mt-5xl pb-28 lg:pb-3xl">
  <div class="max-w-7xl mx-auto px-lg md:px-3xl py-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3xl">
    <div>
      <img src="img/icon2.png" alt="MahradCNC" class="h-14 w-auto object-contain mb-lg brightness-0 invert">
      <p class="text-sm text-white/70 leading-relaxed">تأمین‌کننده قطعات صنعتی CNC — ریل، واگن، اسپیندل، کنترلر و تجهیزات جانبی.</p>
    </div>
    <div>
      <h2 class="text-lg font-semibold mb-lg">دسترسی سریع</h2>
      <ul class="flex flex-col gap-sm text-sm text-white/80">
        <li><a href="shop.html" class="hover:text-primary transition-colors duration-150">فروشگاه</a></li>
        <li><a href="landing.html" class="hover:text-primary transition-colors duration-150">کمپین صنعتی</a></li>
        <li><a href="warranty.html" class="hover:text-primary transition-colors duration-150">گارانتی</a></li>
        <li><a href="returns.html" class="hover:text-primary transition-colors duration-150">مرجوعی</a></li>
        <li><a href="brands.html" class="hover:text-primary transition-colors duration-150">برندها</a></li>
      </ul>
    </div>
    <div>
      <h2 class="text-lg font-semibold mb-lg">دسته‌ها</h2>
      <ul class="flex flex-col gap-sm text-sm text-white/80">
        <li><a href="shop.html?category=mechanical-rail" class="hover:text-primary transition-colors duration-150">ریل و واگن</a></li>
        <li><a href="shop.html?category=electronic-spindle" class="hover:text-primary transition-colors duration-150">اسپیندل</a></li>
        <li><a href="shop.html?category=electronic-stepper" class="hover:text-primary transition-colors duration-150">استپ موتور</a></li>
        <li><a href="shop.html?category=accessories" class="hover:text-primary transition-colors duration-150">جانبی</a></li>
      </ul>
    </div>
    <div>
      <h2 class="text-lg font-semibold mb-lg">تماس</h2>
      <ul class="flex flex-col gap-sm text-sm text-white/80">
        <li><a href="tel:02133980931" class="hover:text-primary inline-flex items-center gap-2"><i class="fa-solid fa-phone" aria-hidden="true"></i> ۰۲۱-۳۳۹۸۰۹۳۱</a></li>
        <li><a href="tel:02133532602" class="hover:text-primary inline-flex items-center gap-2"><i class="fa-solid fa-phone" aria-hidden="true"></i> ۰۲۱-۳۳۵۳۲۶۰۲</a></li>
        <li class="leading-relaxed">تهران — خیابان سعدی جنوبی، چهارراه اکباتان</li>
      </ul>
      <div class="flex gap-md mt-lg text-lg">
        <a href="${wa}" class="hover:text-primary transition-colors duration-150" aria-label="واتساپ" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i></a>
      </div>
      <a href="${wa}" target="_blank" rel="noopener" class="inline-flex mt-lg text-sm text-primary hover:underline">درخواست کاتالوگ PDF</a>
    </div>
  </div>
  <div class="border-t border-white/10 text-center text-xs text-white/50 py-lg px-lg">
    تمامی حقوق برای فروشگاه MahradCNC محفوظ است.
  </div>
</footer>`;
  }

  function renderBottomNav(currentPage) {
    const count = cartCount();
    const item = (page, href, icon, label) => {
      const active = page === currentPage;
      return `
<a href="${href}" class="flex flex-col items-center gap-xs py-sm px-md min-w-[4.5rem] ${active ? 'text-nav' : 'text-text-muted'} hover:text-primary transition-colors duration-150"${active ? ' aria-current="page"' : ''}>
  <span class="relative text-lg"><i class="${icon}" aria-hidden="true"></i>${
        page === 'checkout'
          ? `<span class="mahrad-cart-badge absolute -top-2 -left-3 min-w-4 h-4 px-0.5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center ${count ? '' : 'hidden'}">${count}</span>`
          : ''
      }</span>
  <span class="text-xs font-medium">${label}</span>
</a>`;
    };
    return `
<nav class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-bg-primary border-t border-border-light safe-bottom" aria-label="ناوبری پایین">
  <div class="flex items-stretch justify-around px-sm py-xs">
    ${item('home', 'index.html', 'fa-solid fa-house', 'خانه')}
    ${item('shop', 'shop.html', 'fa-solid fa-store', 'فروشگاه')}
    ${item('checkout', 'checkout.html', 'fa-solid fa-cart-shopping', 'سبد')}
    ${item('dashboard', 'dashboard.html', 'fa-regular fa-user', 'حساب')}
  </div>
</nav>`;
  }

  function updateCartBadges() {
    const count = cartCount();
    document.querySelectorAll('.mahrad-cart-badge').forEach((el) => {
      el.textContent = String(count);
      el.classList.toggle('hidden', count === 0);
    });
  }

  function bindCardActions(root) {
    const scope = root || document;
    scope.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if (action === 'add-cart' && id) {
        e.preventDefault();
        getProducts().then((products) => addToCart(id, 1, products));
      }
      if (action === 'wishlist' && id) {
        e.preventDefault();
        const on = toggleWishlist(id);
        const icon = btn.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-solid', on);
          icon.classList.toggle('fa-regular', !on);
          icon.classList.toggle('text-primary', on);
        }
        btn.setAttribute('aria-pressed', String(on));
      }
      if (action === 'compare' && id) {
        e.preventDefault();
        toggleCompare(id);
      }
    });
  }

  function trapFocus(container, e) {
    const focusables = container.querySelectorAll(
      'a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function initTypeahead() {
    const input = document.getElementById('header-search');
    const box = document.getElementById('search-suggest');
    if (!input || !box) return;

    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) {
          box.classList.add('hidden');
          box.innerHTML = '';
          return;
        }
        const products = await getProducts();
        const scored = products
          .map((p) => {
            const sku = (p.sku || '').toLowerCase();
            const name = (p.name || '').toLowerCase();
            let score = 0;
            if (sku === q) score = 100;
            else if (sku.startsWith(q)) score = 80;
            else if (sku.includes(q)) score = 60;
            else if (name.includes(q)) score = 40;
            else if ((p.brand || '').toLowerCase().includes(q)) score = 20;
            return { p, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);

        if (!scored.length) {
          box.classList.add('hidden');
          return;
        }
        box.innerHTML = scored
          .map(
            ({ p }) => `
          <a href="${productUrl(p)}" class="flex items-center gap-md px-lg py-md hover:bg-bg-secondary text-sm border-b border-border-light last:border-0" role="option">
            <img src="${escapeHtml(p.image)}" alt="" class="w-10 h-10 object-cover rounded-md bg-bg-tertiary">
            <span class="min-w-0 flex-1">
              <span class="block font-medium text-text-primary line-clamp-1">${escapeHtml(p.name)}</span>
              <span class="block text-xs text-text-muted font-mono dir-ltr text-left">${escapeHtml(p.sku)}</span>
            </span>
          </a>`
          )
          .join('');
        box.classList.remove('hidden');
      }, 180);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#header-search-wrap')) {
        box.classList.add('hidden');
      }
    });
  }

  function initShell(options) {
    const opts = options || {};
    const current = opts.page || 'home';
    const skipFooter = opts.skipFooter;
    const skipBottom = opts.skipBottom;
    const simpleHeader = opts.simpleHeader;

    const headerMount = document.getElementById('site-header');
    const footerMount = document.getElementById('site-footer');
    const bottomMount = document.getElementById('site-bottom-nav');

    if (headerMount) {
      if (simpleHeader) {
        headerMount.innerHTML = `
<header class="sticky top-0 z-50 bg-bg-primary border-b border-border-light">
  <div class="max-w-7xl mx-auto px-lg md:px-3xl flex items-center justify-between py-md">
    <a href="index.html" class="flex items-center gap-sm"><img src="img/icon.png" alt="MahradCNC" class="h-10 w-auto"></a>
    <span class="text-xs text-text-muted bg-nav-soft text-nav px-md py-sm rounded-md">مهمان (ذخیره محلی)</span>
    <a href="shop.html" class="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-2"><i class="fa-solid fa-arrow-right"></i> فروشگاه</a>
  </div>
</header>`;
      } else {
        headerMount.innerHTML = renderHeader(current);
      }
    }
    if (footerMount && !skipFooter) footerMount.innerHTML = renderFooter();
    if (bottomMount && !skipBottom) bottomMount.innerHTML = renderBottomNav(current);

    const menuBtn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (menuBtn && menu) {
      const closeMenu = () => {
        menu.setAttribute('hidden', '');
        menu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      };
      const openMenu = () => {
        menu.removeAttribute('hidden');
        menu.classList.remove('hidden');
        menuBtn.setAttribute('aria-expanded', 'true');
        const focusable = menu.querySelector('a,button,input');
        if (focusable) focusable.focus();
      };
      menuBtn.addEventListener('click', () => {
        if (menu.hasAttribute('hidden')) openMenu();
        else closeMenu();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hasAttribute('hidden')) {
          closeMenu();
          menuBtn.focus();
        }
        if (!menu.hasAttribute('hidden')) trapFocus(menu, e);
      });
    }

    bindCardActions(document);
    updateCartBadges();
    if (!simpleHeader) initTypeahead();
    getProducts().catch(() => {});
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function emptyState(icon, title, text, cta) {
    return `
<div class="flex flex-col items-center justify-center text-center py-5xl px-xl animate-fade-in">
  <div class="w-16 h-16 rounded-2xl bg-nav-soft text-nav flex items-center justify-center text-2xl mb-xl" aria-hidden="true"><i class="${icon}"></i></div>
  <h2 class="text-xl font-semibold text-text-primary mb-sm">${escapeHtml(title)}</h2>
  <p class="text-sm text-text-secondary max-w-md mb-2xl">${escapeHtml(text)}</p>
  ${cta ? `<a href="${cta.href}" class="bg-primary text-white px-xl py-md rounded-lg font-medium text-base leading-normal hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center gap-2">${escapeHtml(cta.label)}</a>` : ''}
</div>`;
  }

  function validatePhone(phone) {
    return /^09\d{9}$/.test(String(phone || '').trim());
  }

  function setMeta(name, content, prop) {
    const attr = prop ? 'property' : 'name';
    let el = document.head.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function injectJsonLd(data) {
    let el = document.getElementById('product-jsonld');
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'product-jsonld';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  global.Mahrad = {
    STORAGE,
    PAGE_SIZE,
    INQUIRY_PRICE,
    WA_NUMBER,
    loadJSON,
    getProducts,
    formatPrice,
    escapeHtml,
    productUrl,
    findProduct,
    needsInquiry,
    canAddToCart,
    waInquiryUrl,
    keySpec,
    getCart,
    setCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    cartCount,
    cartTotal,
    getWishlist,
    toggleWishlist,
    isWishlisted,
    getCompare,
    toggleCompare,
    getUser,
    setUser,
    getOrders,
    addOrder,
    toast,
    badgeHtml,
    stockLabel,
    renderProductCard,
    renderProductRow,
    renderCategoryCard,
    initShell,
    updateCartBadges,
    bindCardActions,
    trapFocus,
    qs,
    emptyState,
    validatePhone,
    setMeta,
    injectJsonLd,
  };
})(window);
