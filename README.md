# 🛠️ Boilerplate

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-45ba63?logo=playwright&logoColor=white)](https://playwright.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

A **Next.js 16**, **React 19**, and **Tailwind CSS v4** starter template, with:

- ✨ Radix UI + `class-variance-authority` (CVA)
- 🌗 Dark mode support via `next-themes`
- 🌀 Fully configured Tailwind CSS v4 (JIT, semantic colors, font vars)
- 🎨 Custom UI components and utility functions
- 🧪 Playwright for end-to-end testing
- 🎯 Prettier + Tailwind plugin + ESLint Flat Config
- ⚙️ Modern Server Actions — cleanly integrated and working out of the box

> This is my personal and production-ready starting point for all modern apps — clean, fast, and independent of any deployment service.
---

## 📦 Stack Overview

| Layer              | Tech                                               |
|-------------------|----------------------------------------------------|
| Framework         | [Next.js 15](https://nextjs.org/docs)              |
| UI Primitives     | [Radix UI](https://www.radix-ui.com/primitives)    |
| Styling           | [Tailwind CSS v4](https://tailwindcss.com/docs)    |
| Fonts             | Geist Sans + Mono via `next/font/google`           |
| Dark Mode         | [`next-themes`](https://github.com/pacocoursey/next-themes) |
| Buttons + Variants| `class-variance-authority` + `clsx` + `tailwind-merge` |
| Testing           | [Playwright](https://playwright.dev/)              |
| Linting/Formatting| ESLint Flat Config + Prettier + Tailwind Plugin    |

---

## 🚀 Getting Started

```bash
yarn install        # install dependencies
yarn dev            # start dev server (Turbopack)
yarn build          # production build
yarn lint           # run ESLint
yarn typecheck      # run TypeScript checks
yarn test           # run Playwright e2e tests
```

---

## 🧪 Tailwind CSS v4 Confirmation

This repo ships with a homepage that **visually proves** Tailwind CSS v4 is working:

- Typography, spacing, color, layout, and dark mode all tested
- Custom utility classes, font variables, and semantic tokens verified
- Button variants use `cva` + Radix UI + Tailwind with full theming support

> No guessing — if the homepage renders correctly, your Tailwind setup is fully functional.

---

## ⚡ Server Action Example

The homepage also includes a real, working Server Action:

- Accepts a name input
- Saves to a cookie
- Renders the result with zero JavaScript hydration

```ts
// lib/actions/example.action.ts
"use server";

export async function submitName(formData: FormData) {
  const name = formData.get("name");
  // cookie logic, revalidatePath
}
```

Used directly in `app/page.tsx` via:

```tsx
<form action={submitName}>
```

---

## 📁 Project Structure

```
.
├── app/                  # App Router (Next.js 15)
│   ├── layout.tsx
│   ├── page.tsx          # Tailwind test + server action demo
│   └── loading.tsx
├── components/           # Reusable UI (button, dropdown)
├── lib/                  # Actions + utils
│   └── actions/
│       └── example.action.ts
├── tests/                # Playwright e2e
├── public/               # Static assets
├── types/                # Global TS types
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── README.md             # ← This file
```

---

## 🧠 Customization Tips

- Change your fonts in `app/layout.tsx`
- Add global metadata in `lib/seo.ts`
- Extend button variants via `cva`
- Write your own server actions under `lib/actions/`

---

## 🛡️ Playwright Setup

```bash
yarn test       # run headless tests
yarn test:ui    # interactive runner
```

Add specs under `tests/`.

---

## 📜 License

MIT — yours to hack, ship, and scale. Contributions welcome.

---

## ✨ Created & Maintained By

**@nimda** — I use this as my go-to starter for real apps.  
Modern, unbranded, and ready for everything from ideas to production.

---

## 📦 Clone This

```bash
npx degit nimda/hackme my-app
cd my-app && yarn install
```
