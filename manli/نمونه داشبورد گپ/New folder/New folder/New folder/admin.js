/* ═══════════════════════════════════════════
   اسکریپت داشبورد مدیریت — مانلی شاپ
   تمام عملکردهای تعاملی در این فایل
   ═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   مدیریت سایدبار — باز/بستن در موبایل
   ═══════════════════════════════════════════ */
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const toggleBtn = document.getElementById('toggle-sidebar');
const closeBtn = document.getElementById('close-sidebar');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

/* ═══════════════════════════════════════════
   بستن سایدبار با کلید Escape
   ═══════════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

/* ═══════════════════════════════════════════
   ساعت سرور — به‌روزرسانی زنده
   ═══════════════════════════════════════════ */
function updateServerTime() {
  const now = new Date();
  const persianDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(now);
  const time = now.toLocaleTimeString('fa-IR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const timeEl = document.getElementById('server-time');
  if (timeEl) timeEl.textContent = persianDate + ' — ' + time;
}
updateServerTime();
setInterval(updateServerTime, 1000);

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

document.querySelectorAll('.kpi-card, .chart-card, .table-card, .list-card').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ═══════════════════════════════════════════
   نمودار میله‌ای — انیمیشن ورود
   ═══════════════════════════════════════════ */
function animateBarChart() {
  const bars = document.querySelectorAll('.bar-fill');
  bars.forEach((bar, index) => {
    const targetHeight = bar.style.height;
    bar.style.height = '0%';
    setTimeout(() => {
      bar.style.transition = 'height 1s cubic-bezier(0.4, 0, 0.2, 1)';
      bar.style.height = targetHeight;
    }, index * 150);
  });
}

/* ═══════════════════════════════════════════
   مشاهده نمودار میله‌ای و شروع انیمیشن
   ═══════════════════════════════════════════ */
const barChartObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateBarChart();
      barChartObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const barChartEl = document.querySelector('.bar-chart');
if (barChartEl) barChartObserver.observe(barChartEl);

/* ═══════════════════════════════════════════
   نمودار دایره‌ای — انیمیشن ورود
   ═══════════════════════════════════════════ */
function animateDonutChart() {
  const circles = document.querySelectorAll('.donut-svg circle');
  circles.forEach((circle, index) => {
    const originalDash = circle.getAttribute('stroke-dasharray');
    circle.setAttribute('stroke-dasharray', '0 251');
    setTimeout(() => {
      circle.style.transition = 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
      circle.setAttribute('stroke-dasharray', originalDash);
    }, index * 200);
  });
}

const donutObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateDonutChart();
      donutObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const donutEl = document.querySelector('.donut-chart');
if (donutEl) donutObserver.observe(donutEl);

/* ═══════════════════════════════════════════
   منوی کشویی اعلانات
   ═══════════════════════════════════════════ */
const notifBtn = document.getElementById('notif-btn');
if (notifBtn) {
  notifBtn.addEventListener('click', () => {
    showToast('🔔 ۱۲ اعلان جدید دارید');
  });
}

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
   کلیک روی ردیف جدول — مشاهده جزئیات
   ═══════════════════════════════════════════ */
document.querySelectorAll('.data-table tbody tr').forEach(row => {
  row.addEventListener('click', () => {
    showToast('📋 مشاهده جزئیات سفارش');
  });
});

/* ═══════════════════════════════════════════
   کلیک روی دکمه‌های عملیات
   ═══════════════════════════════════════════ */
document.querySelectorAll('.btn-action').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const label = btn.getAttribute('aria-label');
    showToast('⚙️ ' + label);
  });
});

/* ═══════════════════════════════════════════
   تغییر بازه زمانی نمودار
   ═══════════════════════════════════════════ */
const periodSelect = document.querySelector('.select-period');
if (periodSelect) {
  periodSelect.addEventListener('change', (e) => {
    showToast('📊 نمایش داده‌ها برای ' + e.target.options[e.target.selectedIndex].text);
    // اینجا می‌توان داده‌های نمودار را از سرور دریافت کرد
  });
}

/* ═══════════════════════════════════════════
   شمارنده انیمیشنی KPI
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

/* ═══════════════════════════════════════════
   شروع شمارنده هنگام مشاهده KPI
   ═══════════════════════════════════════════ */
const kpiObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const valueEl = entry.target.querySelector('.kpi-value');
      if (valueEl) {
        const text = valueEl.textContent.replace(/,/g, '');
        const target = parseInt(text) || 0;
        if (target > 0) {
          valueEl.textContent = '0';
          setTimeout(() => animateCounter(valueEl, target), 300);
        }
      }
      kpiObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.kpi-card').forEach(card => {
  kpiObserver.observe(card);
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
   ریسایز صفحه — بستن سایدبار در دسکتاپ
   ═══════════════════════════════════════════ */
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeSidebar();
  }
});

/* ═══════════════════════════════════════════
   لود کامل صفحه
   ═══════════════════════════════════════════ */
window.addEventListener('load', () => {
  showToast('✅ داشبورد مدیریت با موفقیت بارگذاری شد');
});
