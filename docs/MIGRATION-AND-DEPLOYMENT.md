# Migration and deployment runbook

## Review before cutover

Use a feature branch/staging environment. The old UI is retained in source history; this branch switches the active UI and deliberately restricts legacy financial writes. Existing integrations expecting a token in the login JSON must migrate to cookies or explicitly enable LEGACY_BEARER_LOGIN during a bounded transition. Never merge this over a live deployment without the owner acknowledging those compatibility changes.

1. Inventory the production database topology, collections, counts, quantities/units, rates, payment evidence, owner/organization mapping and external integrations. No production connection was available to perform this step in this development session.
2. Take a consistent provider snapshot or `mongodump` archive using deployment-managed credentials. Keep it encrypted outside the repository, restrict access and record checksum/timestamp.
3. Restore that backup into an isolated staging replica set. Compare collection counts, sampled records, stock totals, farmer balances and unpaid documents against the business registers. A file existing does not establish restore success.
4. Create the verified target Organization in staging. Run `npm run migrate:organization` first (dry run, counts only). Review whether every unassigned record really belongs to that organization. This script is only suitable for a verified single-organization legacy database.
5. Only after the backup restore test, set MIGRATION_ORGANIZATION_ID and BACKUP_VERIFIED_AT through the migration environment and run `npm run migrate:organization -- --apply`. It assigns missing organization IDs transactionally and is rerunnable. It does not alter monetary figures or delete data.
6. Old farmer names are strings in purchases/payments. Build a reviewed mapping from legacy IDs/names to Parties; do not auto-merge same-name farmers. Opening stock/import tooling and opening payable/receivable documents still need implementation after inspecting actual data. Never replay old purchases and also import the same closing stock, which would double-count inventory.
7. Freeze old financial writes during final reconciliation. Only open the new posting interface after verified opening balances and correction workflows exist.

Rollback before any v2 business writes: restore the old app commit and configuration; retain additive collections for analysis. After v2 writes: do not roll back blindly, delete new records, or restore an old snapshot over newer business activity. Freeze writes, reconcile/export v2 activity, and execute an owner-approved recovery plan.

## Local setup for an empty development database

Requires Node 24 and a MongoDB replica set (Atlas or a local single-node replica set). The API refuses standalone MongoDB because its business writes require transactions.

```sh
cd server
npm ci
cp .env.example .env
# Edit only the local .env: database URI, strong JWT secret, unique admin password.
npm run dev
```

In another terminal:

```sh
cd client
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:5173. The Vite proxy sends `/api` to localhost:5000. No sample business records are seeded. Create products, godowns and parties before procurement. Create a second manager account for outbound confirmations.

## Production topology

Serve built `client/dist` and `/api` on the same HTTPS origin through your reverse proxy. Set CLIENT_ORIGIN exactly to that origin, NODE_ENV=production and a strong JWT_SECRET. Set TRUST_PROXY_HOPS only for the actual trusted proxy chain. Do not expose MongoDB to the public internet. Use replica-set backups, least-privilege DB credentials, external secrets and centralized logs. Build with `npm ci`; do not put server environment variables into Vite public variables.

Cashfree secrets use `CASHFREE_<UPPERCASE_ORGANIZATION_OBJECTID>_<TEST|LIVE>_CLIENT_ID` and matching `_SECRET` names. Test/live are separate. Configure the signed webhook URL `/api/webhooks/<organizationId>/cashfree/<test|live>` in the merchant dashboard. Whitelist your checkout domain there. The application does not create merchant accounts or complete business onboarding.

The live gate ENABLE_LIVE_PAYMENTS defaults to false. Passing unit tests does not authorize changing that gate. Rotate secrets through your deployment secret manager; old delayed webhooks during rotation need an explicitly tested overlap strategy (not implemented).

PaddyPal requires OPENAI_API_KEY, an explicit OPENAI_MODEL supporting Responses function calling, and organization aiEnabled. Do not enable until the business accepts sending questions and authorized results to that provider. Model calls are bounded and do not expose transfer tools. Actual multilingual model behavior has not been evaluated without an API key.

## Validation

```sh
cd server
npm test
npm run test:integration
cd ../client
npm run lint
npm run test:locales
npm run build
npx playwright install chromium
npm run test:browser
```

CI executes these on an Ubuntu runner with an ephemeral MongoDB replica set. Integration tests never use the production URI. The local work runtime rejected starting MongoDB with `open: Operation not permitted`; report this as blocked, never as a passed integration run. Old inactive frontend lint findings are available separately via `npm run lint:legacy`.
