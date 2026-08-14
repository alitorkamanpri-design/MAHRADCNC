# دستورالعمل توسعه حرفه‌ای با Tailwind CSS v4 (CDN)

> این دستورالعمل برای توسعه پروژه‌های وب با Tailwind CSS نسخه ۴ در حالت CDN (بدون build tool) طراحی شده است.
> همه قوانین این سند **الزامی** هستند مگر صریحاً استثنا ذکر شده باشد.

---

## ۱. بارگذاری Tailwind — یک خط، در بالای صفحه

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>عنوان پروژه</title>

  <!-- ✅ Tailwind CSS v4 — همیشه اولین resource -->
  <script src="https://c7n.ir/css/tailwind/v4.2/tailwind.js"></script>

  <!-- سایر فونت‌ها و کتابخانه‌ها بعد از Tailwind -->
</head>
```

**قوانین بارگذاری:**
- Tailwind **اولین** تگ در `<head>` است، پیش از هر فونت یا کتابخانه دیگری
- هرگز دو نسخه Tailwind را همزمان لود نکن
- CDN را از آدرس مشخص‌شده لود کن، آدرس را تغییر نده

---

## ۲. پیکربندی Theme — بلافاصله بعد از CDN

در Tailwind v4 پیکربندی از طریق **CSS @theme** انجام می‌شود، نه فایل JS. این بلوک را بلافاصله بعد از تگ Tailwind قرار بده:

```html
<style type="text/tailwindcss">
  @theme {
    /* ─── رنگ‌های اصلی ─── */
    --color-primary:         #0f172a;
    --color-secondary:       #64748b;
    --color-accent:          #3b82f6;

    /* ─── رنگ‌های متن ─── */
    --color-text-primary:    #0f172a;
    --color-text-secondary:  #475569;
    --color-text-muted:      #94a3b8;

    /* ─── رنگ‌های پس‌زمینه ─── */
    --color-bg-primary:      #ffffff;
    --color-bg-secondary:    #f8fafc;
    --color-bg-tertiary:     #f1f5f9;

    /* ─── رنگ‌های border ─── */
    --color-border-light:    #f1f5f9;
    --color-border-medium:   #e2e8f0;
    --color-border-dark:     #cbd5e1;

    /* ─── فاصله‌گذاری (Spacing) ─── */
    --spacing-xs:   4px;
    --spacing-sm:   8px;
    --spacing-md:   12px;
    --spacing-lg:   16px;
    --spacing-xl:   20px;
    --spacing-2xl:  24px;
    --spacing-3xl:  32px;
    --spacing-4xl:  40px;
    --spacing-5xl:  80px;

    /* ─── گردی گوشه‌ها (Border Radius) ─── */
    --radius-sm:    6px;
    --radius-md:    8px;
    --radius-lg:    10px;
    --radius-xl:    12px;
    --radius-2xl:   16px;
    --radius-3xl:   20px;

    /* ─── اندازه‌های متن ─── */
    --text-xs:      13px;
    --text-sm:      14px;
    --text-base:    15px;
    --text-md:      16px;
    --text-lg:      18px;
    --text-xl:      20px;
    --text-2xl:     24px;
    --text-3xl:     30px;
    --text-4xl:     36px;

    /* ─── حداکثر عرض‌ها ─── */
    --max-width-sm:   24rem;
    --max-width-md:   28rem;
    --max-width-lg:   32rem;
    --max-width-xl:   36rem;
    --max-width-2xl:  42rem;
    --max-width-3xl:  48rem;
    --max-width-4xl:  56rem;
    --max-width-5xl:  64rem;
    --max-width-6xl:  72rem;
    --max-width-7xl:  80rem;

    /* ─── فاصله خطوط (Line Height) ─── */
    --leading-tight:    1.25;
    --leading-snug:     1.375;
    --leading-normal:   1.5;
    --leading-relaxed:  1.625;
    --leading-loose:    1.75;

    /* ─── سایه‌ها ─── */
    --shadow-sm:     0 1px 3px rgba(0,0,0,0.04);
    --shadow-md:     0 4px 16px rgba(0,0,0,0.06);
    --shadow-lg:     0 25px 50px -12px rgba(0,0,0,0.25);
    --shadow-focus:  0 0 0 3px rgba(15,23,42,0.05);
    --shadow-button: 0 4px 12px rgba(15,23,42,0.15);
  }

  /* فونت برای همه عناصر */
  body, button, input, textarea, select,
  p, div, span, h1, h2, h3, h4, h5, h6 {
    font-family: 'Sahel', sans-serif !important;
  }

  /* آیکون‌های Font Awesome از این قانون مستثنا هستند */
  .fa, .fas, .far, .fal, .fab, .fa-solid, .fa-brands {
    font-family: 'Font Awesome 6 Free', 'Font Awesome 6 Brands' !important;
  }

  :root {
    --transition-fast:   all 0.15s ease;
    --transition-normal: all 0.25s ease;
  }
</style>
```

**قوانین @theme:**
- همه توکن‌های رنگی، فاصله و سایه را در `@theme` تعریف کن
- مقدار هیچ توکنی را در میان کد تغییر نده — فقط اینجا تعریف می‌شوند
- برای پروژه‌های تیم‌محور، این بلوک را در یک فایل CSS جداگانه نگه‌دار

---

## ۳. تفکر کامپوننت‌محور

### اصل اول — یکپارچگی utility class‌ها در سراسر پروژه

در حالت CDN، استفاده از `@apply` باعث افزایش DOM processing و کند شدن پاسخگویی صفحه می‌شود. **هرگز از `@apply` استفاده نکن.**

رویکرد صحیح این است: برای هر نوع کامپوننت، **یک مجموعه ثابت از utility class‌ها** تعریف کن و در تمام صفحه **دقیقاً همان‌ها** را تکرار کن. این یکپارچگی، هم عملکرد را حفظ می‌کند و هم طراحی سیستماتیک تولید می‌دهد.

```html
<!-- ❌ غلط — کلاس‌های ناهماهنگ برای یک نوع کامپوننت -->
<button class="bg-primary text-white px-xl py-md rounded-lg font-medium ...">ذخیره</button>
<button class="bg-primary text-white px-5 py-3 rounded-md font-semibold ...">ارسال</button>

<!-- ✅ درست — utility class‌های یکسان برای همان نوع کامپوننت -->
<button class="bg-primary text-white px-xl py-md rounded-lg font-medium text-base leading-normal hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center gap-2">ذخیره</button>
<button class="bg-primary text-white px-xl py-md rounded-lg font-medium text-base leading-normal hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center gap-2">ارسال</button>
```

### مرجع کامپوننت‌های پایه (utility class‌های استاندارد)

این مجموعه‌ها را حفظ کن و در تمام پروژه **عیناً** به همین شکل استفاده کن:

**دکمه‌ها:**
```html
<!-- Primary -->
<button class="bg-primary text-white px-xl py-md rounded-lg font-medium text-base leading-normal hover:-translate-y-0.5 hover:shadow-button transition-all duration-200 inline-flex items-center gap-2">

<!-- Secondary -->
<button class="bg-bg-secondary text-text-secondary border border-border-medium px-xl py-md rounded-lg font-medium text-base leading-normal hover:bg-bg-tertiary transition-all duration-200 inline-flex items-center gap-2">

<!-- Danger -->
<button class="bg-red-600 text-white px-xl py-md rounded-lg font-medium text-base leading-normal hover:bg-red-700 transition-all duration-200 inline-flex items-center gap-2">
```

**کارت:**
```html
<div class="bg-bg-primary border border-border-light rounded-3xl shadow-sm">
  <div class="px-3xl py-xl border-b border-border-light"><!-- header --></div>
  <div class="p-3xl"><!-- body --></div>
</div>
```

**Badge:**
```html
<span class="inline-flex items-center gap-1.5 bg-green-50 text-green-800 px-2.5 py-1 rounded-lg text-xs font-medium">
<span class="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-lg text-xs font-medium">
<span class="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg text-xs font-medium">
<span class="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">
```

**Input Group:**
```html
<div class="border border-border-medium rounded-xl overflow-hidden focus-within:border-primary focus-within:shadow-focus transition-all duration-200">
  <div class="flex items-stretch">
    <label class="bg-bg-secondary border-l border-border-light min-w-[140px] px-lg py-3.5 text-sm text-text-secondary flex items-center leading-normal">
    <input class="flex-1 px-lg py-3.5 text-base text-text-primary outline-none bg-transparent leading-normal">
  </div>
</div>
```

---

## ۴. ترتیب استاندارد کلاس‌ها (Class Order)

ترتیب توصیه‌شده Tailwind برای هر تگ:

```
Layout → Box Model → Typography → Visual → Interactive → Responsive
```

```html
<!-- ✅ ترتیب صحیح -->
<div class="
  flex items-center justify-between          <!-- Layout -->
  w-full max-w-7xl mx-auto px-3xl py-xl     <!-- Box Model -->
  text-base text-text-primary leading-normal <!-- Typography -->
  bg-bg-primary border border-border-light rounded-2xl shadow-sm   <!-- Visual -->
  hover:shadow-md transition-all duration-200  <!-- Interactive -->
  md:flex-row sm:flex-col                   <!-- Responsive -->
">
```

**گروه‌بندی کلاس‌ها:**

| گروه | مثال |
|------|------|
| Layout | `flex`, `grid`, `block`, `hidden`, `items-*`, `justify-*` |
| Box Model | `w-*`, `h-*`, `p-*`, `m-*`, `max-w-*` |
| Typography | `text-*`, `font-*`, `leading-*`, `tracking-*` |
| Visual | `bg-*`, `border-*`, `rounded-*`, `shadow-*` |
| Interactive | `hover:*`, `focus:*`, `active:*`, `transition-*` |
| Responsive | `sm:*`, `md:*`, `lg:*`, `xl:*` |

---

## ۵. استفاده از توکن‌ها — نه مقادیر هاردکد

```html
<!-- ❌ هرگز این‌ها را ننویس -->
<div class="p-[13px] rounded-[7px] text-[15px] bg-[#0f172a] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">

<!-- ✅ همیشه از توکن‌های تعریف‌شده استفاده کن -->
<div class="p-md rounded-lg text-base bg-primary shadow-md">
```

**استثناهای مجاز برای arbitrary values:**
- مقادیر یک‌بار مصرف که در theme جایی ندارند (مثل `min-w-[140px]` برای label خاص)
- مقادیر دقیق که grid یا layout آن را ایجاب می‌کند

**قانون طلایی:** اگر یک مقدار arbitrary را بیش از یک بار نوشتی، آن را به `@theme` منتقل کن.

---

## ۶. ساختار Layout پایه

```html
<!-- Container اصلی -->
<div class="max-w-7xl mx-auto px-8 py-5xl">

<!-- Grid دو ستونه responsive -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-3xl">

<!-- Grid سه ستونه responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3xl">

<!-- Flex Row با gap -->
<div class="flex items-center gap-2xl flex-wrap">
```

---

## ۷. انیمیشن و ترنزیشن — با اعتدال و پرستیژ

### قوانین انیمیشن

- **فقط** در جایی که UX واقعی بهبود می‌یابد استفاده کن
- **حداکثر** یک انیمیشن اصلی برای هر کامپوننت
- مدت ترنزیشن: `duration-150` تا `duration-300` — بیشتر از این سنگین است
- از `ease` یا `ease-out` برای حس طبیعی استفاده کن

```html
<!-- ✅ ترنزیشن مجاز و باکیفیت -->
<button class="... hover:-translate-y-0.5 hover:shadow-button transition-all duration-200">
<div class="... hover:shadow-md transition-shadow duration-200">
<a class="... hover:text-primary transition-colors duration-150">

<!-- ✅ انیمیشن ظاهر شدن (fade-in) -->
<style type="text/tailwindcss">
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.25s ease-out forwards;
  }
</style>
```

### ❌ خطوط قرمز انیمیشن

```html
<!-- ❌ ممنوع — لرزش و تکان‌های زیاد -->
<div class="hover:scale-110 hover:rotate-3 active:scale-95">

<!-- ❌ ممنوع — ترنزیشن طولانی -->
<div class="transition-all duration-700 ease-in-out">

<!-- ❌ ممنوع — انیمیشن loop بی‌پایان روی محتوا -->
<div class="animate-bounce animate-pulse">متن اصلی</div>

<!-- ❌ ممنوع — انیمیشن روی هر عنصر صفحه -->
<!-- انیمیشن = استثنا، نه قانون عمومی -->
```

---

## ۸. Responsive Design — Mobile First

```html
<!-- همیشه از موبایل شروع کن، سپس برای بزرگتر override کن -->
<div class="
  flex-col           <!-- موبایل: عمودی -->
  md:flex-row        <!-- تبلت و بالاتر: افقی -->
  gap-lg md:gap-2xl  <!-- فاصله متفاوت در سایزها -->
">

<!-- مخفی/نمایش responsive -->
<div class="hidden lg:block">فقط دسکتاپ</div>
<div class="block lg:hidden">فقط موبایل</div>
```

**Breakpointهای استاندارد:**

| Prefix | حداقل عرض | کاربرد |
|--------|-----------|--------|
| `sm:`  | 640px     | موبایل بزرگ |
| `md:`  | 768px     | تبلت |
| `lg:`  | 1024px    | دسکتاپ کوچک |
| `xl:`  | 1280px    | دسکتاپ |
| `2xl:` | 1536px    | صفحه‌های بزرگ |

---

## ۹. تایپوگرافی — سلسله‌مراتب واضح

```html
<!-- عنوان اصلی صفحه -->
<h1 class="text-3xl font-bold text-text-primary leading-tight">

<!-- عنوان بخش -->
<h2 class="text-2xl font-semibold text-text-primary leading-snug">

<!-- عنوان کارت -->
<h3 class="text-xl font-semibold text-text-primary leading-snug">

<!-- متن اصلی -->
<p class="text-base text-text-primary leading-relaxed">

<!-- متن کمکی -->
<p class="text-sm text-text-secondary leading-normal">

<!-- متن خیلی کوچک / label -->
<span class="text-xs text-text-muted leading-normal">
```

---

## ۱۰. خطوط قرمز — هرگز این‌ها را انجام نده

```html
<!-- ❌ استایل inline -->
<div style="color: #0f172a; padding: 12px;">

<!-- ❌ رنگ hex مستقیم در کلاس -->
<div class="bg-[#0f172a] text-[#475569]">

<!-- ❌ دو class متضاد روی یک تگ -->
<div class="flex block items-center justify-start justify-center">

<!-- ❌ override کردن Tailwind با !important در CSS -->
<style> .card { color: red !important; } </style>

<!-- ❌ spacing هاردکد بدون توکن (وقتی توکن موجود است) -->
<div class="p-[16px] m-[24px]">  <!-- p-lg و m-2xl موجود است -->

<!-- ❌ استفاده از @apply در CDN mode — باعث کندی DOM processing می‌شود -->
<style type="text/tailwindcss">
  .btn { @apply px-xl py-md rounded-lg; }
</style>

<!-- ❌ لود Tailwind بیش از یک بار -->
<script src="tailwind.js"></script>
<script src="tailwind.min.js"></script>

<!-- ❌ تعریف متغیر رنگ در :root به جای @theme -->
<style> :root { --color-primary: red; } </style>  <!-- باید در @theme باشد -->

<!-- ❌ انیمیشن روی عناصر ساکن و محتوایی -->
<p class="animate-pulse">توضیحات محصول...</p>

<!-- ❌ استفاده از peer-checked در RTL -->
<div class="peer-checked:after:translate-x-full">  <!-- در RTL کار نمی‌کند -->
```

---

## ۱۱. چک‌لیست قبل از تحویل

- [ ] Tailwind از CDN صحیح لود شده و اولین resource است
- [ ] `@theme` بلافاصله بعد از CDN تعریف شده و همه توکن‌ها در آن هستند
- [ ] هیچ مقدار hex هاردکد در کلاس‌های Tailwind وجود ندارد
- [ ] کامپوننت‌های تکراری با `@apply` استخراج شده‌اند
- [ ] ترتیب کلاس‌ها: Layout ← Box ← Typography ← Visual ← Interactive ← Responsive
- [ ] انیمیشن‌ها محدود، هدفمند و حداکثر `duration-300` هستند
- [ ] صفحه در موبایل، تبلت و دسکتاپ بدون شکستگی نمایش داده می‌شود
- [ ] هیچ استایل inline وجود ندارد
- [ ] در پروژه‌های RTL، toggle با JavaScript پیاده‌سازی شده (نه peer-checked)
- [ ] فونت فارسی برای همه عناصر متنی اعمال شده، به‌جز آیکون‌ها
