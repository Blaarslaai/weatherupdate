# Weather Update App

Weather Update is a React + Vite weather dashboard with protected routes, serverless API proxies (Vercel-style `api/*` handlers), and client-side caching for a responsive UX.

The app currently supports:
- Login/logout using a token-based auth flow (cookie session)
- Shared app state for selected `city` and `country` (set on the home page)
- Current weather view with:
- Current conditions
- 3-day forecast
- 3-day history
- Clicking forecast/history days to reuse the main weather card grid
- Weather alerts page with cache-first loading
- API route tests with Jest

## Tech Stack

### Frontend
- React 19
- Vite 7
- TypeScript
- Chakra UI 3
- React Router

### Backend (API Routes)
- Vercel-style serverless route handlers in `api/`
- Weatherbit upstream API proxying
- JWT cookie session auth (`jsonwebtoken`)

### Validation
- `zod` schemas for Weatherbit payloads and client response parsing

### Testing
- Jest
- ts-jest

## Project Structure

- `src/`
- `pages/` UI pages (`App`, `CurrentWeather`, `Alerts`, etc.)
- `components/custom/` app-specific UI components
- `components/custom/current-weather/` modular current weather page sections/helpers
- `hooks/` data hooks (`useSession`, `useCurrentWeatherPageData`)
- `lib/http.ts` client API helpers + zod parsing
- `schemas/` response schemas
- `state/app-state.tsx` shared city/country app state (localStorage-backed)
- `api/`
- `auth/` login/logout/session handlers
- `weather/` Weatherbit proxy endpoints
- `tests/api/` Jest API route tests

## Authentication Flow

The app uses a simple token-based login:

1. Frontend sends `VITE_AUTH_TOKEN` to `POST /api/auth/login`
2. Server validates against `APP_ACCESS_TOKEN`
3. Server signs a JWT session cookie using `JWT_SECRET`
4. Protected routes use `/api/auth/me` to validate session

Notes:
- Session is stored in an `HttpOnly` cookie (`session`)
- Navbar login/logout updates session state immediately using React Query invalidation/refetch

## Weather API Routes

These routes proxy Weatherbit and keep API keys server-side:

- `POST /api/weather/currentWeather`
- `POST /api/weather/dailyForecast`
- `POST /api/weather/dailyHistory`
- `POST /api/weather/weatherAlerts`

Common behavior:
- Require authenticated session
- Read `city` and `country` from request body
- Proxy to Weatherbit using `WEATHERBIT_API_KEY`
- Return upstream JSON
- Add cache headers (`Cache-Control`)

Refresh support:
- Some endpoints support `?refresh=1`
- The frontend uses this to force fresh data when the user presses Refresh

## Client-Side Caching

The app uses `localStorage` for cache-first page loading:

- Homepage stores the selected location (`city`, `country`)
- Current Weather page caches:
- current weather
- daily forecast
- daily history
- Alerts page caches weather alerts

Pages load from cache first and only fetch network data if cache is missing, unless the user presses `Refresh`.

## Routes

### Public
- `/` Home page

### Protected (requires login)
- `/currentWeather`
- `/alerts`
- `/weatherForecast`
- `/weatherHistory`
- `/settings`

## Environment Variables

Create a local env file (for Vite client + server runtime) and set the following values.

### Required (server)
- `JWT_SECRET`
- `APP_ACCESS_TOKEN`
- `WEATHERBIT_API_KEY`

### Required (client)
- `VITE_AUTH_TOKEN`

Important:
- `VITE_AUTH_TOKEN` should match `APP_ACCESS_TOKEN` during local development, because the navbar login sends the client token to the login API.

## Local Setup

### Requirements
- Node.js 20+ (project is working on Node 22)
- npm

### Install

```bash
npm install
```

### Run local app (frontend only)

```bash
npm run dev
```

### Run with API routes locally (recommended)

Use Vercel dev so `api/*` routes run locally:

```bash
npm run vercel
```

Then open the local URL shown by Vercel.

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run vercel` - Run Vercel local dev (frontend + API routes)
- `npm run build` - Type-check and build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run all Jest tests
- `npm run test:api` - Run API route Jest tests only

## Testing

API route tests are implemented first and live in `tests/api/`.

Current coverage includes:
- Auth routes (`login`, `logout`, `me`)
- Weather routes (auth guard, validation, cache behavior, upstream proxy behavior)

Run:

```bash
npm run test:api
```

## Design Decisions

This project was designed to be simple and straight-forward to use. I made use of ChakraUI
and custom components made with tailwindcss and DaisyUI for streamlined development and fast
iteration. - Scratch tailwindcss and DaisyUI, these two libraries conflicted...

I grouped all navigation into logical containers, i.e. home is separate, settings is separate,
and then all weather related pages are grouped in a menu.

Lastly, I decided to use Vercel to host my api's as server functions. The reasoning behind this
was to incorporate my authentication into the routes so they wouldn't be accessible without the
correct signature.

## Trade-Offs

The trade-offs that were made were mostly surrounding the login and authentication, and
using another api or external service to populate the city and country options instead
of typing those details manually.

These decisions were simply based on the fact that there is no backend available to properly
implement authentication and that I wanted to minimize my usage of server-side functions,
as this is a front-end test. Also, I couldn't find a free api service to use that could give
me a list of countries with their codes and then populate their cities based on that mentioned
country selection.
