(function () {
  'use strict';

  Mahrad.initShell({ page: 'dashboard', simpleHeader: true });

  let products = [];
  let activeTab = Mahrad.qs('tab') || 'profile';

  function setTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.dash-tab').forEach((btn) => {
      const on = btn.getAttribute('data-tab') === tab;
      btn.setAttribute('aria-selected', String(on));
      btn.classList.toggle('border-nav', on);
      btn.classList.toggle('text-nav', on);
      btn.classList.toggle('border-transparent', !on);
      btn.classList.toggle('text-text-secondary', !on);
    });
    document.querySelectorAll('.dash-panel').forEach((panel) => {
      const show = panel.id === 'panel-' + tab;
      panel.classList.toggle('hidden', !show);
      panel.hidden = !show;
    });
    renderPanel(tab);
  }

  function statusLabel(s) {
    const map = { pending: 'در انتظار بررسی', shipped: 'ارسال‌شده', done: 'تکمیل‌شده' };
    return map[s] || s;
  }

  function renderPanel(tab) {
    const user = Mahrad.getUser();
    document.getElementById('dash-greeting').textContent = user.name || 'حساب کاربری';
    document.getElementById('dash-phone').textContent = user.phone || 'مهمان (ذخیره محلی)';
    document.getElementById('guest-badge').classList.remove('hidden');

    if (tab === 'profile') {
      document.getElementById('panel-profile').innerHTML = `
        <form id="profile-form" class="bg-bg-primary border border-border-light rounded-xl shadow-sm p-xl max-w-xl flex flex-col gap-lg animate-fade-in">
          <h2 class="text-lg font-semibold">ویرایش پروفایل</h2>
          <div class="border border-border-medium rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-focus">
            <div class="flex"><label for="p-name" class="bg-bg-secondary border-l border-border-light min-w-[100px] px-lg py-3.5 text-sm text-text-secondary flex items-center">نام</label>
            <input id="p-name" name="name" value="${Mahrad.escapeHtml(user.name)}" required class="flex-1 px-lg py-3.5 outline-none bg-transparent"></div>
          </div>
          <div class="border border-border-medium rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-focus">
            <div class="flex"><label for="p-company" class="bg-bg-secondary border-l border-border-light min-w-[100px] px-lg py-3.5 text-sm text-text-secondary flex items-center">شرکت</label>
            <input id="p-company" name="company" value="${Mahrad.escapeHtml(user.company || '')}" class="flex-1 px-lg py-3.5 outline-none bg-transparent"></div>
          </div>
          <div class="border border-border-medium rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-focus">
            <div class="flex"><label for="p-phone" class="bg-bg-secondary border-l border-border-light min-w-[100px] px-lg py-3.5 text-sm text-text-secondary flex items-center">موبایل</label>
            <input id="p-phone" name="phone" value="${Mahrad.escapeHtml(user.phone)}" class="flex-1 px-lg py-3.5 outline-none bg-transparent" placeholder="09xxxxxxxxx"></div>
          </div>
          <div class="border border-border-medium rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-focus">
            <div class="flex"><label for="p-email" class="bg-bg-secondary border-l border-border-light min-w-[100px] px-lg py-3.5 text-sm text-text-secondary flex items-center">ایمیل</label>
            <input id="p-email" name="email" type="email" value="${Mahrad.escapeHtml(user.email || '')}" class="flex-1 px-lg py-3.5 outline-none bg-transparent"></div>
          </div>
          <button type="submit" class="bg-nav text-white px-xl py-md rounded-lg font-medium text-base hover:opacity-90 transition-all duration-200 inline-flex items-center justify-center gap-2 w-fit">ذخیره تغییرات</button>
        </form>`;
      document.getElementById('profile-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.target;
        if (f.phone.value && !Mahrad.validatePhone(f.phone.value.trim())) {
          Mahrad.toast('شماره موبایل نامعتبر است', 'error');
          return;
        }
        Mahrad.setUser({
          ...Mahrad.getUser(),
          name: f.name.value.trim(),
          phone: f.phone.value.trim(),
          email: f.email.value.trim(),
          company: f.company.value.trim(),
        });
        Mahrad.toast('پروفایل ذخیره شد', 'success');
        setTab('profile');
      });
    }

    if (tab === 'orders') {
      const orders = Mahrad.getOrders();
      const map = Object.fromEntries(products.map((p) => [p.id, p]));
      const host = document.getElementById('panel-orders');
      if (!orders.length) {
        host.innerHTML = Mahrad.emptyState(
          'fa-solid fa-receipt',
          'هنوز سفارشی ندارید',
          'پس از ثبت خرید، سفارش‌ها اینجا نمایش داده می‌شوند.',
          { label: 'رفتن به فروشگاه', href: 'shop.html' }
        );
        return;
      }
      host.innerHTML = `
        <div class="flex flex-col gap-lg animate-fade-in">
          ${orders
            .map((o) => {
              const itemsHtml = (o.items || [])
                .map((i) => {
                  const p = map[i.productId];
                  return p
                    ? `<li class="text-sm text-text-secondary flex justify-between gap-md">
                        <span>${Mahrad.escapeHtml(p.name)} <span class="font-mono text-xs dir-ltr">(${Mahrad.escapeHtml(p.sku)})</span> × ${i.qty}</span>
                      </li>`
                    : '';
                })
                .join('');
              const date = new Date(o.createdAt).toLocaleDateString('fa-IR');
              return `
              <article class="bg-bg-primary border border-border-light rounded-xl shadow-sm p-xl">
                <div class="flex flex-wrap items-center justify-between gap-md mb-md">
                  <div>
                    <p class="text-sm font-semibold text-text-primary">${Mahrad.escapeHtml(o.id)}</p>
                    <p class="text-xs text-text-muted mt-xs">${date}</p>
                  </div>
                  <span class="inline-flex items-center gap-1.5 bg-nav-soft text-nav px-2.5 py-1 rounded-md text-xs font-medium">${statusLabel(o.status)}</span>
                </div>
                <ul class="flex flex-col gap-xs mb-md">${itemsHtml}</ul>
                <div class="flex flex-wrap items-center justify-between gap-md">
                  <p class="text-base font-semibold text-primary">${Mahrad.formatPrice(o.total)}</p>
                  <button type="button" class="text-sm bg-primary text-white px-lg py-sm rounded-lg" data-reorder='${JSON.stringify(o.items || [])}'>سفارش مجدد</button>
                </div>
              </article>`;
            })
            .join('')}
        </div>`;

      host.querySelectorAll('[data-reorder]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const items = JSON.parse(btn.getAttribute('data-reorder'));
          items.forEach((i) => Mahrad.addToCart(i.productId, i.qty, products));
          Mahrad.toast('اقلام به سبد بازگشت', 'success');
          window.location.href = 'checkout.html';
        });
      });
    }

    if (tab === 'wishlist') {
      const ids = Mahrad.getWishlist();
      const host = document.getElementById('panel-wishlist');
      const list = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
      if (!list.length) {
        host.innerHTML = Mahrad.emptyState(
          'fa-regular fa-heart',
          'لیست علاقه‌مندی خالی است',
          'با زدن قلب روی کارت محصول، اینجا کارت کامل نمایش داده می‌شود.',
          { label: 'مشاهده محصولات', href: 'shop.html' }
        );
        return;
      }
      host.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-lg animate-fade-in">${list.map(Mahrad.renderProductCard).join('')}</div>`;
    }

    if (tab === 'address') {
      const u = Mahrad.getUser();
      document.getElementById('panel-address').innerHTML = `
        <form id="address-form" class="bg-bg-primary border border-border-light rounded-xl shadow-sm p-xl max-w-xl flex flex-col gap-lg animate-fade-in">
          <h2 class="text-lg font-semibold">آدرس پیش‌فرض</h2>
          <div class="border border-border-medium rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-focus">
            <label for="p-address" class="sr-only">آدرس</label>
            <textarea id="p-address" name="address" rows="4" required class="w-full px-lg py-3.5 outline-none bg-transparent leading-relaxed">${Mahrad.escapeHtml(u.address || '')}</textarea>
          </div>
          <button type="submit" class="bg-nav text-white px-xl py-md rounded-lg font-medium text-base hover:opacity-90 transition-all duration-200 w-fit">ذخیره آدرس</button>
        </form>`;
      document.getElementById('address-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        Mahrad.setUser({ ...Mahrad.getUser(), address: e.target.address.value.trim() });
        Mahrad.toast('آدرس ذخیره شد', 'success');
      });
    }
  }

  const tabs = [...document.querySelectorAll('.dash-tab')];
  tabs.forEach((btn, idx) => {
    btn.setAttribute('aria-controls', 'panel-' + btn.getAttribute('data-tab'));
    btn.addEventListener('click', () => setTab(btn.getAttribute('data-tab')));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const next = e.key === 'ArrowLeft' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
        setTab(tabs[next].getAttribute('data-tab'));
      }
    });
  });

  document.addEventListener('mahrad:wishlist', () => {
    if (activeTab === 'wishlist') renderPanel('wishlist');
  });

  Mahrad.loadJSON('data/products.json')
    .then((list) => {
      products = list;
      setTab(activeTab);
    })
    .catch((err) => {
      console.error(err);
      Mahrad.toast('خطا در بارگذاری داشبورد', 'error');
    });
})();
