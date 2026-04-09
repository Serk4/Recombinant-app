# Recombinant – Division 2 Modifier Builder

**Tom Clancy's The Division 2 — Rise Up Y8S1**

A mobile-first React app for building and testing passive modifier combinations. Select up to 3 modifiers, view the combined stat values in real time, and get guided tips on the best combinations for every buff in the game.

## Features

- **18 Passive Modifiers** across three categories — Offense, Defense, and Utility
- **Live stat calculation** — combined values update instantly as you pick modifiers, including synergy bonuses when multiple modifiers share a stat
- **Synergy indicators** — cards that pair well with your current selection are highlighted with a SYNERGY badge
- **Slot reordering** — use the ◀▶ buttons to change the order of your 3 modifier slots
- **Tips tab** — all best 1/2/3-modifier combos ranked by total stat value (e.g. best Headshot Damage, best Hazard Protection, best Repair Skill, etc.)
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
