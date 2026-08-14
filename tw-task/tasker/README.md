# Tasker PWA

مدیریت هوشمند تسک‌های روزانه — اپلیکیشن وب پیشرو (PWA)

## Stack

- **Vite 5** — Build tool + Dev server
- **Tailwind CSS v4** — Design system + Styling
- **Vanilla JS (ES Modules)** — Logic
- **localStorage** — Data persistence
- **Service Worker** — Offline support (PWA)

## دستورات

| دستور | توضیح |
|-------|--------|
| `npm run dev` | سرور توسعه → localhost:3000 با HMR |
| `npm run build` | Build تولید → `/dist` |
| `npm run preview` | پیش‌نمایش build تولید |
| `npm run clean` | حذف پوشه `/dist` |

## صفحات

| صفحه | مسیر |
|------|------|
| خانه (Dashboard) | `/index.html` |
| تقویم | `/src/pages/calendar.html` |
| تسک‌ها | `/src/pages/tasks.html` |
| پروفایل | `/src/pages/profile.html` |

## سفارشی‌سازی تم

تمام توکن‌های طراحی در `src/css/main.css` زیر `@theme {}`:

```css
@theme {
  --color-primary: #0d9488;  /* Teal */
  --color-stat-upcoming: #0d9488;
  --color-stat-today: #334155;
  --color-stat-completed: #7c3aed;
  /* ... */
}
```

## ساختار پروژه

```
tasker/
├── src/
│   ├── css/main.css       ← Design tokens + Components
│   ├── js/
│   │   ├── app.js         ← Shared logic
│   │   ├── home.js
│   │   ├── calendar.js
│   │   ├── tasks.js
│   │   └── profile.js
│   └── pages/
│       ├── calendar.html
│       ├── tasks.html
│       └── profile.html
├── public/
│   ├── manifest.json
│   └── sw.js
├── index.html
└── vite.config.js
```
