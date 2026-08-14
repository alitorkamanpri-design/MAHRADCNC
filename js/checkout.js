(function () {
  'use strict';

  Mahrad.initShell({ page: 'checkout' });

  let products = [];

  function productMap() {
    return Object.fromEntries(products.map((p) => [p.id, p]));
  }

  function cartSummaryText() {
    const map = productMap();
    const lines = Mahrad.getCart()
      .map((item) => {
        const p = map[item.productId];
        if (!p) return '';
        return `- ${p.name} | ${p.sku} × ${item.qty} = ${Mahrad.formatPrice(p.price * item.qty)}`;
      })
      .filter(Boolean)
      .join('\n');
    return lines + '\nجمع: ' + Mahrad.formatPrice(Mahrad.cartTotal(products));
  }

  function render() {
    const cart = Mahrad.getCart();
    const empty = document.getElementById('checkout-empty');
    const content = document.getElementById('checkout-content');
    const lines = document.getElementById('cart-lines');
    const map = productMap();

    if (!cart.length) {
      content.classList.add('hidden');
      empty.classList.remove('hidden');
      empty.innerHTML = Mahrad.emptyState(
        'fa-solid fa-cart-shopping',
        'سبد خرید خالی است',
        'محصول مورد نظر را از فروشگاه اضافه کنید.',
        { label: 'رفتن به فروشگاه', href: 'shop.html' }
      );
      return;
    }

    empty.classList.add('hidden');
    content.classList.remove('hidden');

    const wa = document.getElementById('wa-cart-btn');
    if (wa) wa.href = Mahrad.waInquiryUrl({ lines: cartSummaryText() });

    lines.innerHTML = cart
      .map((item) => {
        const p = map[item.productId];
        if (!p) return '';
        const max = p.stock;
        return `
        <article class="bg-bg-primary border border-border-light rounded-xl shadow-sm p-lg flex gap-lg items-center animate-fade-in" data-line="${Mahrad.escapeHtml(p.id)}">
          <a href="${Mahrad.productUrl(p)}" class="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-bg-tertiary shrink-0">
            <img src="${Mahrad.escapeHtml(p.image)}" alt="${Mahrad.escapeHtml(p.name)}" class="w-full h-full object-cover">
          </a>
          <div class="flex-1 min-w-0">
            <a href="${Mahrad.productUrl(p)}" class="text-sm md:text-base font-semibold text-text-primary line-clamp-2 hover:text-nav">${Mahrad.escapeHtml(p.name)}</a>
            <p class="text-xs text-text-muted mt-xs font-mono dir-ltr text-left">${Mahrad.escapeHtml(p.sku)}</p>
            <p class="text-xs text-text-muted mt-xs">موجودی: ${p.stock.toLocaleString('fa-IR')}</p>
            <p class="text-sm font-semibold text-primary mt-sm">${Mahrad.formatPrice(p.price)}</p>
          </div>
          <div class="flex flex-col items-end gap-sm shrink-0">
            <div class="flex items-center border border-border-medium rounded-lg overflow-hidden">
              <button type="button" class="w-8 h-9 hover:bg-bg-secondary" data-qty-minus="${Mahrad.escapeHtml(p.id)}" aria-label="کاهش">−</button>
              <span class="w-10 text-center text-sm">${item.qty}</span>
              <button type="button" class="w-8 h-9 hover:bg-bg-secondary" data-qty-plus="${Mahrad.escapeHtml(p.id)}" aria-label="افزایش" ${item.qty >= max ? 'disabled' : ''}>+</button>
            </div>
            <button type="button" class="text-xs text-danger hover:underline" data-remove="${Mahrad.escapeHtml(p.id)}">حذف</button>
          </div>
        </article>`;
      })
      .join('');

    const total = Mahrad.cartTotal(products);
    document.getElementById('subtotal').textContent = Mahrad.formatPrice(total);
    document.getElementById('grand-total').textContent = Mahrad.formatPrice(total);
  }

  document.getElementById('cart-lines')?.addEventListener('click', (e) => {
    const minus = e.target.closest('[data-qty-minus]');
    const plus = e.target.closest('[data-qty-plus]');
    const remove = e.target.closest('[data-remove]');
    if (minus) {
      const id = minus.getAttribute('data-qty-minus');
      const item = Mahrad.getCart().find((i) => i.productId === id);
      if (item) Mahrad.updateCartQty(id, item.qty - 1, products);
      render();
    }
    if (plus) {
      const id = plus.getAttribute('data-qty-plus');
      const item = Mahrad.getCart().find((i) => i.productId === id);
      if (item) Mahrad.updateCartQty(id, item.qty + 1, products);
      render();
    }
    if (remove) {
      Mahrad.removeFromCart(remove.getAttribute('data-remove'));
      render();
    }
  });

  const form = document.getElementById('checkout-form');
  const user = Mahrad.getUser();
  if (form) {
    form.name.value = user.name || '';
    form.phone.value = user.phone || '';
    form.address.value = user.address || '';
    form.company.value = user.company || '';
    form.economicCode.value = user.economicCode || '';
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const cart = Mahrad.getCart();
    if (!cart.length) return;

    const phone = form.phone.value.trim();
    const phoneErr = document.getElementById('phone-error');
    if (!Mahrad.validatePhone(phone)) {
      phoneErr?.classList.remove('hidden');
      form.phone.focus();
      Mahrad.toast('شماره موبایل نامعتبر است', 'error');
      return;
    }
    phoneErr?.classList.add('hidden');

    const data = {
      name: form.name.value.trim(),
      phone,
      address: form.address.value.trim(),
      company: form.company.value.trim(),
      economicCode: form.economicCode.value.trim(),
      note: form.note.value.trim(),
    };
    Mahrad.setUser({ ...Mahrad.getUser(), ...data });

    const order = {
      id: 'ORD-' + Date.now(),
      createdAt: new Date().toISOString(),
      items: cart.map((i) => ({ ...i })),
      total: Mahrad.cartTotal(products),
      customer: data,
      status: 'pending',
    };
    Mahrad.addOrder(order);
    Mahrad.setCart([]);
    Mahrad.toast('سفارش با موفقیت ثبت شد', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html?tab=orders';
    }, 800);
  });

  Mahrad.loadJSON('data/products.json')
    .then((list) => {
      products = list;
      render();
    })
    .catch((err) => {
      console.error(err);
      Mahrad.toast('خطا در بارگذاری سبد', 'error');
    });

  document.addEventListener('mahrad:cart', render);
})();
