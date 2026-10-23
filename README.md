# WSB Digital

Member-owned banking, built for the web. This repository contains the complete
WSB Digital customer and administrator portal: a React single-page app with a
marketing site, member dashboard, and admin console.

The interface runs against a local mock backend so the full product can be
explored without external services.

## Stack

- Vite 8 + React 19
- React Router 7
- oxlint
- Plain CSS (`src/styles.css`) — no UI framework

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint
```

## Seeded accounts

Mock data is created on first load. Sign in with any of the following accounts:

| Role     | Email                     | Password     |
| -------- | ------------------------- | ------------ |
| Member   | `member@wsbdigital.com`   | `Member123!` |
| Admin    | `admin@wsbdigital.com`    | `Admin123!`  |
| Pending  | `pending@wsbdigital.com`  | `Pending123!`|

New applications created through **Open an account** (`/signup`) start in
`pending` status until an administrator approves them.

## What is included

**Marketing site** — Home, About, Products (with loan calculator at
`/products#calculators`), Contact, and 404.

**Member portal** (`/dashboard`, tabbed via `?tab=`)

- Overview: total balance, account cards, recent activity, transfer allowance
- Transfers: internal, external US, international, member-to-member, and bill pay
- Cards: debit/credit, freeze/unfreeze, details, card controls
- Statements: filterable transactions and CSV export
- Profile: contact and personal details
- Security: password change, 2FA toggle, local data reset
- Deposit and bill-pay modals

**Admin console** (`/admin`, `/admin/reset-transfers`)

- Member stats, search, and status filters
- Approve, reject, and reinstate applications
- Edit balances, post and delete transactions
- Reset transfer allowances per member or for everyone
- Create members directly

**Auth** — sign in, multi-section application, registration confirmation, and a
pending approval screen that updates live after approval.

## Data layer

Everything runs in `src/lib/db.js`, a mock backend over `localStorage`:

- Keys: `wsb_users_v2`, `wsb_session_v2`, `wsb_transactions_v2`, `wsb_transfers_v2`
- Mutations emit a `wsb:change` event; `AuthContext` subscribes and refreshes,
  so admin changes appear on the member side without a reload.
- Passwords are stored in plain text for local development only.

To point the app at a real API, replace the functions exported by `src/lib/db.js`
with network calls. The rest of the application is already written against that
module boundary.

## Project layout

```
src/
  App.jsx              route table
  main.jsx             providers + styles
  lib/db.js            mock backend, seeding, all mutations
  lib/format.js        currency/date helpers
  context/AuthContext.jsx
  components/          Logo, Navbar, Footer, AppHeader, Modal, Toast, Icons, Guards
  pages/               Home, About, Products, Contact, Login, Signup,
                       RegistrationSuccess, PendingApproval, Dashboard,
                       Admin, ResetTransfers, NotFound
  styles.css           all styling
```

## Deployment

`npm run build` outputs a static bundle to `dist/`. Because the app uses the
History API, configure the host to serve `index.html` for unknown routes
(for example, a catch-all rewrite to `/index.html`).

## Notes

This project is a frontend implementation with local mock data. It is not
connected to a banking core, payment network, or identity provider.
