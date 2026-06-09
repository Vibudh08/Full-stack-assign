# Taskflow

Taskflow is a production-oriented task management dashboard built for the Full Stack Developer Assignment. It provides secure authentication, responsive task management, real-time dashboard metrics, search, filtering, pagination, and optimistic UI updates.

## Technology Stack

- Next.js 16 App Router and TypeScript
- MongoDB and Mongoose
- TanStack Query for server-state management
- Zustand for in-memory authentication state
- Tailwind CSS and ShadCN-style reusable components
- Zod for shared frontend and backend validation
- Axios for API requests
- JWT access tokens and database-backed refresh sessions
- Vitest for automated tests
- ESLint and Prettier

## Features

- User registration, login, logout, and protected routes
- Five-minute access tokens held in memory
- Seven-day opaque refresh tokens stored as hashed database sessions and httpOnly cookies
- Task creation, editing, deletion, completion toggling, search, status filtering, and pagination
- Total, completed, pending, and completion-percentage metrics
- TanStack Query caching, optimistic updates, rollback, error handling, and cache invalidation
- Responsive dashboard cards and table-based task view
- Shared Zod schemas across client forms and API route handlers

## Architecture

The project follows feature-based frontend organization and layered backend boundaries:

```text
app/
  (auth)/                 Authentication pages
  (dashboard)/            Protected dashboard pages
  api/                    REST route handlers
components/
  providers/              Application providers
  ui/                     Reusable UI primitives
features/
  auth/                   Auth components, API client functions, and Zustand store
  dashboard/              Application shell
  tasks/                  Task components, hooks, services, cache utilities
hooks/                    Shared React hooks
lib/                      Server utilities, auth, API responses, database connection
models/                   Mongoose schemas
repositories/             Database access
services/                 Business logic
types/                    Shared API types
validations/              Shared Zod schemas
```

Request flow:

```text
Route Handler -> Service -> Repository -> Mongoose Model
```

Frontend task flow:

```text
Component -> TanStack Query Hook -> Axios Service -> REST API
```

### Architecture Decisions

- **Custom JWT authentication:** Access tokens remain in Zustand memory to reduce persistent-token exposure. Refresh tokens are opaque, hashed before database storage, and sent only through secure httpOnly cookies.
- **Layered backend:** Route handlers handle HTTP concerns, services contain business rules, and repositories own database queries.
- **Shared validation:** The same Zod schemas validate browser form data and API request payloads.
- **Server and client boundaries:** App Router pages and layouts remain Server Components. Interactive forms, authentication bootstrap, task queries, and mutations are isolated Client Components.
- **Optimistic route protection:** Next.js Proxy checks a non-sensitive httpOnly session marker before rendering protected pages. Every protected API still performs authoritative JWT authorization.
- **Server-state ownership:** TanStack Query owns task data, caching, optimistic changes, rollback, and refetching. Zustand is limited to authentication state.

## Assumptions

- Each task belongs to exactly one user.
- Task status is limited to `pending` or `completed`.
- Due date is required.
- Refresh sessions represent individual logins and are revoked on logout or removed automatically after expiry.
- MongoDB Atlas may require custom DNS resolvers in some development networks. `DNS_SERVERS` is optional and only applied outside production.

## Environment Setup

Create `.env.local` from `.env.example`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
DNS_SERVERS=8.8.8.8,1.1.1.1
```


Install dependencies and start development:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Reference

Authentication:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Register and issue tokens |
| POST | `/api/auth/login` | Authenticate and issue tokens |
| POST | `/api/auth/refresh` | Issue a new access token |
| GET | `/api/auth/me` | Return the authenticated user |
| POST | `/api/auth/logout` | Revoke the current refresh session |

Tasks:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/tasks` | Search, filter, paginate, and return metrics |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Return one owned task |
| PATCH | `/api/tasks/:id` | Update one owned task |
| DELETE | `/api/tasks/:id` | Delete one owned task |

Protected task routes require:

```http
Authorization: Bearer <access-token>
```

Task list query parameters:

```text
search=<text>&status=pending|completed&page=1&limit=20
```

## Quality Checks

```bash
npm run test
npm run test:coverage
npm exec tsc -- --noEmit
npm run lint
npm run format:check
npm run build
```

The automated suite covers authentication validation, task validation, optimistic task-cache behavior, metrics updates, and protected-route proxy behavior.

## Deployment

The application is compatible with Vercel's standard Next.js deployment flow:

1. Import the repository into Vercel.
2. Configure `MONGODB_URI` and `JWT_SECRET`.
3. Do not set `DNS_SERVERS` unless the deployment network explicitly requires it.
4. Deploy using the default Next.js build command.

For other Node.js hosting platforms:

```bash
npm run build
npm run start
```

## Security Notes

- Passwords are hashed with bcrypt.
- Refresh tokens are hashed before database storage.
- Refresh cookies use `httpOnly`, `sameSite=strict`, and `secure` in production.
- API authorization validates JWT issuer, audience, signature, expiry, and task ownership.
- Environment variables are validated at runtime with Zod.
