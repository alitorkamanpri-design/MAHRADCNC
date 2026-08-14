(function () {
  'use strict';
  Mahrad.initShell({ page: 'shop' });

  Mahrad.loadJSON('data/products.json').then((products) => {
    const ids = Mahrad.getCompare();
    const list = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean);
    const root = document.getElementById('compare-root');

    if (!list.length) {
      root.innerHTML = Mahrad.emptyState(
        'fa-solid fa-code-compare',
        'لیست مقایسه خالی است',
        'از صفحه محصول آیکن مقایسه را بزنید (حداکثر ۳ مورد).',
        { label: 'فروشگاه', href: 'shop.html' }
      );
      return;
    }

    const allKeys = new Set();
    list.forEach((p) => Object.keys(p.specs || {}).forEach((k) => allKeys.add(k)));
    const keys = ['برند', 'SKU', 'قیمت', 'موجودی', 'واحد', ...allKeys];

    const head = list
      .map(
        (p) => `
      <th class="p-lg min-w-[180px] align-top border-b border-border-light">
        <img src="${Mahrad.escapeHtml(p.image)}" alt="" class="w-full aspect-square object-cover rounded-lg mb-md bg-bg-tertiary">
        <a href="${Mahrad.productUrl(p)}" class="text-sm font-semibold text-text-primary hover:text-primary line-clamp-2">${Mahrad.escapeHtml(p.name)}</a>
        <button type="button" class="mt-md text-xs text-danger" data-remove="${Mahrad.escapeHtml(p.id)}">حذف</button>
      </th>`
      )
      .join('');

    const rows = keys
      .map((key) => {
        const cells = list
          .map((p) => {
            let val = '—';
            if (key === 'برند') val = p.brand || '—';
            else if (key === 'SKU') val = p.sku;
            else if (key === 'قیمت') val = Mahrad.formatPrice(p.price);
            else if (key === 'موجودی') val = String(p.stock);
            else if (key === 'واحد') val = p.unit || 'عدد';
            else if (p.specs && p.specs[key] != null) val = String(p.specs[key]);
            return `<td class="p-lg text-sm border-b border-border-light">${Mahrad.escapeHtml(val)}</td>`;
          })
          .join('');
        return `<tr><th class="p-lg text-sm text-text-secondary text-right bg-bg-secondary border-b border-border-light whitespace-nowrap">${Mahrad.escapeHtml(key)}</th>${cells}</tr>`;
      })
      .join('');

    root.innerHTML = `
      <div class="bg-bg-primary border border-border-light rounded-xl shadow-sm overflow-x-auto">
        <table class="w-full">
          <thead><tr><th class="p-lg bg-bg-secondary border-b border-border-light"></th>${head}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    root.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', () => {
        Mahrad.toggleCompare(btn.getAttribute('data-remove'));
        location.reload();
      });
    });
  });
})();
