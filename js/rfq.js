(function () {
  'use strict';
  Mahrad.initShell({ page: 'rfq' });

  let products = [];

  function buildLines(source) {
    const map = Object.fromEntries(products.map((p) => [p.id, p]));
    if (source === 'compare') {
      return Mahrad.getCompare()
        .map((id) => map[id])
        .filter(Boolean)
        .map((p) => `- ${p.name} | ${p.sku} | qty:?`)
        .join('\n');
    }
    return Mahrad.getCart()
      .map((i) => {
        const p = map[i.productId];
        return p ? `- ${p.name} | ${p.sku} × ${i.qty}` : '';
      })
      .filter(Boolean)
      .join('\n');
  }

  function refresh() {
    const source = document.querySelector('input[name="source"]:checked')?.value || 'cart';
    const lines = buildLines(source) || '(لیست خالی است — از فروشگاه اضافه کنید)';
    document.getElementById('rfq-preview').textContent = lines;
  }

  document.querySelectorAll('input[name="source"]').forEach((el) => el.addEventListener('change', refresh));

  document.getElementById('rfq-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (!Mahrad.validatePhone(f.phone.value.trim())) {
      Mahrad.toast('موبایل نامعتبر است', 'error');
      return;
    }
    const source = f.source.value;
    const lines = buildLines(source);
    if (!lines) {
      Mahrad.toast('لیست خالی است', 'error');
      return;
    }
    const text =
      'RFQ MahradCNC\nشرکت: ' +
      (f.company.value || '—') +
      '\nموبایل: ' +
      f.phone.value.trim() +
      '\n\n' +
      lines +
      '\n\n' +
      (f.note.value || '');
    window.open(Mahrad.waInquiryUrl(text), '_blank', 'noopener');
  });

  Mahrad.loadJSON('data/products.json').then((list) => {
    products = list;
    const u = Mahrad.getUser();
    const form = document.getElementById('rfq-form');
    if (form) {
      form.company.value = u.company || '';
      form.phone.value = u.phone || '';
    }
    refresh();
  });
})();
