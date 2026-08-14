# TAILWIND CSS V4 — AI AGENT SETUP INSTRUCTION
Stack: Vite + Tailwind CSS v4 + Vanilla JS + Multi-page HTML
Version: 1.0

## CONTEXT
You are initializing a production-ready Tailwind v4 project from scratch.
Follow every step in exact order. Do not skip any step.

---

## STEP 1 — PREREQUISITES
Verify environment before anything else:
  node -v     (must be >= 18)
  npm -v

---

## STEP 2 — INIT PROJECT
  mkdir <project-name>
  cd <project-name>
  npm init -y

---

## STEP 3 — INSTALL DEPENDENCIES
  npm install -D vite @tailwindcss/vite tailwindcss --verbose

> There is NO tailwind.config.js in v4. All config lives in CSS.
> No PostCSS config needed. Vite plugin handles everything.

---

## STEP 4 — FOLDER STRUCTURE
Create this exact structure (run each mkdir separately):

  mkdir src
  mkdir src/css
  mkdir src/js
  mkdir src/pages
  mkdir public

Final structure:
  <project-name>/
  ├── src/
  │   ├── css/
  │   │   └── main.css
  │   ├── js/
  │   │   └── main.js
  │   └── pages/
  │       └── (additional HTML pages here)
  ├── public/
  │   └── (static assets: images, icons, fonts)
  ├── index.html
  ├── vite.config.js
  ├── package.json
  └── README.md

---

## STEP 5 — CREATE vite.config.js
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
          main: resolve(__dirname, 'index.html'),
          // ADD NEW PAGES HERE:
          // about: resolve(__dirname, 'src/pages/about.html'),
        },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
  })

---

## STEP 6 — CREATE src/css/main.css
  @import "tailwindcss";

  @theme {
    /* Typography */
    --font-sans: ui-sans-serif, system-ui, sans-serif;

    /* Brand Colors — customize per project */
    --color-primary:   #1e3a5f;
    --color-secondary: #d4af37;
    --color-accent:    #3b82f6;
    --color-surface:   #f8fafc;
    --color-muted:     #94a3b8;
  }

  @layer base {
    *, *::before, *::after { box-sizing: border-box; }
    html { font-family: var(--font-sans); }
  }

  @layer components {
    .btn-primary {
      @apply bg-primary text-white px-6 py-3 rounded-lg
             font-semibold hover:opacity-90 transition-opacity;
    }
    .btn-secondary {
      @apply bg-secondary text-white px-6 py-3 rounded-lg
             font-semibold hover:opacity-90 transition-opacity;
    }
  }

  @layer utilities {
    .text-balance { text-wrap: balance; }
  }

---

## STEP 7 — CREATE index.html (BASE TEMPLATE)
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Project Name</title>
    <link rel="stylesheet" href="/src/css/main.css" />
  </head>
  <body class="bg-surface text-gray-800 antialiased">

    <!-- CONTENT HERE -->

    <script type="module" src="/src/js/main.js"></script>
  </body>
  </html>

> For RTL Persian projects: set lang="fa" dir="rtl" on <html>
> Copy this template for every new page in src/pages/

---

## STEP 8 — UPDATE package.json SCRIPTS
Replace the "scripts" block with:
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview",
    "clean":   "rm -rf dist"
  }

---

## STEP 9 — CREATE README.md
Create /README.md with this content:

  # Project Name

  ## Commands
  | Command           | Description                          |
  |-------------------|--------------------------------------|
  | npm run dev       | Dev server → localhost:3000 with HMR |
  | npm run build     | Production build → /dist             |
  | npm run preview   | Preview production build locally     |
  | npm run clean     | Delete /dist                         |

  ## Adding New Pages
  1. Create src/pages/<page-name>.html
  2. Register in vite.config.js → build.rollupOptions.input
  3. Add: <link rel="stylesheet" href="/src/css/main.css" />

  ## Theme Customization
  All design tokens live in src/css/main.css under @theme { }
  Custom colors auto-generate utility classes:
    --color-primary → bg-primary / text-primary / border-primary

  ## Production Build
  Output → /dist (minified CSS via esbuild, hashed filenames)

---

## STEP 10 — FINAL VERIFICATION
Run and confirm each:
  npm run dev      → opens localhost:3000, Tailwind classes render correctly
  npm run build    → /dist created, CSS is minified
  npm run preview  → production build serves correctly

---

## CRITICAL TAILWIND V4 RULES — NEVER BREAK THESE

1. NO tailwind.config.js → use @theme {} in CSS
2. NO @tailwind base/components/utilities → use @import "tailwindcss"
3. NO content[] array → v4 auto-detects content files
4. @theme tokens auto-generate utilities:
     --color-primary → bg-primary, text-primary, border-primary, ring-primary
5. @tailwindcss/vite plugin replaces PostCSS entirely
6. Vite minifies CSS automatically in build mode via esbuild