# MahradCNC Shop

فروشگاه صنعتی قطعات CNC با Tailwind CSS v4 + Vite.

## اجرا

```bash
npm install
npm run dev
```

مرورگر روی **http://localhost:3010** باز می‌شود.

> اگر قبلاً پروژه دیگری (مثل اضافه‌کاری PWA) روی پورت ۳۰۰۰ داشته‌اید، Service Worker آن ممکن است همان پورت را خراب کند. این پروژه عمداً روی **3010** اجرا می‌شود.

## اسکریپت‌ها

| دستور | توضیح |
|--------|--------|
| `npm run dev` | سرور توسعه Vite |
| `npm run build` | بیلد تولید در `dist/` |
| `npm run preview` | پیش‌نمایش بیلد |

## صفحات

- `/` — صفحه اصلی
- `/shop.html` — فروشگاه
- `/product.html?id=p-01` — جزئیات محصول
- `/checkout.html` — سبد و تسویه
- `/landing.html` — لندینگ
- `/dashboard.html` — داشبورد کاربر
- `/uikit.html` — مرجع UIKit
