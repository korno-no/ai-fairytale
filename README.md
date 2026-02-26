# AI Co-Writing Fairy Tale App

An interactive React + TypeScript application (bundled with Vite) where the user and an AI co-write a fairy tale together.

This project is scaffolded with **Vite + React + TypeScript** and organized for building out:

- User and AI turn-based story writing
- Periodic AI-generated plot choices
- Local story history storage

## Tech Stack

- **Build tooling**: Vite (React + TS template)
- **UI**: React 18 + TypeScript
- **State management**: Zustand (to be added)
- **Styling**: Tailwind CSS (to be added)
- **AI**: OpenAI API (to be integrated)

## Project Structure

Key folders under `src`:

- `components/` – Reusable React components (story editor, sidebar, controls, etc.)
- `hooks/` – Custom React hooks (e.g. story progression, API hooks)
- `services/` – API clients and external service integrations (OpenAI, storage)
- `types/` – Shared TypeScript types and interfaces
- `store/` – Zustand store(s) for story state and UI state

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed URL (usually `http://localhost:5173`) in your browser.

## Scripts

- `npm run dev` – Start the Vite dev server with HMR
- `npm run build` – Create a production build
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint on the codebase

You can customize Vite via `vite.config.ts` and TypeScript via `tsconfig.*.json` as the app grows.
