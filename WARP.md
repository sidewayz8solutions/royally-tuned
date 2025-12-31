# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Key commands

This is a Vite + React + TypeScript app with npm as the package manager (see `package-lock.json`). Use these commands from the repo root:

- Install dependencies:
  - `npm install`
- Start the dev server (Vite, default on http://localhost:5173):
  - `npm run dev`
- Type-check and build for production (runs `tsc -b` then `vite build` into `dist/`):
  - `npm run build`
- Lint the TypeScript/React code using the flat ESLint config in `eslint.config.js`:
  - `npm run lint`
- Preview the production build locally (serves `dist/`):
  - `npm run preview`

There is currently no test script configured in `package.json`. If a test runner is added (e.g., Vitest or Jest), update this section with `npm test` and any commands for running a single test.

## Frontend architecture

### Entry point and routing

- The SPA entry is `src/main.tsx`, which:
  - Creates the React root.
  - Wraps the app in `BrowserRouter` from `react-router-dom`.
  - Wraps everything with `AuthProvider` from `src/contexts/AuthContext.tsx`.
  - Renders `App` from `src/App.tsx`.
- `src/App.tsx` defines the route tree using React Router v7-style `<Routes>`:
  - Public marketing & onboarding routes (wrapped in `PublicLayout`): `/`, `/about`, `/pricing`, `/signup`, `/login`, `/privacy`, `/terms`.
  - Auth callback route: `/auth/callback` → `AuthCallback` page, which completes Supabase email verification and then redirects to `/login`.
  - Gated application routes (wrapped in `RequireAuth` → `AppLayout`): `/app` (Dashboard), `/app/tracks`, `/app/checklist`, `/app/toolkit`, `/app/profile`.
- Layouts:
  - `src/layouts/PublicLayout.tsx` provides the marketing shell: background, `PublicNav`, animated page transitions, and `Footer`.
  - `src/layouts/AppLayout.tsx` provides the authenticated app shell: `AppNav`, animated content area, and `Footer`.
  - Both layouts use `framer-motion` for route-level transitions.

### Auth, subscription gating, and Supabase usage

- Supabase client:
  - `src/lib/supabaseClient.ts` creates a singleton Supabase browser client from Vite env vars:
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
  - If these are missing, it logs a warning and exports `supabase = null`; frontend code must always handle the `!supabase` case.
- Auth context:
  - `src/contexts/AuthContext.tsx` owns auth state and subscription status:
    - Tracks `user`, `loading`, and `subscriptionStatus`.
    - Fetches `subscription_status` from the `profiles` table via Supabase; this DB value is treated as source of truth.
    - Falls back to `user.app_metadata.subscription_status` when DB status is unavailable.
    - Exposes `signUp`, `signIn`, `signOut`, and `refreshUser` helpers used across the app.
  - On mount and on auth state changes, it:
    - Calls `supabase.auth.getUser()` / `onAuthStateChange` to keep `user` in sync.
    - Calls `fetchSubscriptionFromDB(user.id)` to sync `dbSubscriptionStatus` from `profiles.subscription_status`.
- Subscription gating:
  - `src/components/RequireAuth.tsx` wraps all `/app` routes and enforces that:
    - The user is logged in (`user` from `AuthContext`), otherwise redirects to `/signup`.
    - The user has a paid/active subscription.
  - Paid status is determined by:
    - `subscriptionStatus` from `AuthContext` and a set of “paid” statuses: `pro`, `active`, `trialing`, `enterprise`.
    - Local storage keys:
      - `royally_tuned_just_paid` (short 5‑minute grace period after checkout, keyed off `?checkout=success` on the URL).
      - `royally_tuned_last_known_paid` to survive transient auth / webhook delays.
  - While `AuthContext.loading` is true it shows a full-screen loading/“taking too long” state with options to retry or continue anyway.
- Supabase-backed feature pages (all expect a configured Supabase client and authenticated user):
  - `src/pages/Dashboard.tsx`:
    - On load, fetches `tracks`, `earnings`, and `notifications` for `user.id` from Supabase tables of the same names.
    - Computes aggregate stats (total earnings, streams, active tracks, royalty sources).
    - Builds a 6‑month earnings chart and a recent-activity feed.
    - If `supabase` is not configured, shows an explanatory message instead of failing.
  - `src/pages/Tracks.tsx`:
    - Lists the user’s `tracks` (`is_active = true`, ordered by `created_at`).
    - Provides search, plus a modal for inserting new tracks into the `tracks` table.
    - Uses `registration_status` JSON to show whether registrations look complete.
    - Also guards on `!supabase` with a “Supabase not configured” message.
  - `src/pages/Checklist.tsx`:
    - Reads/writes from the `checklist_items` table for the current user.
    - If no rows exist yet, seeds a default set of checklist items into `checklist_items` for that user.
    - Groups tasks into high-level categories (registration, setup, verification, distribution) and tracks completion progress.
    - Uses optimistic UI when toggling completion, then persists the change via Supabase.

### Marketing and product pages

- Marketing-oriented pages live under `src/pages/` and are rendered via `PublicLayout`:
  - `Home.tsx` – primary marketing hero, problem/solution narrative, and CTA into `/signup`.
  - `About.tsx`, `Pricing.tsx`, `Privacy.tsx`, `Terms.tsx` – standard content/marketing and legal pages.
- Pricing and checkout:
  - `src/pages/Pricing.tsx` integrates with the Stripe serverless API route `/api/create-checkout-session`:
    - If the user is not logged in, the main CTA sends them to `/signup`.
    - If logged in, the CTA POSTs `{ userId }` to `/api/create-checkout-session` and then redirects to the returned Stripe Checkout URL.
    - Surfaces detailed error messages if the API call fails (e.g. `PRICE_ID_PRO` misconfigurations).
- Auth flow:
  - `src/pages/SignUp.tsx` and `Login.tsx` (not detailed here) call `signUp` / `signIn` from `AuthContext`.
  - `src/pages/AuthCallback.tsx` handles Supabase’s email confirmation/magic-link callback:
    - Exchanges `code` for a session (`exchangeCodeForSession`).
    - Immediately signs out, cleans up the URL, and redirects the user to `/login` with a “email verified” message.
    - Also handles implicit-flow tokens in the hash fragment and the “no parameters” error state.

### UI, styling, and shared types

- Styling:
  - Tailwind CSS is configured in `tailwind.config.js` with custom color palettes (`royal`, `gold`, `crimson`), fonts (`display`, `mono`), and utility animations (gradient, glow, float, shimmer, etc.).
  - `src/index.css` contains the Tailwind base, plus app-specific utilities like the glass/mesh backgrounds and global typography (see class names such as `glass-card`, `mesh-bg`, `logo-watermark`, etc.).
- Shared components:
  - `src/components/Navigation.tsx` exports `PublicNav` and `AppNav` used by `PublicLayout` and `AppLayout`.
  - `src/components/Footer.tsx` is the shared footer across public and app layouts.
  - `src/components/animations/index.tsx` wraps common `framer-motion` patterns (e.g. `FadeInOnScroll`, `StaggerContainer`, `TiltCard`, `Parallax`, `Float`) to keep pages declarative.
- Domain types and navigation config:
  - `src/types.ts` defines core frontend types (`UserProfile`, `Track`, `Split`, `RegistrationStatus`, `ChecklistItem`, `StreamCalculation`) and shared navigation config arrays (`PUBLIC_NAV`, `PAID_NAV`).

### Local-only prototype app

- `app.tsx` in the project root contains a standalone “RightsSync Pro Edition” tool:
  - It is **not** wired into the main Vite entry (`src/main.tsx`) and does not use Supabase.
  - Manages all state in `localStorage` (`rights_sync_profile` and `rights_sync_tracks`).
  - Provides a sidebar with tabs (profile, tracks, automation checklist, toolkit), local split-sheet management, a royalty estimator, and CSV export.
- Treat this as a self-contained prototype or reference implementation; changes here will not affect the deployed SPA unless you explicitly integrate it into the Vite build.

## Backend, data model, and infrastructure

### Vercel deployment and routing

- `vercel.json` configures Vercel deployment as a static Vite app plus Node serverless functions:
  - `installCommand`: `npm install`.
  - `buildCommand`: `npm run build` (builds the Vite app into `dist/`).
  - `outputDirectory`: `dist`.
  - `rewrites`:
    - `/api/(.*)` → `/api/$1` (maps `/api/*` requests to serverless functions in the `api/` directory).
    - `/((?!api/).*)` → `/index.html` (SPA fallback so React Router can handle client-side routes).

### Supabase admin client and environment variables

- `api/_supabaseAdmin.ts` creates a Supabase **service role** client for backend use only:
  - Uses `process.env.SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY`.
  - Auth options disable token auto-refresh and session persistence (appropriate for server-side execution).
- Do **not** reuse the service role key on the frontend; it is only safe inside serverless functions.

### Stripe integration (serverless API routes)

All serverless functions live in `api/` and are intended to run on Vercel.

- `api/create-checkout-session.ts`:
  - POST-only handler that starts a subscription Checkout session for a logged-in user.
  - Expects JSON body `{ userId: string }`.
  - Uses `supabaseAdmin.auth.admin.getUserById` to fetch the Supabase auth user and email.
  - Ensures there is a Stripe customer:
    - Creates one if missing and persists `stripe_customer_id` into `auth.users.app_metadata` via `updateUserById`.
  - Creates a Stripe subscription checkout session with:
    - `mode: 'subscription'`.
    - `price` from `process.env.PRICE_ID_PRO`.
    - `client_reference_id` and metadata containing the Supabase `user.id`.
    - `success_url`: `${origin}/app?checkout=success`.
    - `cancel_url`: `${origin}/pricing?checkout=cancelled`.
  - Environment variables used:
    - `STRIPE_SECRET_KEY` (required).
    - `PRICE_ID_PRO` (required).
    - `PUBLIC_APP_URL` (optional fallback when `req.headers.origin` is missing).
- `api/create-guest-checkout.ts`:
  - POST-only handler that creates a subscription Checkout session **without** a known Supabase user.
  - Uses `PRICE_ID_PRO` and redirects success to `/create-account?session_id={CHECKOUT_SESSION_ID}` so the app can create/link an account afterward.
- `api/create-portal-session.ts`:
  - POST-only handler that creates a Stripe Billing Portal session.
  - Expects `{ userId }`, fetches the Supabase auth user via `supabaseAdmin` and reads `stripe_customer_id` from `app_metadata`.
  - Creates a Stripe portal session and returns the portal URL, with `return_url` pointing back to `${origin}/?portal=return`.
- `api/stripe-webhook.ts`:
  - Handles Stripe webhook events for subscriptions and checkout.
  - Verifies signatures when `STRIPE_WEBHOOK_SECRET` is configured; otherwise falls back to trusting `req.body` (intended for local dev only).
  - `updateUser(userId, fields)` helper:
    - Updates Supabase auth `app_metadata` for the user (stores things like `stripe_customer_id` and raw Stripe subscription status).
    - Upserts into the `profiles` table with:
      - `stripe_customer_id`.
      - A normalized `subscription_status` mapped from Stripe’s status via `mapStripeStatusToDbStatus` into the Postgres enum.
  - Handles events:
    - `checkout.session.completed`: marks the user as effectively active/`pro` immediately after successful checkout.
    - `customer.subscription.created` / `updated` / `deleted`: keeps `profiles.subscription_status` and auth `app_metadata.subscription_status` in sync with Stripe.
  - This is the primary mechanism that keeps the gated app (`RequireAuth` + `AuthContext`) in sync with Stripe billing.

### Supabase database schema

- `supabase/schema.sql` describes the full Postgres schema used by the app (run once in the Supabase SQL editor when setting up a project). Key elements:
  - Custom enums:
    - `subscription_status`: `'free' | 'pro' | 'enterprise' | 'cancelled' | 'past_due'`.
    - `registration_status`, `checklist_category`, `collaborator_role`, `pro_affiliation`, `background_option`, etc.
  - Core tables:
    - `profiles`:
      - One row per user (`id` references `auth.users(id)`).
      - Stores artist identity, PRO and publisher data, customization (colors/backgrounds), social links, Stripe IDs, and `subscription_status`.
      - Indexed by `email`, `stripe_customer_id`, `subscription_status`, and `artist_name` (trigram index for fuzzy search).
    - `tracks`:
      - Music catalog for each user (`user_id` references `profiles.id`).
      - Stores metadata (title, album, genre, dates, identifiers like ISRC/ISWC/UPC), performance metrics (streams/earnings), and a JSONB `registration_status` per platform.
    - `splits`:
      - Per-track collaborator splits with `percentage`, `role`, optional linkage to `profiles`, and uniqueness constraint on `(track_id, collaborator_email)`.
      - Enforced by the `validate_splits()` trigger so total splits cannot exceed 100%.
    - `checklist_items`:
      - Per-user registration/setup checklist items grouped by `checklist_category`.
      - Mirrors the concept used in the `Checklist` page.
    - `stream_calculations`, `earnings`, `notifications`, `activity_log` for analytics, royalty calculations, and user-facing notifications.
    - `default_checklist_items` as a template table for initial checklist seeding for new users.
  - Functions and triggers:
    - `update_updated_at_column()` – shared trigger to keep `updated_at` timestamps fresh on updates.
    - `handle_new_user()` – creates a `profiles` row and copies `default_checklist_items` into `checklist_items` whenever a new `auth.users` row is inserted.
    - `validate_splits()` – enforces the 100% cap on splits per track.
    - `log_activity()` – helper for recording events in `activity_log`.
    - Triggers wired to `profiles`, `tracks`, `splits`, `checklist_items`, and `auth.users` to apply the above.
  - Row-level security (RLS):
    - Enabled on all main tables (`profiles`, `tracks`, `splits`, `checklist_items`, `stream_calculations`, `earnings`, `notifications`, `activity_log`).
    - Policies are set up so users can only see and mutate their own rows (with some limited public access to artist profiles where appropriate).
  - Views and helpers:
    - `track_summaries` and `user_dashboard_stats` views provide aggregated data (tracks + splits, per-user dashboard metrics).
    - `get_dashboard_data(p_user_id)` returns a JSON blob combining profile, tracks, earnings, checklist progress, and notifications for a user; can be used as a single call for future dashboard implementations.
  - Storage buckets:
    - SQL includes reference inserts and policies for `profile-images`, `banner-images`, `gallery-images`, and `cover-art` buckets in `storage.buckets`, with RLS policies restricting writes/deletes to the owning user and allowing public reads where intended.

## Environment configuration summary

For local development and production deployments, you will typically need:

- Vite frontend (browser-side):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Supabase service role for backend (serverless functions only):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Stripe billing:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET` (for `api/stripe-webhook.ts` verification).
  - `PRICE_ID_PRO` (subscription price ID used by checkout).
  - `PUBLIC_APP_URL` (optional; used as a fallback origin for redirect URLs).

If these values are missing, the app is coded to fail gracefully in most places (e.g., dashboard/track/checklist pages will show a “Supabase is not configured” message), but premium features and real data loading will not function until the environment is correctly configured.

## Miscellaneous

- `.snapshots/` contains AI snapshot metadata (including a `readme.md` explaining how snapshots are used). This directory is tooling-only and is not used by the runtime app, build, or deployment.
