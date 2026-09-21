# PaddySync

A multilingual paddy ERP under active development: React/Vite + Express + MongoDB replica-set transactions.

This branch is a **draft architecture and product foundation**, not a production-ready implementation of the full PaddySync Ultimate specification.

- English, Hindi, Bengali and Odia UI with i18next and bundled script fonts.
- Organization-scoped procurement, sales, inventory and simple rice processing.
- Manual collections/disbursements and Cashfree hosted collection adapter with verified webhooks.
- Separate invoice reservation, ledger, reconciliation, settlement and audit records.
- PaddyPal read-only AI tool integration over authorized organization data.
- Mobile layout, browser-printable localized receipts, CSV export, user roles and language preferences.

Start with [architecture and current limitations](docs/PADDYSYNC-ARCHITECTURE.md), [migration/deployment instructions](docs/MIGRATION-AND-DEPLOYMENT.md), and [mandatory requirement status](docs/REQUIREMENTS-STATUS.md).

Do not connect this branch to an existing production database before reviewing the migration plan. Legacy financial writes are intentionally read-only, and old balances have not been imported into the new ledger.

## Run

Use Node 24. Configure a development MongoDB replica set, then:

```sh
cd server
npm ci
cp .env.example .env
# Configure the local .env, then:
npm run dev
```

In a second terminal:

```sh
cd client
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:5173. Credentials come from your local server environment on an empty installation. No business demo data or fixed default login is seeded.

## Tests

`server`: `npm test`, `npm run test:integration`.

`client`: `npm run lint`, `npm run test:locales`, `npm run build`, `npm run test:browser` (requires `npx playwright install chromium`). Browser tests explicitly mock API responses; integration tests use an isolated MongoDB replica set.
