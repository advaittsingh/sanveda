# True Hope Foundation — Website Clone

A React clone of [truehopefoundation.in](https://truehopefoundation.in/), built with Vite, TypeScript, and Tailwind CSS.

## Features

- Homepage with hero carousel, featured campaigns, categories, monthly donation, live ticker, media logos, and newsletter
- Live campaign data from the True Hope Foundation API
- Responsive layout matching the original design (Red Hat Display, teal + coral palette)
- Campaign listing page with progress bars and donation CTAs
- Category navigation (Urgent, Children, Animals, Medical, etc.)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Swiper (carousels)
- Axios (API)

## API

Campaign and CMS content is fetched from `https://api.truehopefoundation.in/api`.
