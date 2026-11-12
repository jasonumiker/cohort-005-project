# Novu Cloud plan fit: bounded clarification for Cadence

Research for [#7](https://github.com/jasonumiker/cohort-005-project/issues/7), supporting the human [provider decision #6](https://github.com/jasonumiker/cohort-005-project/issues/6) and [map #1](https://github.com/jasonumiker/cohort-005-project/issues/1).

**All external sources accessed 2026-11-12, without authentication.** Published dollar prices are not quotations, forecasts, or approved spending. This clarifies the [earlier comparison at its immutable revision](https://github.com/jasonumiker/cohort-005-project/blob/9af32fad0cac3c5236be4473f66c9ec23bc0fcd8/docs/research/hosted-in-app-notification-services.md); it does not repeat the vendor comparison or select a provider.

## Conclusion

**No known documented plan-level incompatibility with the chosen scope was established.** Free explicitly retains end-user Inbox messages for **30 days**, meeting the developer's minimum; it is not limited to the Activity Feed's 24 hours. Free lists five workflows and Development + Production; Pro starts at **$30/month**, with 20 workflows and the same two environments. [S1–S3, S8]

**This is conditional fit, not integration sign-off.** Inbox HMAC has a documented opt-in setup with no stated paid prerequisite, but the reviewed sources do not explicitly promise a Free-specific HMAC entitlement. API idempotency explicitly requires organization enablement, with support as the documented route; Free eligibility, price, and enablement turnaround are not stated. Neither uncertainty proves the functionality is absent or paid-only. An approved account/support check must settle those points before relying on them. [S4, S6]

No accounts, keys, personal data, SDK installs, paid commitments, production changes, or runtime tests were used. Only this research artifact is changed.

## Requirements used, not reopened

The [canonical event decision](https://github.com/jasonumiker/cohort-005-project/issues/2#issuecomment-6813466420) selects four successful event types:

- Refund Request opened → every Platform Admin except the actor.
- Refund Request approved or declined → the Purchase buyer except the actor.
- Seat claimed → the specific Team Licence Purchase buyer except the actor.

One inbox item per logical event and recipient despite retries or role overlap; new successful events only, no backfill; prompt asynchronous/eventual delivery; service outages must not block the domain action. The developer additionally accepts at least 30 days of inbox history, prioritizes modest paid entry cost over free-only usage, and imposes no fixed region for synthetic development. Privacy/data-location review precedes real customer data. No volume estimate, hard paid budget, account setup, or purchase is authorized.

## Retention and plan limits: unambiguous evidence

| Published limit | Free | Entry paid: Pro | Evidence |
| --- | --- | --- | --- |
| Monthly base price | $0; no credit card required | From $30 | S1, S3 |
| Included workflow runs/month | 10,000 | 30,000 at entry; larger tiers available | S1, S3 |
| Additional workflow runs | Pricing cell is “—”; billing docs say stop at allowance | $1.20 per 1,000 | S1, S3; conflict noted below |
| Workflows | 5 | 20 | S1, S2 |
| Environments | 2: Development + Production | 2: Development + Production | S1, S2, S8 |
| End-user **Inbox feed retention** | **30 days** | **90 days** | S1, S2, S9 |
| **Activity Feed/log retention** | **24 hours / 1 day** | **7 days** | S1, S2, S9 |
| Steps per workflow | 20 | 20 | S2 |
| Team members | 3 | 3 | S1, S2 |
| Branding removal | Not included | Included | S1, S4 |

### How the pricing-column ambiguity was resolved

Read the actual public pricing HTML, not a flattened Markdown rendering. Its comparison container has `role="table"` and `aria-label="Pricing comparison table"`. Individual `role="cell"` elements are explicitly labelled:

| Exact HTML `aria-label` | Cell text |
| --- | --- |
| `Inbox feed retention for free plan` | `30 days` |
| `Inbox feed retention for pro plan` | `90 days` |
| `Activity feed retention for free plan` | `24h` |
| `Activity feed retention for pro plan` | `7 days` |
| `Workflow limits for free plan` | `5` |
| `Workflow limits for pro plan` | `20` |
| `Environments for free plan` | `2` |
| `Environments for pro plan` | `2` |

These are explicit feature/plan associations, not guessed column positions. Independently, the **Limits** table labels Free Inbox retention “30 days,” and **Security and Compliance → Data Storage and Retention** labels Free “Inbox Messages” as “30 days,” separately from Activity Feed Logs. The earlier retention uncertainty is therefore resolved. Expiry boundary timing, deletion/backups, and any account-specific override were not runtime-tested. [S1, S2, S9]

### Implications and billing conflict

- Four event types can be represented by four workflows with one in-app step each, within the published five-workflow allowance. This is a feasible mapping, not a selected implementation. Verify actual workflow quota accounting when publishing between environments; do not assume extra experimental workflows are free of that constraint. [S1, S2, S8]
- Both Free and Pro support Dev + Prod, not an additional isolated QA/staging environment. Custom environments require Team/Enterprise; Team starts at $250/month with up to 10 environments. That would be a plan constraint **if** extra environments were required, not a requirement invented here. [S1, S8]
- Billing is organization-wide: development, production, and custom-environment runs share the monthly allowance. [S3]
- **Source conflict:** the pricing HTML's FAQ JSON-LD says notifications are never stopped/throttled and excess rolls into on-demand pricing. The more specific **Billing** docs explicitly say Free stops at 10,000 runs and new triggers receive HTTP `402` until reset/upgrade; paid Pro/Team normally incur on-demand charges unless a configured usage limit has “pause at limit” enabled. Record the contradiction rather than promise either unlimited Free delivery or a verified hard spending control. Prefer the explicit plan-specific billing description for planning; confirm actual plan/trial and limit behavior in an approved account. The same docs distinguish a capped 14-day Pro trial from Free. [S1, S3]
- No monthly cost forecast or assurance that Free has enough capacity follows without traffic/fanout estimates. The modest Pro starting price is decision input, not an approved budget. [S1, S3]

## Inbox identity and HMAC

**Documented enabling:** choose the correct environment, open **Integrations Store → Novu In-App → Integration Credentials**, and enable **Security HMAC encryption**. Compute `HMAC-SHA256(secretKey, subscriberId)` as lowercase hex **on the server**, then pass it as `subscriberHash`. Never expose the secret. When HMAC is active, an Inbox without `subscriberHash` does not load. The public application identifier and a guessed subscriber ID alone are explicitly unsafe. Context-based Inbox usage needs a separately signed context. [S4]

**Free availability evidence and its limit:** the setup guide treats HMAC as standard Inbox security and states no paid gate; on the same page branding removal is explicitly disabled on Free. Pricing includes Inbox/headless components on Free, but has no HMAC entitlement row. This supports an expectation of Free HMAC availability, **not an explicit Free-specific entitlement guarantee**. The account-only check is whether the toggle is available/enforceable on the approved Free organization in each used environment. Do not confuse absence of a written gate with verified account access, or with proof of missing functionality. [S1, S4]

Cadence must derive the subscriber identity from its authenticated server session, suppress actors and deduplicate recipient IDs server-side, and reauthorize notification destinations. HMAC does not choose recipients, revoke content already delivered, or solve role overlap. These are integration obligations under the canonical event rules, not plan features.

## Trigger fanout, billing, and safe retries

### Recipients and metering

- `POST /v1/events/trigger` documents a **maximum of 100 recipients** per trigger. This is a request limit, not a monthly allowance or maximum number of Platform Admins. If the audience exceeds it, use a deliberate chunking/per-recipient strategy or separately validate topic behavior; this pass does not assume topics bypass every limit. [S5]
- Billing is **one workflow run per subscriber**, not one per HTTP call and not one per delivered inbox message. A trigger to 15 subscribers bills 15 runs. Steps/channels within that run do not independently increase the run count. Topic subscriptions filtered out during fanout do not create billed runs; preferences/step conditions applied after a run exists still bill it. Digested triggers remain individually billable. [S3, S7]
- Thus an opened Refund Request with `A` distinct eligible non-actor Platform Admin recipients consumes `A` runs, not one; each other chosen event consumes one if its buyer is not the actor, zero if Cadence suppresses it before triggering. This is a symbolic implication, not a traffic estimate. Prefer pre-trigger actor suppression/deduplication rather than relying on downstream filters. [S3, S7; canonical event rules]
- Free trigger throughput is **60 RPS**, Pro **240 RPS**. Standard trigger calls cost one rate-limit request token; bulk calls cost 100 tokens. These request tokens are not billed workflow runs. Handle `429`/`Retry-After`; the rate limits do not prove a measurable delivery-latency guarantee. [S10]

### API idempotency: availability is conditional

The trigger and idempotency docs both say it is **not enabled for all organizations**, and explicitly direct users to **support@novu.co to enable it for their organization**. The reviewed public sources do not state a Free exclusion, a guaranteed Free entitlement, a self-service switch, an enablement charge, or a turnaround time. Support enablement/confirmation is the documented path; no support contact or provisioning was performed. [S5, S6]

When enabled and using **API-key authentication**, `Idempotency-Key` acts **before queuing**: retries of the same request replay the completed response rather than queueing another trigger; concurrent duplicates receive `409` with `Retry-After`. Docs describe duplicate single-subscriber triggers as one billed run; this does not erase per-recipient fanout billing for multi-recipient requests. [S3, S5–S7]

Keys must be organization-unique, at most 255 characters, and bound to the same body (`422` on a changed body). Completed success **and error** responses cache for **24 hours**; in-progress state for **5 minutes**. After expiry the same key can be processed again. Stable event/recipient keys, retained retry state, identical retry payloads, and an explicit cached-failure/expired-window policy remain Cadence's contract decisions. Do not generate a fresh key for each retry and assume deduplication survives. [S6]

**`transactionId` is not equivalent.** Its uniqueness check occurs during processing, not at the pre-queue API boundary, and does not provide the same atomic deduplication or billing protection. The API introduction describes duplicate transaction IDs being ignored with a tier-dependent retention period, but establishes no exact window here; the explicit idempotency section warns against substituting it for the header. [S5–S7]

Neither mechanism proves **end-to-end exactly-once** inbox delivery, handles a successful domain commit that never reaches Novu, or guarantees deduplication beyond the documented cache window. The reliability contract must preserve new successful events without blocking domain actions during an outage, deduplicate event/recipient pairs, and define recovery and observable acceptance criteria. Novu documents queueing and per-subscriber notification creation; its in-app channel stores messages and pushes them by WebSocket without an external provider send. The external email/SMS retry policy must not be mistaken for an Inbox outage-recovery guarantee. [S7, S11; canonical event rules]

## Validation debt versus actual incompatibility

| Check still needed, only after approval | Classification / effect |
| --- | --- |
| Free organization HMAC toggle; reject missing/invalid/cross-user signatures; isolate caches/subscriptions on user switch | Account/runtime validation debt. No documented paid-only HMAC restriction found; explicit Free entitlement remains unconfirmed. |
| Support confirms API idempotency enabled and available on that Free organization; verify replay, concurrent `409`, changed-body rejection, billing after fanout | Explicit organization-enablement caveat; a gating fact before relying on provider deduplication. No known plan exclusion; not silently satisfied by `transactionId`. |
| Actual Free versus trial status, quota accounting/publishing, `402` handling and any eventual paid usage controls | Account validation debt plus conflicting public overage wording. No authorized paid commitment or test traffic. |
| Exact SDK version in Cadence's React 19 / React Router 8 SSR app: server import/build, hydration, browser boundary, pagination, reconnection, isolation | Runtime validation debt, not a known plan incompatibility. Official React/React Router quickstart is not a test of this app or an SSR guarantee. [S12] |
| Durable event capture/retry, suppression, deduplication beyond 24 hours, outage recovery, measurable latency and one-item acceptance tests | Integration-contract work under #5, not a provider exactly-once guarantee or a newly selected infrastructure design. |
| Privacy/DPA, payload minimization, deletion and actual chosen data location before real customer data | Approval gate, not a synthetic-development region blocker. US/EU are available on all plans; keys are region-bound. The 30-day inbox statement is not proof of backup purge or legal compliance for Cadence. [S9] |

**Known constraints, not current disqualifiers:** 30-day Free history, five workflows, only two environments, 10,000 included runs, branding, finite idempotency cache, and support-dependent idempotency enablement. Nothing here resolves [#6](https://github.com/jasonumiker/cohort-005-project/issues/6). No additional ticket is necessary to record these facts: provider selection and the existing [integration contract #5](https://github.com/jasonumiker/cohort-005-project/issues/5) own the remaining decisions/checks.

## Primary-source register

Every link below was accessed **2026-11-12**. “Documented” above means published by Novu, not executed or contractually verified for an account.

- **S1:** [Pricing](https://www.novu.co/pricing/) — plan cards, explicitly labelled HTML comparison cells, Free component checkmarks, and embedded FAQ JSON-LD (including overage conflict).
- **S2:** [Limits](https://docs.novu.co/platform/developer/limits.md) — explicit plan-labelled workflows, environments, steps and Inbox/Activity retention.
- **S3:** [Billing](https://docs.novu.co/platform/account/billing.md) — organization-wide metering, Free/trial stops, paid overages and pause-at-limit.
- **S4:** [Prepare Inbox for Production](https://docs.novu.co/platform/inbox/prepare-for-production.md) — opt-in HMAC, server signatures, missing-hash behavior, and explicitly paid branding removal.
- **S5:** [Trigger event API](https://docs.novu.co/api-reference/events/trigger-event.md) — 100-recipient limit, API-layer deduplication versus transaction ID, support enablement caveat.
- **S6:** [Idempotency](https://docs.novu.co/api-reference/idempotency.md) — organization enablement via support, API-key requirement, TTLs and response semantics.
- **S7:** [Trigger concepts](https://docs.novu.co/platform/concepts/trigger.md) — queue/notification lifecycle, per-recipient fanout metering, filter/digest billing.
- **S8:** [Environments](https://docs.novu.co/platform/developer/environments.md) — Dev/Prod separation, environment-specific integrations/credentials, publishing and custom-environment gates.
- **S9:** [Security and Compliance](https://docs.novu.co/platform/additional-resources/security.md) — explicit Inbox Messages retention table, regional availability and region-bound keys, deletion support route.
- **S10:** [Rate limiting](https://docs.novu.co/api-reference/rate-limiting.md) — plan RPS, standard/bulk token cost, retry headers.
- **S11:** [Delivery retry policy](https://docs.novu.co/platform/developer/delivery-retries.md) — in-app storage/WebSocket distinction from external provider sends.
- **S12:** [React quickstart](https://docs.novu.co/platform/quickstart/react.md) — React/React Router setup example, not Cadence SSR validation.
