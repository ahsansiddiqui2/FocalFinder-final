# Photographer Marketplace — Sprint-based Project Plan

**Audience:** Professional developers, PMs, and stakeholders. Clear, actionable, low-ambiguity tasks per sprint.

**High-level goal:** Build a marketplace connecting freelance photographers and clients (profiles, discovery, booking, messaging, review & payments) using React (frontend), Node/Express (backend), and PostgreSQL (SQL) for the database. We'll use modern tooling (TypeScript, Vite, Prisma/TypeORM) and follow a sprinted delivery model.

---

## Assumptions & Decisions

* You asked for *MERN + SQL*. `MERN` traditionally uses MongoDB. To keep React/Node/Express while providing a relational SQL database, this plan uses **React + Node + Express + PostgreSQL** (sometimes called a "PERN" variant). PostgreSQL is recommended for bookings/transactions relational integrity, complex queries, and reporting.
* Use **TypeScript** across frontend and backend for stronger contracts.
* Use **Prisma** (ORM) or **TypeORM** for DB migrations and models (Prisma recommended for developer DX).
* File storage for images: **Cloudinary** or **AWS S3** (signed uploads). Use a CDN in front of the storage for performance.
* Authentication: JWT for API + refresh tokens; cookies or secure storage on client. Support OAuth providers as optional (Google, Apple).
* Sprint cadence: **1 week per sprint** (5 working days) — you can compress or expand depending on team size. Each sprint contains granular tasks and acceptance criteria.

---

## Deliverables & Definition of Done (DoD)

**For each sprint deliverable:**

* Implemented feature behind a feature flag or route.
* Unit tests for new code (target: 70% coverage for business logic), and basic integration tests for key flows.
* Documentation: README updates, API contract (OpenAPI/Swagger or Postman collection) for new endpoints.
* Deployed to a staging environment (optional per sprint) or tested locally with seeded data.

---

## Tech Stack (recommended)

**Frontend:**

* Vite + React + TypeScript
* TailwindCSS
* react-router-dom
* react-query (TanStack Query)
* react-hook-form + Zod or Yup
* Zustand for small global state (auth) or Redux Toolkit if you prefer
* Leaflet or Mapbox for maps

**Backend:**

* Node.js + Express + TypeScript
* Prisma (PostgreSQL) or TypeORM
* Authentication: JWT (access + refresh) + secure cookies
* Email: transactional (SendGrid/SES)
* Payments: Stripe (for bookings & payouts)
* Storage: S3 or Cloudinary for images

**Dev infra:**

* GitHub (branches, PR, code reviews)
* GitHub Actions CI: lint, build, unit tests
* Docker (optional) for local consistency
* Staging and production environments (Heroku, Vercel, Render, or AWS)

---

## Sprint Plan (8 sprints) — Frontend first, backend second, final integration & keys last

> Sprint length: 1 week. If you want shorter tasks (2–4 day sprints), shrink scope accordingly. Each bullet is an independent task a developer can pick up.

### Sprint 0 — Prep & Project Setup (half-sprint / day 0)

**Goal:** Project scaffolding so both front-end and back-end teams can start.

**Tasks:**

* Create monorepo or two repos (frontend / backend). Recommend monorepo (pnpm/workspaces) for tighter sync.
* Frontend: Vite + React + TypeScript setup, Tailwind configured, basic eslint + prettier.
* Backend: Express + TypeScript project scaffold, TypeScript config, eslint, Prettier, basic folder structure.
* Add shared `.env.example` files, README skeletons, contribution and branch strategy (feature/*, hotfix/*, main).
* Initialize Postgres dev DB (Docker compose) and Prisma (or TypeORM) config.

**DoD:** Both apps build without runtime errors. Lint passes. `README.md` has startup instructions.

---

### Sprint 1 — Frontend Foundation (UI System & Layouts)

**Goal:** Build the reusable UI library and main layouts so pages can be assembled quickly.

**Tasks:**

* Create `src/components/ui/*`: Button, Input, TextArea, Select, Modal, Card, Avatar, Badge, Tabs, Skeleton (loading), ImageGallery.
* Layouts: `MainLayout` (Header, Footer, top nav), `AuthLayout`, `AdminLayout`.
* Global state: simple auth store (zustand) skeleton and theme handling.
* Routing skeleton with placeholder routes: `/`, `/login`, `/signup`, `/profile/:id`, `/search`, `/brief/:id`, `/booking/:id`, `/admin`.
* Create form config utilities (field definitions -> render forms) for future reuse.
* Basic responsive foundation (mobile-first): mobile layout + breakpoints.

**Acceptance Criteria:**

* All UI components are storybook-ready or have a demo page.
* Layouts can mount example pages with static data without errors.

**Deliverable:** UI library + routing + a design tokens file for spacing/colors/fonts.

---

### Sprint 2 — Core Pages (Static / Mock Data)

**Goal:** Build main pages with static/mock data and component hooks.

**Tasks:**

* Home page: hero, featured photographers carousel, search form.
* Search & results page (list + grid + filters UI). Use mock JSON.
* Photographer profile page: header, portfolio gallery, services, calendar placeholder, reviews section (static data).
* Client profile page: basic info, past bookings list (static data).
* Create Brief (job post) form (UI only).
* Portfolio modal/viewer (lightbox) and booking summary static page.

**Acceptance Criteria:**

* Pages load with mock data; filters update UI state (no backend required yet).
* All forms validate client-side using react-hook-form + Zod/Yup.

**Deliverable:** Clickable SPA prototype for flows (client -> find photographer -> view profile -> open booking modal).

---

### Sprint 3 — Backend Skeleton & Auth (APIs + Database Models)

**Goal:** Implement backend fundamentals: auth, user model, and API scaffolding.

**Tasks:**

* Database schema (Prisma): Users, PhotographerProfile, PortfolioItem, Briefs (job posts), Bookings, Messages, Reviews, Payments, Sessions.
* Migrations & seed script (create sample users & photographers).
* Auth endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`.
* Password hashing (bcrypt), email verification token model (optional), JWTs + refresh tokens stored server-side.
* Basic API structure: routers for `users`, `profiles`, `briefs`, `bookings`, `messages`.
* Implement CORS, input validation (Zod/Joi), error middleware.

**Acceptance Criteria:**

* Can register/login from frontend mocked forms against backend.
* API docs updated (Swagger/OpenAPI or Postman collection).

**Deliverable:** Working auth + seeded DB; frontend connected to real auth endpoints.

---

### Sprint 4 — Profiles, Portfolios & Discovery APIs

**Goal:** Real data for profiles, search, and portfolios.

**Tasks:**

* Implement `GET /profiles/:id`, `GET /profiles?filters...`, `POST /profiles/:id/portfolio` (protected), `DELETE` portfolio endpoints.
* Image upload flow: signed upload endpoint or direct server-side upload to S3/Cloudinary. Implement thumbnails.
* Implement search/filter backend: location, availability, style, price range, rating.
* Pagination and cursor-based or offset paging.
* Backend mapping for Map pins (latitude/longitude fields).

**Acceptance Criteria:**

* Frontend search wired to backend; results are accurate with pagination and filters.
* Portfolio upload from frontend stores image in storage and creates DB record.

**Deliverable:** Discovery + profile endpoints with real data and image uploads.

---

### Sprint 5 — Booking, Payments & Availability

**Goal:** Booking flows (create booking, accept/decline, calendar), payment integration (Stripe), and availability.

**Tasks:**

* Booking endpoints: `POST /bookings`, `GET /bookings/:id`, `PATCH /bookings/:id/status` (accept/decline/cancel), `GET /users/:id/bookings`.
* Availability model: `available_slots` or integrate calendar (Google Calendar integration optional).
* Payment flow: integrate Stripe checkout or PaymentIntent for client-side payments + backend webhook to capture status. Create payout flow placeholders for photographers.
* Booking confirmation emails (SendGrid).

**Acceptance Criteria:**

* Client can initiate payment + booking; backend records booking with status; webhooks update booking/payment status.
* Basic admin or notifications for photographers about pending bookings.

**Deliverable:** Functional booking + payment pipeline on staging (stripe test keys).

---

### Sprint 6 — Messaging, Reviews, Ratings, & Notifications

**Goal:** Real-time messaging (or near real-time), reviews, and user notifications.

**Tasks:**

* Messages endpoints and socket flow (WebSocket or polling). `GET /messages?conversationId=`, `POST /messages`.
* Conversations model linking users & bookings.
* Reviews: `POST /reviews`, `GET /profiles/:id/reviews`, enforce one review per booking.
* Push/email notifications for booking status, new messages, payment events.

**Acceptance Criteria:**

* Messaging works in the app (if WebSocket chosen, use socket.io); messages persist.
* Reviews attached to completed bookings and visible on profiles.

**Deliverable:** Messaging + reviews implemented and tested with seeded examples.

---

### Sprint 7 — Admin, Moderation & Analytics

**Goal:** Build admin pages, user moderation, and basic analytics.

**Tasks:**

* Admin endpoints: list users, suspend/ban user, flag content, moderate photos.
* Admin UI: tables (searchable + filterable), action buttons (suspend, reinstate), audit logs.
* Basic analytics: bookings per month, revenue, active users (backend queries + frontend charts).
* Add logging and error monitoring (Sentry or similar).

**Acceptance Criteria:**

* Admin can perform moderation actions and they reflect in DB and UI.
* Analytics endpoints return summarized metrics.

**Deliverable:** Admin panel MVP for moderation and metrics.

---

### Sprint 8 — Integration, API Keys, Security, Launch & Post-launch Tasks

**Goal:** Integrate all services, add API keys to environment, harden the app, deploy to production.

**Tasks:**

* Final integration: wire frontend -> backend in production/staging, swap mock data to real.
* Add and secure API keys: Stripe, Cloudinary/S3, SendGrid, Mapbox/GoogleMaps, OAuth creds.

  * Use environment variables only on server side; never expose secret keys in the client.
  * For client-only keys (e.g., Mapbox public token), restrict domain and usage in provider console.
* Run security checklist: helmet, rate limiting, input sanitization, CORS policy, HTTPS, secure cookies, password policy.
* E2E tests for core flows (register/login, search, booking + payment, messaging, review). Use Playwright or Cypress.
* CI/CD: GitHub Actions or pipeline to build & deploy to staging and production. Run migration scripts during deploy.
* Launch checklist: backups, DB monitoring, error monitoring, rollback plan.

**Acceptance Criteria:**

* Production deployment completed and smoke-tested.
* Secrets are stored in environment and not in source control.

**Deliverable:** Live MVP, documented runbook for deployment and secret rotation.

---

## Minimal API Endpoint List (starter)

* `POST /auth/register` — body: {email,password,role}
* `POST /auth/login` — returns accessToken
* `GET /auth/me`
* `GET /profiles` — filters: location, style, price, rating, page
* `GET /profiles/:id`
* `POST /profiles/:id/portfolio` — file upload
* `POST /briefs` — client creates job post
* `GET /briefs/:id`
* `POST /bookings` — attach brief/profile, schedule, payment
* `PATCH /bookings/:id` — change status
* `POST /messages`
* `POST /reviews`

Include Swagger or Postman collection to document request/response shapes.

---

## Database (Core Tables) — simplified

* users (id, email, password\_hash, name, role(client|photographer|admin), created\_at)
* photographer\_profiles (id, user\_id, bio, location, latitude, longitude, styles json, hourly\_rate, rating\_summary)
* portfolio\_items (id, profile\_id, url, public\_id, caption, width, height)
* briefs (id, client\_id, title, description, date\_from, date\_to, location\_data, budget)
* bookings (id, brief\_id, photographer\_id, client\_id, start\_at, end\_at, status, price, payment\_id)
* messages (id, conversation\_id, sender\_id, text, attachments json, created\_at)
* reviews (id, booking\_id, reviewer\_id, rating, comment)

---

## Security & DevOps Quick Checklist

* Use HTTPS everywhere (Let's Encrypt or managed provider).
* Store secrets in environment variables / secrets manager. Rotate keys periodically.
* Rate-limit auth endpoints and common abusive endpoints.
* Input validation and output encoding.
* Use CSP headers, HTTP Strict Transport Security, X-Frame-Options.
* Backups: automated DB backups and test restore.
* Monitoring: Sentry + Prometheus/Datadog for performance if possible.

---

## QA, Testing & Release

* Unit tests for critical business logic.
* Integration tests for API flows (auth, bookings, payments).
* E2E tests for happy-path and a few edge cases.
* Release via tagged releases; changelog for versions.

---

## Recommended Team / Roles (minimal)

* 1 Frontend Engineer (React/TypeScript)
* 1 Backend Engineer (Node/TypeScript, Prisma)
* 1 Full-stack (optional) or 2x frontend/backend split
* 1 Designer / Product Owner (Figma handoff + assets)
* 1 QA / Tester (E2E and manual)
* DevOps support (part-time)

---

## Next steps I suggest you do right away

1. Confirm sprint cadence (1 week?) and team size.
2. Choose DB ORM: **Prisma** (recommended) or TypeORM.
3. Provide Figma link and any brand tokens (colors/fonts) so frontend can match styles.
4. Decide on storage provider (Cloudinary vs S3).

---

## Optional Extensions (Post-MVP)

* AI-powered photographer matching (recommendation engine).
* Dynamic pricing suggestions using AI/ML.
* In-app video consultation feature.
* Multi-language & multi-currency support.
* Mobile app wrapper (React Native or Expo) using the same backend APIs.

---

*Prepared as a complete sprint plan and technical roadmap so a professional developer can start implementing without ambiguity.*



