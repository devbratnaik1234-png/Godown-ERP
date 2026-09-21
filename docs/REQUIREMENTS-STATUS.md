# Mandatory extension traceability

Statuses describe implementation, not production certification. “Partial” means further engineering is required, not merely supplying credentials.

| User requirement sections | Status in this draft |
|---|---|
| 1–8, 13, 54–55 | Four packs, semantic keys, English fallback, user/org preferences, switch without logout, centralized INR/date formatting implemented in active UI. |
| 4, 14–16, 56–58, 61, 63–64 | Partial: active screens and forms translated; localized/bilingual payment receipt, summary, bundled fonts, locale parity and Chromium layout/print checks. Full invoices/report set and real devices remain. |
| 9 | Unicode name search, literal identifier preservation; no cross-script transliteration. |
| 10–12, 47–48 | PaddyPal uses selected/question language preference and read-only authorized tools. No live AI/mixed-language evaluation without credentials. No AI money movement. Draft financial actions are not implemented. |
| 17–18, 62 | Draft terminology only. Native/professional review, admin translation tools and organization overrides remain. |
| 19–22, 25, 41, 53, 74 | Shared provider interface/registry; manual + Cashfree collection adapter; separate payout interface; secrets server-side; hosted checkout. Additional online gateways remain. |
| 23–24 | Partial: enabled/default providers and modes; no routing policies, failover or configuration health checks. |
| 26–30, 42–44, 50–52 | Core pending/reservation/verified webhook/idempotency/audit implemented. No frontend success trust. Timeout outcomes retained for review. More state lifecycle handlers, distributed security controls and complete failure matrix remain. |
| 31–33 | Partial: exception/status model and explicit provider status reconciliation. No settlement ingestion, recurring job, bank statement reconciliation or resolution UI. |
| 34 | Refund request schema/API/UI only. Execution, approvals, partial/full financial reversal and provider status handling remain. |
| 35–36 | Hosted checkout only; distinct shareable payment links and transaction QR services remain. |
| 37–40, 66 | Money IN/OUT separated. Manual OUT requires different manager/admin. Encrypted beneficiary storage and payout interface only; no banking execution or completed payout tests. |
| 45–46 | Localized verified receipts; notification records created. Notification inbox/delivery, SMS/WhatsApp/email remain. |
| 49 | Collections by recorded method and basic transaction status views. Actual online method normalization, success-rate/settlement analytics remain. |
| 59–60 | Voice and OCR deferred; no execution paths implemented. |
| 65 | Unit and DB integration test suites added; provider sandbox contract/edge-case matrix, refund/restart/recovery scenarios remain. |
| 67–71, 75 | Additive refactor, API transition and migration runbook provided. Production data inspection/backup/import blocked by unavailable production connection. No destructive data changes. |
| 72–73 | Platform vision only partially realized. Production mill costing, full finance, automation, forecasting, OCR and full payment/payout operations remain. |

Do not advertise this draft as “enterprise ready” or mark all requirements complete.
