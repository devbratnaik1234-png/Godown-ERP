# PaddySync Ultimate: implementation and migration review

This is a **draft foundation release**, not completion of the 75-section enterprise specification. Do not deploy it over an existing installation without staging reconciliation and passing database integration tests. No production database was available during development; no production records were inspected, changed, backed up, or migrated.

## Why the architecture changes

The inspected main branch at `a859c4462901ea7de9f8af812951b2124adddd1a` had global CRUD queries, an admin-only user role, independent purchases and stock, frontend-stored JWTs, and payments with only Paid/Pending. Purchase/payments could be overwritten/deleted through generic CRUD. These cannot safely support multiple organizations, payment retries, or an authorized AI assistant.

We retain React/Vite, Express and MongoDB. The new architecture is a modular monolith: one deployable API, explicit business services, organization-scoped records, MongoDB transactions, and a separately versioned API. Microservices, Redis, queues and vector databases were not added because they do not solve a current demonstrated bottleneck.

| Area | Change | Files | Data/API impact |
|---|---|---|---|
| Authentication | HttpOnly SameSite cookie, DB-authoritative role/organization, revoked sessions, Origin checks, login throttling | server/src/auth.js, server/src/server.js, client/src/ultimate/api.js | New UI requires same-origin API. Legacy bearer login is opt-in during transition. Logout invalidates all sessions for that user. |
| Tenancy | Organization ID in every new business collection; scoped legacy queries | server/src/models.js, server/src/v2/models.js, server/src/crudRouter.js | Existing unassigned users must be migrated; never infer tenant ownership automatically. |
| Stock | Purchases/sales/processing append movements and update balances atomically | server/src/v2/operations.js | New collections, integer grams. Old stock remains untouched and is not automatically summed into the new ledger. |
| Finance | Integer paise, invoice reservations, idempotent transactions, separate accounting entries and provider status | server/src/v2/payments.js | New collections. Legacy financial writes explicitly return LEGACY_READ_ONLY (409). Existing GET response shapes remain for authorized scoped users. |
| Payments | Provider registry + capability interface; manual recording and Cashfree collection adapter | server/src/v2/providers.js | Cashfree implementation based on official docs; credentials and merchant sandbox validation required. No automatic charge retries/fallback. |
| UI / i18n | New responsive active UI, semantic keys, four JSON language packs, English fallback, bundled script fonts | client/src/App.jsx, client/src/ultimate, client/src/i18n | Old component sources retained for reference; no longer active routes. Old route aliases redirect to new screens. |
| PaddyPal | Responses API function calls, bounded read tools, strict argument validation, role and org enforced in code | server/src/v2/paddypal.js, queries.js | Opt-in organization setting and server key/model. Questions and authorized tool results go to configured AI provider. No write tools or arbitrary query execution. |

## Business rules introduced explicitly

- New purchase/sales prices are **INR per kilogram**, quantities are stored in integer grams, and totals round half-up to paise. Legacy units must be verified before import.
- New purchase/sale posting is immutable; correction/reversal workflows are not implemented. This is a release blocker for routine production operation.
- Every manual OUT confirmation currently requires a second manager/admin, regardless of amount. Threshold-based multi-level approval is not implemented.
- Manual payment records confirm money already received/sent; they never initiate a bank transfer. Cheques may be confirmed only after clearance.
- A test gateway success releases its reservation but never credits live invoices or posts live ledger entries. Test receipts carry a test warning.
- Paddy-to-rice processing records one input, one output, and an explicit unrecovered mass balance. Husk/bran inventory allocation, moisture conversion and cost allocation require an agreed business policy before implementation.
- Current stock is always current even when a dashboard date filter is selected. Date filtering applies to procurement/sales documents and collection confirmations. “Outstanding” is the current unpaid amount on documents in that date range.
- New financial figures exclude legacy records. Never interpret a new zero balance as the old business having no stock or debts.

## What is usable in the draft

Secure login; persisted user and organization locale preferences; temporary browser-session language override; master records; transactional purchase/sale posting; stock lookup; simple rice conversion; existing truck and labour records; manual IN/OUT recording; separate confirmation; payment reservations, reconciliation flags and audit events; Cashfree hosted checkout with verified raw-body webhook flow; localized browser-printable payment receipt and summary; CSV export of the displayed page; organization settings and user creation; read-only multilingual PaddyPal integration.

The browser checkout result is ignored for accounting. Only the signed, order/amount/currency-checked webhook posts online success. Duplicate delivery is deduplicated inside the same database transaction as the invoice and ledger update. Failed payment attempts do not make a Cashfree order permanently failed; another attempt can succeed. Unknown provider outcomes retain the reservation and require review. Status checks never create another charge.

## Explicitly unfinished

- A second **online** gateway. Manual + Cashfree adapters are implemented; manual is not an online gateway. Add provider adapters through the registry and separately implement their checkout UI, normalized event mappings and contract tests.
- Gateway refund execution, partial-refund ledger reversal, dispute lifecycle, automatic settlement ingestion, scheduled reconciliation, reconciliation resolution/recovery UI and QR/payment-link APIs. Refund request storage exists; it must not be described as completed refund support.
- Payout execution, bank verification, usable beneficiary/payout management screens, configurable maker/checker/final-approver thresholds. An encrypted beneficiary storage endpoint and payout interfaces/schemas exist; execution fails closed.
- Formal general ledger, opening balances, COGS/profit, GST/tax rules, credit notes, business document cancellation/reversal, vendor advances, farmer statements and full invoices.
- Full mill production/BOM, husk/bran cost allocation, labour attendance/payroll, live market feeds, historical analytics, forecasting and workflow automation.
- OCR, voice, SMS, WhatsApp and email connectors. No false “sent” indicators are presented.
- Translation admin, organization terminology overrides, reviewed financial/legal glossary and translation approval process. The packs are drafted translations, not professional review.
- Native Android/iOS/Safari tests and full report suite. Bundled fonts and Chromium mobile emulation are only part of device validation.
- Full-scale search/export. Lists are paginated; master selectors cap at 100 and stock query at 200. Reports/CSV currently export displayed data, not all records.
- Production-grade distributed rate limiting, MFA/password recovery, member lifecycle administration, security review and operational monitoring. Current limiter is process-local: deploy one API instance until a shared limiter is configured.

## Acceptance gates

Run unit, locale, build, lint, browser and real MongoDB replica-set integration suites. Browser tests use mocked responses and do not prove DB correctness. Run the merchant sandbox matrix (success, cancellation, failure, duplicate/delayed callbacks, restarts, wrong amount/currency, timeout, signature failure). Refund/payout tests remain blocked until execution adapters exist. Review translations with native speakers. Verify a backup restore before migration. Reconcile stock/receivable/payable opening balances before cutover. Do not enable live payment credentials as a substitute for completing these gates.

## Official integration references checked

- Cashfree Create Order: https://www.cashfree.com/docs/api-reference/payments/latest/orders/create-order (API version 2026-01-01; UUID idempotency header)
- Cashfree webhook signatures: https://www.cashfree.com/docs/payments/online/webhooks/signature-verification
- Cashfree webhook idempotency: https://www.cashfree.com/docs/payments/online/webhooks/webhook-indempotency
- Cashfree hosted checkout: https://www.cashfree.com/docs/payments/online/web/redirect
- Cashfree order payments: https://www.cashfree.com/docs/api-reference/payments/latest/payments/get-payments-for-an-order
- OpenAI function calls: https://developers.openai.com/api/docs/guides/function-calling
- i18next fallback/configuration: https://www.i18next.com/overview/configuration-options
