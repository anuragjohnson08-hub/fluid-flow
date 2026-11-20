# Fluid Flow

One-stop game review hub built with React, TypeScript, Vite, and Tailwind CSS.

## Project Structure

```text
.
├── .github/workflows/deploy.yml   # GitHub Pages build & deploy workflow
├── src/
│   ├── components/
│   │   ├── layout/                # Header, footer, starfield sky, loaders
│   │   ├── sections/              # Page sections (hero dashboard, bento, verdicts, reviews)
│   │   ├── ui/                    # Reusable interactive UI primitives
│   │   └── widgets/               # Dynamic Island search, 3D pie chart, Terms card
│   ├── data/                      # Review provider credits & team data
│   ├── utils/                     # Pure routing, search, chart, and animation helpers
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── tests/                         # Unit tests (node:test via tsx)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Scripts

```bash
npm install
npm run dev      # Start local dev server on port 3000
npm run test     # Run unit tests
npm run lint     # Run TypeScript type check (tsc --noEmit)
npm run build    # Build static site into dist/
```

## GitHub Pages

Pushes to `main` or `master` automatically build `dist/` and deploy via `.github/workflows/deploy.yml`.
