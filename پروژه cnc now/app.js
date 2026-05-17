/* ═════════════════════════════════════════════════════════
   JavaScript - کد تعاملی سایت
   ═════════════════════════════════════════════════════════
   فایل: app.js
   توصیف: تمام عملکردهای تعاملی و دینامیکی
   ===================================================== */

// ─────────────────────────────────────────────────────
// 1. مدیریت تم (تیره/روشن)
// ─────────────────────────────────────────────────────
class ThemeManager {
  constructor() {
    this.html = document.documentElement;
    this.themeKey = "theme-preference";
    this.init();
  }

  init() {
    // بارگذاری تم ذخیره شده
    const savedTheme = localStorage.getItem(this.themeKey);
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // استفاده از تنظیمات سیستم
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      this.setTheme(prefersDark ? "dark" : "light");
    }

    // رصد تغییرات تم دکمه‌ها
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", () => this.toggle());
    });
  }

  setTheme(theme) {
    this.html.setAttribute("data-theme", theme);
    localStorage.setItem(this.themeKey, theme);
    this.updateToggleButtons(theme);
  }

  toggle() {
    const currentTheme = this.html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  updateToggleButtons(theme) {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute(
        "title",
        theme === "dark" ? "تغییر به حالت روشن" : "تغییر به حالت تیره",
      );
    });
  }
}

// ─────────────────────────────────────────────────────
// 2. مدیریت سایدبار
// ─────────────────────────────────────────────────────
class SidebarManager {
  constructor() {
    this.sidebar = document.querySelector(".admin-sidebar");
    this.overlay = document.querySelector(".admin-sidebar-overlay");
    this.toggleBtn = document.getElementById("sidebarToggle");
    this.closeBtn = document.querySelector(".sidebar-close");
    this.init();
  }

  init() {
    if (!this.sidebar || !this.toggleBtn) return;

    this.toggleBtn.addEventListener("click", () => this.toggle());
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }
    if (this.overlay) {
      this.overlay.addEventListener("click", () => this.close());
    }
  }

  toggle() {
    this.sidebar.classList.toggle("active");
    if (this.overlay) {
      this.overlay.classList.toggle("active");
    }
  }

  open() {
    this.sidebar.classList.add("active");
    if (this.overlay) {
      this.overlay.classList.add("active");
    }
  }

  close() {
    this.sidebar.classList.remove("active");
    if (this.overlay) {
      this.overlay.classList.remove("active");
    }
  }
}

// ─────────────────────────────────────────────────────
// 3. مدیریت فرم ورود/ثبت‌نام
// ─────────────────────────────────────────────────────
class AuthForm {
  constructor() {
    this.loginForm = document.getElementById("loginForm");
    this.registerForm = document.getElementById("registerForm");
    this.loginTab = document.querySelector('[data-tab="login"]');
    this.registerTab = document.querySelector('[data-tab="register"]');
    this.init();
  }

  init() {
    if (!this.loginForm && !this.registerForm) return;

    // مدیریت تب‌ها
    if (this.loginTab) {
      this.loginTab.addEventListener("click", () => this.switchTab("login"));
    }
    if (this.registerTab) {
      this.registerTab.addEventListener("click", () =>
        this.switchTab("register"),
      );
    }

    // فرم‌ها
    if (this.loginForm) {
      this.loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }
    if (this.registerForm) {
      this.registerForm.addEventListener("submit", (e) =>
        this.handleRegister(e),
      );
    }
  }

  switchTab(tab) {
    // مخفی کردن تمام تب‌ها
    document.querySelectorAll(".tab-content").forEach((el) => {
      el.classList.remove("active");
    });
    document.querySelectorAll("[data-tab]").forEach((el) => {
      el.classList.remove("active");
    });

    // نمایش تب انتخاب شده
    document
      .getElementById(tab + "Form")
      ?.parentElement.classList.add("active");
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add("active");
  }

  handleLogin(e) {
    e.preventDefault();
    const email = this.loginForm.querySelector('input[type="email"]').value;
    const password = this.loginForm.querySelector(
      'input[type="password"]',
    ).value;

    // بررسی اعتبار
    if (!this.validateEmail(email) || password.length < 6) {
      this.showError("ایمیل یا رمز عبور نامعتبر است");
      return;
    }

    // ذخیره داده و هدایت
    localStorage.setItem("user", JSON.stringify({ email, userType: "admin" }));
    window.location.href = "admin.html";
  }

  handleRegister(e) {
    e.preventDefault();
    const email = this.registerForm.querySelector('input[type="email"]').value;
    const password = this.registerForm.querySelector(
      'input[type="password"]',
    ).value;
    const confirmPassword = this.registerForm.querySelector(
      'input[name="confirm-password"]',
    ).value;

    if (!this.validateEmail(email)) {
      this.showError("ایمیل نامعتبر است");
      return;
    }

    if (password.length < 6) {
      this.showError("رمز عبور باید حداقل 6 کاراکتر باشد");
      return;
    }

    if (password !== confirmPassword) {
      this.showError("رمزهای عبور مطابقت ندارند");
      return;
    }

    // ذخیره و هدایت
    localStorage.setItem(
      "user",
      JSON.stringify({ email, userType: "customer" }),
    );
    window.location.href = "customer.html";
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  showError(message) {
    alert(message);
  }
}

// ─────────────────────────────────────────────────────
// 4. مدیریت سبد خرید
// ─────────────────────────────────────────────────────
class Cart {
  constructor() {
    this.cartKey = "cart-items";
    this.cart = this.loadCart();
    this.init();
  }

  init() {
    document.querySelectorAll(".product-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.addToCart(e));
    });
    this.updateCartBadge();
  }

  loadCart() {
    const saved = localStorage.getItem(this.cartKey);
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
  }

  addToCart(event) {
    const product = event.target.closest(".product-card");
    const item = {
      id: Math.random(),
      name: product.querySelector(".product-title").textContent,
      price: parseInt(product.querySelector(".product-price").textContent),
      quantity: 1,
    };

    const existing = this.cart.find((p) => p.name === item.name);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push(item);
    }

    this.saveCart();
    this.updateCartBadge();
    this.showNotification("✅ محصول به سبد خرید اضافه شد");
  }

  updateCartBadge() {
    const badge = document.querySelector(".navbar-badge");
    if (badge) {
      badge.textContent = this.cart.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
    }
  }

  showNotification(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: var(--success);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 9999;
      animation: slideInUp 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  getTotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}

// ─────────────────────────────────────────────────────
// 5. مدیریت منوی تحت‌الطلب
// ─────────────────────────────────────────────────────
class NavMenu {
  constructor() {
    this.menuBtn = document.querySelector(".topbar-menu-btn");
    this.menu = document.querySelector(".navbar-menu");
    this.init();
  }

  init() {
    if (!this.menuBtn || !this.menu) return;

    this.menuBtn.addEventListener("click", () => {
      this.menu.classList.toggle("active");
    });

    // بستن منو هنگام کلیک روی لینک
    this.menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        this.menu.classList.remove("active");
      });
    });
  }
}

// ─────────────────────────────────────────────────────
// 6. مدیریت تب‌های داشبورد
// ─────────────────────────────────────────────────────
class TabManager {
  constructor() {
    this.tabs = document.querySelectorAll("[data-tab]");
    this.contents = document.querySelectorAll(".tab-content");
    this.init();
  }

  init() {
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => this.switchTab(e));
    });
  }

  switchTab(event) {
    const tabName = event.target.getAttribute("data-tab");

    // مخفی کردن تمام محتوا
    this.contents.forEach((content) => {
      content.classList.remove("active");
    });

    // مخفی کردن تب‌های فعال
    this.tabs.forEach((tab) => {
      tab.classList.remove("active");
    });

    // فعال کردن تب و محتوای انتخاب شده
    event.target.classList.add("active");
    document.querySelector(`#${tabName}`).classList.add("active");
  }
}

// ─────────────────────────────────────────────────────
// 7. بررسی ورود و هدایت
// ─────────────────────────────────────────────────────
class AuthCheck {
  static checkLogin() {
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "auth.html";
    }
    return user ? JSON.parse(user) : null;
  }

  static logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("cart-items");
    window.location.href = "index.html";
  }

  static getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}

// ─────────────────────────────────────────────────────
// 8. اعتبارسنجی فرم
// ─────────────────────────────────────────────────────
class FormValidator {
  static validate(form) {
    const inputs = form.querySelectorAll("input, textarea");
    let isValid = true;

    inputs.forEach((input) => {
      input.classList.remove("error");

      // بررسی field خالی
      if (!input.value.trim()) {
        input.classList.add("error");
        isValid = false;
      }

      // بررسی ایمیل
      if (input.type === "email" && input.value.trim()) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          input.classList.add("error");
          isValid = false;
        }
      }

      // بررسی شماره
      if (input.type === "number" && input.value.trim()) {
        if (!/^\d+$/.test(input.value)) {
          input.classList.add("error");
          isValid = false;
        }
      }
    });

    return isValid;
  }
}

// ─────────────────────────────────────────────────────
// 9. مدیریت جستجو
// ─────────────────────────────────────────────────────
class SearchManager {
  constructor() {
    this.searchInput = document.querySelector(".topbar__search input");
    this.suggestionBox = document.querySelector(".search-suggestions");
    this.init();
  }

  init() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener("input", (e) => {
      const query = e.target.value;
      if (query.length > 0) {
        this.search(query);
      } else {
        this.suggestionBox.innerHTML = "";
      }
    });
  }

  search(query) {
    const suggestions = [
      "چاقوی برش",
      "تیغه فراز",
      "قالب‌های دقیق",
      "روغن صنعتی",
      "ابزارهای تراش",
    ].filter((item) => item.includes(query));

    this.suggestionBox.innerHTML = suggestions
      .map((item) => `<div class="suggestion-item">${item}</div>`)
      .join("");

    this.suggestionBox.querySelectorAll(".suggestion-item").forEach((item) => {
      item.addEventListener("click", () => {
        this.searchInput.value = item.textContent;
        this.suggestionBox.innerHTML = "";
      });
    });
  }
}

// ─────────────────────────────────────────────────────
// 10. مدیریت سازه‌ای درخواست
// ─────────────────────────────────────────────────────
class API {
  static async get(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  static async post(url, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }
}

// ─────────────────────────────────────────────────────
// شروع اپلیکیشن
// ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // شروع مدیریت‌ها
  new ThemeManager();
  new SidebarManager();
  new AuthForm();
  new Cart();
  new NavMenu();
  new TabManager();
  new SearchManager();

  // لایه‌های logout
  document.querySelectorAll(".sidebar-logout, .btn-logout").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("آیا مطمئن هستید؟")) {
        AuthCheck.logout();
      }
    });
  });

  // مدیریت منوی سایدبار
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    link.addEventListener("click", function () {
      document
        .querySelectorAll(".sidebar-link")
        .forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    });
  });

  console.log("✅ اپلیکیشن بارگذاری شد");
});
