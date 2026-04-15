# Recombinant – Division 2 Modifier Builder

**Tom Clancy's The Division 2 — Rise Up Y8S1**

A mobile-first React app for building and testing passive modifier combinations. Select up to 3 modifiers, view the combined stat values in real time, and get guided tips on the best combinations for every buff in the game.

## Features

- **All 34 passive modifiers included** across Offense, Defense, and Utility categories
- **3-slot passive builder** — select up to 3 modifiers and test different slot orders
- **Live stat calculation** — combined values update instantly, including synergy scaling when multiple modifiers affect the same stat
- **Synergy indicators** — cards that pair well with your current selection are highlighted with a SYNERGY badge
- **Tips tab (best combos)** — ranked best 1/2/3-modifier combinations for each tracked stat
- **Best purchases tip guide** — priority ranking of modifiers to buy first based on versatility across top tip combinations
- **Mobile-first** — designed for phone screens first, responsive on desktop

## Tech Stack

- [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (via `@tailwindcss/vite`)
- Deployable to [Vercel](https://vercel.com/) via `vercel.json`

## Getting Started

```bash
npm install
npm run dev       # start development server
npm run build     # production build → dist/
npm run lint      # run ESLint
```

## Deploying to Vercel

Push the repository to GitHub and import it in Vercel. The `vercel.json` configuration handles the rest.
