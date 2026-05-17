/* ═══════════════════════════════════════════
   اسکریپت داشبورد مشتری — مانلی شاپ
   تمام عملکردهای تعاملی در این فایل
   ═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   انیمیشن ورود کارت‌ها — Intersection Observer
   ═══════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.summary-card, .order-item, .wishlist-item, .coupon-card, .address-card, .rec-card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ═══════════════════════════════════════════
   کپی کد تخفیف
   ═══════════════════════════════════════════ */
document.querySelectorAll('.btn-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const code = btn.closest('.coupon-card').querySelector('.coupon-code').textContent;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        showToast('✅ کد تخفیف ' + code + ' کپی شد!');
      }).catch(() => {
        showToast('⚠️ کپی ناموفق بود');
      });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('✅ کد تخفیف ' + code + ' کپی شد!');
    }
  });
});

/* ═══════════════════════════════════════════
   افزودن به سبد از علاقه‌مندی‌ها
   ═══════════════════════════════════════════ */
document.querySelectorAll('.btn-wish-add, .btn-rec-add').forEach(btn => {
  btn.addEventListener('click', () => {
    showToast('✅ محصول به سبد خرید اضافه شد');
  });
});

/* ═══════════════════════════════════════════
   حذف از علاقه‌مندی‌ها
   ═══════════════════════════════════════════ */
document.querySelectorAll('.btn-wish-remove').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.wishlist-item');
    item.style.transition = 'all 0.3s ease';
    item.style.opacity = '0';
    item.style.transform = 'translateX(20px)';
    setTimeout(() => item.remove(), 300);
    showToast('💔 از علاقه‌مندی‌ها حذف شد');
  });
});

/* ═══════════════════════════════════════════
   Toast notification
   ═══════════════════════════════════════════ */
function showToast(msg, duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }, duration);
}

/* ═══════════════════════════════════════════
   دکمه‌های سفارش
   ═══════════════════════════════════════════ */
document.querySelectorAll('.btn-sm').forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.textContent.trim();
    showToast('⚙️ ' + label);
  });
});

/* ═══════════════════════════════════════════
   افزودن آدرس جدید
   ═══════════════════════════════════════════ */
const addAddressBtn = document.querySelector('.btn-add-address');
if (addAddressBtn) {
  addAddressBtn.addEventListener('click', () => {
    showToast('📍 فرم افزودن آدرس باز شد');
  });
}

/* ═══════════════════════════════════════════
   ویرایش آدرس
   ═══════════════════════════════════════════ */
document.querySelectorAll('.btn-address-action').forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.getAttribute('aria-label');
    showToast('⚙️ ' + label);
  });
});

/* ═══════════════════════════════════════════
   خروج از حساب کاربری
   ═══════════════════════════════════════════ */
const logoutBtn = document.querySelector('.btn-logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    showToast('🚪 در حال خروج از حساب کاربری...');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);
  });
}

/* ═══════════════════════════════════════════
   شمارنده انیمیشنی خلاصه فعالیت
   ═══════════════════════════════════════════ */
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString('fa-IR');
  }, 16);
}

const summaryObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const valueEl = entry.target.querySelector('strong');
      if (valueEl) {
        const text = valueEl.textContent.replace(/,/g, '');
        const target = parseInt(text) || 0;
        if (target > 0) {
          valueEl.textContent = '0';
          setTimeout(() => animateCounter(valueEl, target), 300);
        }
      }
      summaryObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.summary-card').forEach(card => {
  summaryObserver.observe(card);
});

/* ═══════════════════════════════════════════
   انیمیشن نوار پیشرفت VIP
   ═══════════════════════════════════════════ */
const progressObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target.querySelector('.progress-fill');
      if (fill) {
        const targetWidth = fill.style.width;
        fill.style.width = '0%';
        setTimeout(() => {
          fill.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
          fill.style.width = targetWidth;
        }, 300);
      }
      progressObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const progressBar = document.querySelector('.progress-bar');
if (progressBar) progressObserver.observe(progressBar);

/* ═══════════════════════════════════════════
   لود کامل صفحه
   ═══════════════════════════════════════════ */
window.addEventListener('load', () => {
  showToast('✅ خوش آمدید سارا!');
});
