---
name: Tasker PWA Planning
overview: برنامه‌ریزی کامل و فازبندی‌شده پیاده‌سازی یک اپلیکیشن PWA مدیریت تسک با ۴ صفحه، بر پایه Vite + Tailwind CSS v4، با طراحی Light-mode موبایل‌محور کاملاً مطابق با تصویر بنچمارک (پس‌زمینه آبی-خاکستری روشن، کارت‌های سفید، رنگ اصلی Teal).
todos:
  - id: phase0-setup
    content: "فاز 0: ایجاد ساختار پوشه‌ها، vite.config.js، package.json scripts، README.md"
    status: completed
  - id: phase1-css
    content: "فاز 1: ایجاد src/css/main.css با تمام design tokens، @layer base/components/utilities، keyframes"
    status: completed
  - id: phase2-appjs
    content: "فاز 2: ایجاد src/js/app.js — مدل داده، localStorage helpers، navigation، sample data"
    status: completed
  - id: phase3-home
    content: "فاز 3: ایجاد index.html (Home) + src/js/home.js — header، stats، progress ring، today tasks"
    status: completed
  - id: phase4-calendar
    content: "فاز 4: ایجاد src/pages/calendar.html + src/js/calendar.js — month grid، timeline view"
    status: completed
  - id: phase5-tasks
    content: "فاز 5: ایجاد src/pages/tasks.html + src/js/tasks.js — list، filter، search، add/edit modal"
    status: completed
  - id: phase6-profile
    content: "فاز 6: ایجاد src/pages/profile.html + src/js/profile.js — avatar upload، edit form، stats"
    status: completed
  - id: phase7-pwa
    content: "فاز 7: ایجاد public/manifest.json، public/sw.js، آیکون‌ها، meta tags در همه صفحات"
    status: completed
  - id: phase8-polish
    content: "فاز 8: بررسی نهایی — responsive، RTL، animations، cross-page nav highlight، empty states"
    status: in_progress
isProject: false
---

# برنامه‌ریزی جامع پروژه Tasker PWA

## معماری کلی

- **Stack:** Vite 5 + Tailwind CSS v4 + Vanilla JS (no framework)
- **Platform:** PWA, Mobile-first (portrait, max-width ~430px)
- **Data:** localStorage (no backend needed)
- **Font:** Sahel (Persian) + Font Awesome 6 (icons)
- **Directory:** `c:\laragon\www\tw-task\tasker\`
- **Theme:** **Light mode** — دقیقاً مطابق تصویر بنچمارک:
  - پس‌زمینه کل اپ: آبی-خاکستری روشن (`#EBF0F6`)
  - کارت‌ها: سفید خالص (`#FFFFFF`) با سایه ظریف
  - رنگ اصلی (Primary): **Teal** (`#0D9488`)
  - کارت آمار ۱ "Upcoming": پس‌زمینه Teal با متن سفید
  - کارت آمار ۲ "Today": پس‌زمینه Navy/Slate (`#334155`) با متن سفید
  - کارت آمار ۳ "Completed": پس‌زمینه Purple (`#7C3AED`) با متن سفید
  - Badge اولویت High: بنفش outline روشن
  - Badge اولویت Medium: Teal outline روشن
  - Badge اولویت Low: آبی-آسمانی outline روشن
  - کارت‌های تقویم High: پس‌زمینه Mint روشن
  - کارت‌های تقویم Medium: پس‌زمینه Lavender روشن
  - FAB دکمه: دایره تیره/مشکی (`#1E293B`) با + سفید
  - Bottom Nav: سفید، آیکون‌های outline، active با متن تیره

---

## ساختار نهایی پروژه

```
tasker/
├── src/
│   ├── css/
│   │   └── main.css          ← Design tokens + @layer components
│   ├── js/
│   │   ├── app.js            ← Shared: storage, data model, nav logic
│   │   ├── home.js           ← Dashboard logic
│   │   ├── calendar.js       ← Calendar & timeline logic
│   │   ├── tasks.js          ← Task CRUD + modal
│   │   └── profile.js        ← Profile management
│   └── pages/
│       ├── calendar.html
│       ├── tasks.html
│       └── profile.html
├── public/
│   ├── manifest.json         ← PWA manifest
│   ├── sw.js                 ← Service Worker
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── index.html                ← Home page
├── vite.config.js
├── package.json              ← already has deps
└── README.md
```

---

## فاز 0: راه‌اندازی پایه (Foundation)

### 0.1 — vite.config.js

فایل [`tasker/vite.config.js`](tasker/vite.config.js) ایجاد می‌شود:

```javascript
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        calendar: resolve(__dirname, 'src/pages/calendar.html'),
        tasks:    resolve(__dirname, 'src/pages/tasks.html'),
        profile:  resolve(__dirname, 'src/pages/profile.html'),
      },
    },
  },
  server: { port: 3000, open: true },
})
```

### 0.2 — package.json scripts

```json
"scripts": {
  "dev":     "vite",
  "build":   "vite build",
  "preview": "vite preview",
  "clean":   "rm -rf dist"
}
```

### 0.3 — src/css/main.css (Design System Tokens)

**کاملاً مطابق تصویر بنچمارک — Light Mode:**

```css
@import "tailwindcss";

@theme {
  /* ─── رنگ اصلی: Teal (از بنچمارک) ─── */
  --color-primary:         #0d9488;   /* teal-600 — رنگ اصلی کل اپ */
  --color-primary-hover:   #0f766e;   /* teal-700 — hover state */
  --color-primary-light:   #ccfbf1;   /* teal-100 — پس‌زمینه‌های روشن */
  --color-primary-soft:    #f0fdfa;   /* teal-50 — subtle bg */

  /* ─── رنگ‌های آمار (Stats Cards) — عیناً از بنچمارک ─── */
  --color-stat-upcoming:   #0d9488;   /* Teal — کارت Upcoming */
  --color-stat-today:      #334155;   /* Slate-700/Navy — کارت Today */
  --color-stat-completed:  #7c3aed;   /* Violet-600 — کارت Completed */

  /* ─── رنگ‌های اولویت (Priority) ─── */
  --color-priority-high:   #7c3aed;   /* violet-600 — High priority */
  --color-priority-high-bg:#f5f3ff;   /* violet-50  — bg badge High */
  --color-priority-medium: #0d9488;   /* teal-600   — Medium priority */
  --color-priority-medium-bg:#f0fdfa; /* teal-50    — bg badge Medium */
  --color-priority-low:    #0284c7;   /* sky-600    — Low priority */
  --color-priority-low-bg: #f0f9ff;   /* sky-50     — bg badge Low */

  /* ─── رنگ‌های کارت‌های تقویم (Calendar Slots) ─── */
  --color-slot-high:       #ccfbf1;   /* teal-100 — slot High (mint) */
  --color-slot-medium:     #ede9fe;   /* violet-100 — slot Medium (lavender) */
  --color-slot-low:        #e0f2fe;   /* sky-100  — slot Low */

  /* ─── پس‌زمینه‌ها (Backgrounds) ─── */
  --color-bg-app:          #ebf0f6;   /* خاکستری-آبی روشن — bg کل اپ */
  --color-bg-card:         #ffffff;   /* سفید — کارت‌ها */
  --color-bg-input:        #f8fafc;   /* slate-50 — input fields */
  --color-bg-nav:          #ffffff;   /* سفید — bottom nav */
  --color-bg-overlay:      rgba(15,23,42,0.45); /* overlay مودال */

  /* ─── متن (Text) ─── */
  --color-text-primary:    #0f172a;   /* slate-900 — عنوان‌های اصلی */
  --color-text-secondary:  #64748b;   /* slate-500 — متن‌های فرعی */
  --color-text-muted:      #94a3b8;   /* slate-400 — placeholder، label */
  --color-text-on-color:   #ffffff;   /* متن روی پس‌زمینه رنگی */

  /* ─── رنگ‌های semantic ─── */
  --color-success:         #10b981;   /* emerald-500 */
  --color-success-bg:      #d1fae5;   /* emerald-100 */
  --color-warning:         #f59e0b;   /* amber-500 */
  --color-danger:          #ef4444;   /* red-500 */

  /* ─── دسته‌بندی تسک (Category Colors) ─── */
  --color-cat-work:        #0d9488;   /* teal */
  --color-cat-personal:    #ec4899;   /* pink */
  --color-cat-health:      #10b981;   /* emerald */
  --color-cat-study:       #f59e0b;   /* amber */

  /* ─── Border ─── */
  --color-border:          #e2e8f0;   /* slate-200 */
  --color-border-light:    #f1f5f9;   /* slate-100 */

  /* ─── FAB دکمه ─── */
  --color-fab:             #1e293b;   /* slate-800 — دکمه + گرد تیره */

  /* ─── Days Left Badge ─── */
  --color-days-left-bg:    #d1fae5;   /* emerald-100 */
  --color-days-left-text:  #065f46;   /* emerald-800 */

  /* ─── Spacing ─── */
  --spacing-xs: 4px;   --spacing-sm: 8px;
  --spacing-md: 12px;  --spacing-lg: 16px;
  --spacing-xl: 20px;  --spacing-2xl: 24px;
  --spacing-3xl: 32px;

  /* ─── Border Radius ─── */
  --radius-sm: 8px;   --radius-md: 12px;  --radius-lg: 16px;
  --radius-xl: 20px;  --radius-2xl: 24px; --radius-3xl: 32px;

  /* ─── Shadows ─── */
  --shadow-card:    0 2px 12px rgba(15,23,42,0.07);
  --shadow-card-md: 0 4px 20px rgba(15,23,42,0.10);
  --shadow-button:  0 4px 12px rgba(13,148,136,0.35);
  --shadow-fab:     0 6px 20px rgba(30,41,59,0.30);
  --shadow-nav:     0 -2px 16px rgba(15,23,42,0.06);

  /* ─── Typography ─── */
  --font-sans: 'Sahel', 'Inter', ui-sans-serif, system-ui;
  --text-xs: 12px;   --text-sm: 13px;   --text-base: 15px;
  --text-md: 16px;   --text-lg: 18px;   --text-xl: 20px;
  --text-2xl: 24px;  --text-3xl: 30px;

  /* ─── Transitions ─── */
  --transition-fast:   all 0.15s ease;
  --transition-normal: all 0.25s ease;
}
```

**`@layer base`:**
- reset (`box-sizing: border-box`)
- `body`: پس‌زمینه `bg-bg-app`، رنگ متن `text-text-primary`، فونت Sahel
- scrollbar ظریف با رنگ `#CBD5E1`

**`@layer components` — کامپوننت‌های استاندارد شده:**

```css
/* کارت تسک — سفید، سایه ظریف */
.task-card {
  @apply bg-bg-card rounded-3xl shadow-card p-lg border border-border-light
         transition-all duration-200 hover:shadow-card-md;
}

/* کارت آمار — رنگی با متن سفید */
.stat-card {
  @apply rounded-2xl p-lg flex flex-col gap-sm text-text-on-color;
}
/* variant: teal/navy/purple از token مستقیم */

/* آیتم ناوبری پایین */
.nav-item {
  @apply flex flex-col items-center gap-1 px-md py-sm rounded-xl
         text-text-muted text-xs transition-all duration-200;
}
.nav-item.active {
  @apply text-text-primary font-semibold;
}

/* Badge اولویت — outlined style */
.badge-high   { @apply inline-flex items-center gap-1 bg-priority-high-bg
                       text-priority-high border border-priority-high/20
                       px-2.5 py-0.5 rounded-full text-xs font-medium; }
.badge-medium { @apply inline-flex items-center gap-1 bg-priority-medium-bg
                       text-priority-medium border border-priority-medium/20
                       px-2.5 py-0.5 rounded-full text-xs font-medium; }
.badge-low    { @apply inline-flex items-center gap-1 bg-priority-low-bg
                       text-priority-low border border-priority-low/20
                       px-2.5 py-0.5 rounded-full text-xs font-medium; }

/* دکمه Primary — Teal */
.btn-primary {
  @apply bg-primary text-text-on-color px-xl py-md rounded-2xl font-semibold
         text-base hover:-translate-y-0.5 hover:shadow-button
         transition-all duration-200 inline-flex items-center justify-center gap-2;
}

/* دکمه ثانویه */
.btn-secondary {
  @apply bg-bg-input text-text-secondary border border-border px-xl py-md
         rounded-2xl font-medium text-base hover:bg-border-light
         transition-all duration-200 inline-flex items-center justify-center gap-2;
}

/* دکمه FAB — تیره */
.btn-fab {
  @apply bg-fab text-white w-14 h-14 rounded-full shadow-fab flex items-center
         justify-center text-2xl hover:-translate-y-0.5
         transition-all duration-200;
}

/* Input Field */
.input-field {
  @apply w-full bg-bg-input border border-border rounded-xl px-lg py-md
         text-text-primary text-base outline-none placeholder:text-text-muted
         focus:border-primary focus:ring-2 focus:ring-primary/20
         transition-all duration-200;
}

/* کانتینر صفحه */
.page-container {
  @apply min-h-screen pb-20 bg-bg-app;
}

/* کارت تقویم High */
.calendar-slot-high   { @apply bg-slot-high rounded-2xl p-md; }
.calendar-slot-medium { @apply bg-slot-medium rounded-2xl p-md; }
.calendar-slot-low    { @apply bg-slot-low rounded-2xl p-md; }
```

**`@layer utilities`:**
- `.progress-donut` — SVG circle helper
- `.avatar-group` — مجموعه آواتار روی هم (overlap)
- `.safe-bottom` — `padding-bottom: max(env(safe-area-inset-bottom), 12px)`
- `.days-badge` — badge "X Days Left" سبز

**`@keyframes`:** `fadeInUp`، `slideInBottom`، `scaleIn`، `countUp` (انیمیشن شمارش اعداد)

---

## فاز 1: مدل داده و منطق مشترک (app.js)

مدل داده (نگهداری در localStorage):

**Task Schema:**
- `id` — string (nanoid یا Date.now)
- `title` — string
- `description` — string
- `date` — "YYYY-MM-DD"
- `time` — "HH:MM"
- `priority` — `'high' | 'medium' | 'low'`
- `category` — `'work' | 'personal' | 'health' | 'study'`
- `completed` — boolean
- `createdAt` — timestamp

**Profile Schema:**
- `name`, `email`, `bio`, `avatar` (base64 data URL)

توابع shared در `app.js`:
- `getTasks()` / `saveTasks(tasks)`
- `getProfile()` / `saveProfile(profile)`
- `getTasksByDate(date)` — فیلتر روزانه
- `getTaskStats()` — `{ total, completed, pending, todayTotal, todayCompleted }`
- `generateId()` — تولید ID منحصربه‌فرد
- `initNavigation()` — highlight ناوبری active
- Sample data factory — ۸ تسک نمونه برای اولین بار

---

## فاز 2: Navigation Bar مشترک

**دقیقاً مطابق بنچمارک:** Bottom Navigation سفید رنگ با ۴ آیتم + دکمه FAB شناور.

```
[ Home ]  [ Calendar ]  [ Task ]  [ Profile ]
```

دکمه FAB (دایره تیره/مشکی با + سفید) **خارج از nav bar** به صورت شناور بالای آن قرار می‌گیرد، در تمام صفحات visible است و به modal افزودن تسک لینک دارد.

ساختار HTML مشترک (در پایین هر صفحه):

```html
<!-- FAB Button -->
<button class="btn-fab fixed bottom-[84px] left-1/2 -translate-x-1/2 z-50">
  <i class="fa-solid fa-plus"></i>
</button>

<!-- Bottom Navigation -->
<nav class="fixed bottom-0 left-0 right-0 bg-bg-nav shadow-nav z-40 safe-bottom">
  <div class="flex items-center justify-around px-2 pt-3 pb-2 max-w-md mx-auto">
    <a href="/index.html" class="nav-item" data-page="home">
      <i class="fa-solid fa-house text-xl"></i>
      <span>خانه</span>
    </a>
    <a href="/src/pages/calendar.html" class="nav-item" data-page="calendar">
      <i class="fa-regular fa-calendar text-xl"></i>
      <span>تقویم</span>
    </a>
    <a href="/src/pages/tasks.html" class="nav-item" data-page="tasks">
      <i class="fa-regular fa-rectangle-list text-xl"></i>
      <span>تسک</span>
    </a>
    <a href="/src/pages/profile.html" class="nav-item" data-page="profile">
      <i class="fa-regular fa-user text-xl"></i>
      <span>پروفایل</span>
    </a>
  </div>
</nav>
```

**وضعیت active:** `text-text-primary font-semibold` (تیره‌تر از بقیه) — بدون رنگ Teal در nav، آیکون active با Filled variant جایگزین Outline می‌شود.

---

## فاز 3: صفحه خانه — index.html + home.js

### لایه‌بندی بصری — دقیقاً مطابق بنچمارک (از بالا به پایین)

**Header:**
- پس‌زمینه: `bg-bg-app` (آبی-خاکستری روشن) — **بدون gradient تیره**
- ردیف اول: آواتار کاربر دایره‌ای کوچک (سمت راست در RTL) + آیکون زنگ 🔔 (سمت چپ)
- ردیف دوم: متن خوش‌آمدگویی "صبح بخیر،" با رنگ `text-text-secondary` (خاکستری)
- ردیف سوم: نام کاربر **بولد و بزرگ** (`text-3xl font-bold text-text-primary`) + ایموجی 👋

**Stats Row (۳ کارت رنگی — عیناً از بنچمارک):**

```
┌──────────────┬──────────────┬──────────────┐
│  bg-teal     │   bg-navy    │  bg-purple   │
│  Upcoming    │   Today      │  Completed   │
│  16 tasks    │   4 tasks    │  23 tasks    │
└──────────────┴──────────────┴──────────────┘
```

هر کارت `stat-card`:
- لیبل بالا: "Upcoming" / "Today" / "Completed" (`text-sm text-white/80`)
- عدد بزرگ با انیمیشن count-up (`text-3xl font-bold text-white`)
- زیرنویس "tasks" (`text-sm text-white/70`)

**بخش "Recent task":**
- Header: متن "آخرین تسک‌ها" (سمت راست) + لینک "مشاهده همه" به صفحه tasks (سمت چپ، رنگ primary Teal)
- هر **task-card** (سفید، گرد، سایه ظریف) شامل:
  - ردیف بالا: badge اولویت (outlined) سمت راست + درصد پیشرفت + **SVG donut chart کوچک** سمت چپ
  - عنوان تسک (`text-xl font-bold text-text-primary`)
  - بازه زمانی (`text-sm text-text-muted` مثل "۰۹:۳۰ - ۱۳:۱۰")
  - ردیف پایین: **گروه آواتار** (۳ عکس کوچک روی هم) سمت راست + badge "X روز مانده" سبز رنگ سمت چپ
- انیمیشن ظاهر شدن cards: `fadeInUp` با `animation-delay` staggered (۰ms، ۵۰ms، ۱۰۰ms)

**SVG Donut Chart (progress arc کوچک در task card):**
- دایره ۴۰×۴۰px با `stroke-dasharray` و `stroke-dashoffset` محاسبه‌شده از progress%
- رنگ stroke: `color-primary` برای medium، `color-priority-high` برای high
- عدد درصد در مرکز (`text-xs font-semibold`)

---

## فاز 4: صفحه تقویم — src/pages/calendar.html + calendar.js

### لایه‌بندی بصری — دقیقاً مطابق بنچمارک

**Header:**
- متن ماه و سال با dropdown arrow: "مرداد ∨" (`text-2xl font-bold text-text-primary`)
- سمت چپ: دو آیکون toggle نمای list/grid (`fa-list` و `fa-th`)
- پس‌زمینه: `bg-bg-app`

**Date Strip (ناوبری افقی روزها):**
```
  19   20   [دوشنبه ۲۱]   22   23   24   →
```
- اسکرول افقی (`overflow-x-auto`, `scroll-snap-x`)
- هر آیتم: عدد روز + اول نام روز هفته
- روز انتخاب‌شده: `bg-stat-today text-white rounded-2xl` (navy/slate تیره — عیناً مثل بنچمارک)
- سایر روزها: `text-text-secondary`
- روزهای دارای تسک: نقطه کوچک Teal زیر عدد

**Timeline Section (روز انتخاب‌شده):**

ساختار دقیق بنچمارک:
```
08:00  ┤  ╔═══════════════════════════════╗
       │  ║  [High]           [avatars]  ║  ← bg-slot-high (mint)
       │  ║  Client Meeting              ║
       │  ║  90 Mins                     ║
       │  ╚═══════════════════════════════╝

09:00  ┤  ╔═══════════════════════════════╗
       │  ║  [Low]            [avatar]   ║  ← bg-slot-low (sky)
       │  ║  Mobile App Review           ║
       │  ║  30 Mins                     ║
       │  ╚═══════════════════════════════╝
```

- ساعت در سمت راست (RTL): `text-sm text-text-muted w-14`
- خط زمانی عمودی: `border-r border-border` (در RTL)
- کارت تسک با **رنگ پس‌زمینه بر اساس اولویت**:
  - High → `calendar-slot-high` (mint/teal-100)
  - Medium → `calendar-slot-medium` (lavender/violet-100)
  - Low → `calendar-slot-low` (sky-100)
- داخل هر کارت: badge اولویت + گروه آواتار + عنوان + مدت زمان
- خط پیشرفت زمانی (current time indicator): خط افقی `bg-text-primary` با دایره کوچک در ابتدا

---

## فاز 5: صفحه تسک‌ها — src/pages/tasks.html + tasks.js

### لایه‌بندی بصری — Light Mode با کارت‌های سفید

**Header:**
- پس‌زمینه `bg-bg-app`
- عنوان "تسک‌ها" (`text-2xl font-bold text-text-primary`) سمت راست
- آیکون تنظیمات/فیلتر سمت چپ

**Search Bar:**
- کارت سفید گرد (`bg-bg-card rounded-2xl shadow-card`)
- آیکون 🔍 رنگ `text-text-muted` + placeholder "جستجوی تسک..."
- فیلتر real-time با `keyup` در JS

**Filter Tabs:**
```
[ همه ]  [ فعال ]  [ تکمیل شده ]  [ اولویت بالا ]
```
- Scroll افقی برای موبایل
- Active: `bg-primary text-white rounded-xl px-md py-sm`
- Inactive: `bg-bg-card text-text-muted rounded-xl px-md py-sm border border-border`

**Task List (Light Mode):**

هر `task-card` (سفید، گرد، سایه ظریف) شامل:
- ردیف بالا: badge اولویت (outlined) سمت راست + درصد + donut chart سمت چپ
- **عنوان تسک** bold و بزرگ (`text-lg font-bold`)
- بازه زمانی (`text-sm text-text-muted`)
- ردیف پایین: **گروه آواتار** (۳ دایره کوچک روی هم) + badge "X Days Left" سبز
- دکمه‌های action (ویرایش + حذف) با `hover:opacity-100` — پیش‌فرض کمی محو
- وقتی completed: عنوان `line-through text-text-muted`، badge "تکمیل شد"

**Add/Edit Bottom Sheet Modal:**
- `modal-overlay` با `backdrop-blur-sm bg-bg-overlay`
- Bottom sheet **سفید** (`bg-bg-card rounded-t-3xl`) با `animate-slide-in`
- Drag handle خاکستری روشن در بالا مرکز
- فیلدهای `input-field`:
  - عنوان (required با validation)
  - توضیحات (textarea)
  - تاریخ + ساعت (در یک ردیف ۲ستونه)
- **Priority Selector** — ۳ دکمه pill toggle:
  - High: وقتی active → `bg-priority-high-bg border-2 border-priority-high text-priority-high`
  - Medium: → `bg-priority-medium-bg border-2 border-priority-medium`
  - Low: → `bg-priority-low-bg border-2 border-priority-low`
- **Category Selector** — ۴ دکمه با آیکون + رنگ
- دکمه "ذخیره تسک" (`btn-primary` full-width)
- دکمه "لغو" (`btn-secondary` full-width)

---

## فاز 6: صفحه پروفایل — src/pages/profile.html + profile.js

### لایه‌بندی بصری — Light Mode مطابق بنچمارک

**Detail View (مشابه صفحه سوم بنچمارک — Task Detail):**

صفحه پروفایل از همین ساختار الهام می‌گیرد:
- ناحیه بالایی: **تصویر Hero** با قابلیت تغییر (عکس کاربر بزرگ، گرد، یا عکس پس‌زمینه اختیاری)
- دکمه برگشت `←` در گوشه بالا-چپ + آیکون `...` در گوشه بالا-راست (RTL)

**Avatar Section:**
- تصویر دایره‌ای بزرگ (۱۰۰px) در مرکز بالای صفحه
- border سفید `ring-4 ring-white`
- روی آواتار: آیکون دوربین کوچک با `bg-primary` — برای تغییر عکس
- زیر آواتار: نام کاربر (`text-xl font-bold`) + ایمیل (`text-sm text-text-muted`)

**Stats Row (مشابه کارت‌های رنگی Home):**
```
┌────────────────┬────────────────┬────────────────┐
│   bg-teal      │   bg-navy      │   bg-purple    │
│   کل تسک‌ها   │  تکمیل شده    │  نرخ موفقیت   │
│   24           │   18           │   75%          │
└────────────────┴────────────────┴────────────────┘
```

**Edit Form (Light Mode):**
- کارت سفید (`bg-bg-card rounded-3xl shadow-card p-2xl`)
- عنوان بخش "اطلاعات شخصی" (`text-lg font-semibold text-text-primary`)
- فیلدهای `input-field` با label بالا:
  - نام کامل
  - ایمیل
  - بیوگرافی (`textarea`, ۳ ردیف)
- دکمه "ذخیره تغییرات" (`btn-primary` full-width)
- Toast notification سبز پس از ذخیره (`fadeInUp` + `opacity-0` بعد از ۲ ثانیه)

**Avatar Upload Logic:**
- `<input type="file" accept="image/*" class="hidden">` مخفی
- کلیک روی آیکون دوربین → trigger روی input
- `FileReader.readAsDataURL()` → پیش‌نمایش فوری بدون reload
- ذخیره base64 در `profile.avatar` در localStorage

**App Info Card:**
- کارت سفید جداگانه: "Tasker v1.0.0" + توضیح کوتاه

---

## فاز 7: PWA Setup

### public/manifest.json

```json
{
  "name": "Tasker — مدیریت تسک",
  "short_name": "Tasker",
  "description": "مدیریت هوشمند تسک‌های روزانه",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ebf0f6",
  "theme_color": "#0d9488",
  "lang": "fa",
  "dir": "rtl",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### public/sw.js (Service Worker)

Strategy: **Cache First** برای static assets، **Network First** برای داده‌های dynamic:

```javascript
const CACHE_NAME = 'tasker-v1'
const ASSETS = ['/', '/src/css/main.css', /* ... */]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)))
})

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  )
})
```

### Meta Tags (در همه HTML‌ها)

```html
<meta name="theme-color" content="#0d9488">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Tasker">
<link rel="manifest" href="/manifest.json">
```

### اطلاع‌رسانی نصب (SW Registration در همه صفحات)

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
  }
</script>
```

---

## فاز 8: فونت‌ها و آیکون‌ها

در `<head>` همه صفحات (بعد از Tailwind CSS):

```html
<!-- Font Awesome 6 -->
<link rel="stylesheet" href="https://c7n.ir/fonts/sahel/load.css">

<!-- Sahel Font (Persian) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/sahel-font@v3.1.0/dist/font-face.css">
```

تمام آیکون‌های UI از Font Awesome Solid (`fa-solid`) استفاده می‌کنند.

---

## فاز 9: قوانین کدنویسی (از مستندات)

مطابق [`tailwind-v4-best-practices.md`](docs/tailwind-v4-best-practices.md):

- **ترتیب کلاس‌ها:** Layout → Box Model → Typography → Visual → Interactive → Responsive
- **بدون مقادیر hex مستقیم** — فقط از توکن‌های `@theme` استفاده می‌شود
- **بدون `style=""` inline**
- **بدون کلاس‌های متضاد** روی یک تگ
- **کامپوننت‌های تکراری** با `@layer components` و `@apply` (با Vite این مجاز است)
- **RTL:** همه toggle با JavaScript (نه `peer-checked`)
- **انیمیشن:** حداکثر `duration-300`، فقط جایی که UX بهبود می‌یابد

---

## چک‌لیست نهایی قبل از تحویل

- Vite dev server بدون خطا اجرا می‌شود
- همه ۴ صفحه از طریق bottom nav قابل دسترس هستند
- CRUD کامل تسک‌ها کار می‌کند (افزودن، ویرایش، حذف، تکمیل)
- داده‌ها در localStorage پایدار می‌مانند (بعد از refresh)
- PWA قابل نصب روی موبایل است (manifest + SW)
- صفحات در عرض ۳۶۰px تا ۴۳۰px بدون شکستگی نمایش داده می‌شوند
- فونت فارسی Sahel روی همه عناصر متنی اعمال شده
- آیکون‌ها Font Awesome هستند و از قانون font-family مستثنا هستند
- هیچ مقدار spacing/color هاردکد وجود ندارد
