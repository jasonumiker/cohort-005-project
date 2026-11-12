# Hosted in-app notification services for Cadence

Research for [#3](https://github.com/jasonumiker/cohort-005-project/issues/3), supporting [Wayfinder #1](https://github.com/jasonumiker/cohort-005-project/issues/1).

**Access date for every external source below: 2026-11-12.** Prices are published dollar prices on that date, not quotations or cost forecasts; recheck currency, taxes, terms, and limits before commitment.

## Status and boundaries

This is decision input, **not a provider decision or an implementation-ready specification by itself**. Knock, Novu Cloud, and MagicBell are a deliberately small shortlist: hosted products with documented server APIs and recipient inboxes. Novu self-hosting is not the hosted alternative evaluated here. No account was created, service provisioned, credential inspected/configured, payment authorized, SDK installed, or hosted integration executed.

The destination remains a specification for persistent, recipient-specific in-app notifications, a chosen real hosted provider, a focused event/recipient scope, and an agreed throwaway UX prototype. Students, Instructors, Platform Admins, and Team Admins remain candidates. Course activity, Purchases, Team Licences, and Refund Requests are candidate event areas, not selected features. Email, SMS, browser/mobile push, marketing, production implementation, and deployment are excluded.

**Evidence language:** “Documented” means stated in the cited first-party source, not runtime-verified. “Implication” is analysis of that evidence. “Unknown” means this bounded pass did not establish the fact, not that the feature is absent. Public documentation can conflict or be stale.

## Decision-useful summary

- **All three document a genuine hosted path:** server-triggered notifications, a recipient-scoped inbox, and persistent engagement state. None requires Cadence to invent a local inbox merely to show notifications. Actual integration still needs an approved development account and secure recipient authentication. [K1–K4, N1–N3, M1–M5]
- **Knock:** documented React components and headless hooks, unlimited feed retention, unlimited development environments, and a 10,000-message monthly free allowance. Its next published tier is $250/month. Enhanced client security is off by default; enable signed-user authentication. Sent feed content is immutable. [K1–K6]
- **Novu Cloud:** documented headless React hooks, US/EU hosting, and 10,000 free workflow runs/month, but only five workflows. Its Pro tier starts at $30/month. Inbox HMAC must be enabled. API idempotency is not enabled for every organization; confirm availability. End-user inbox retention needs a clearer plan-specific verification than the pricing page's flattened comparison supplied in this pass. [N1–N6]
- **MagicBell:** a content-carrying broadcast API creates individual recipient notifications; current React components use a server-signed User JWT. Builder includes 1,000 deliveries/month and one project; Startup is $249/month. The single-project limit complicates isolated staging/production on the free tier. Region, retention, and exact send-endpoint idempotency coverage remain unverified. [M1–M8]
- **Do not compare the three “free” numbers as identical capacity.** Knock counts delivered messages, Novu counts workflow runs, and MagicBell counts deliveries. No event fan-out, traffic, acceptable retention, or budget has been chosen. None of these allowances is an approved spending cap. [K1, N1, M1]

## Cadence constraints at the inspected revision

Repository observations refer to [08ed53f3339705b0d2f2c72366be3de95d75bbac](https://github.com/jasonumiker/cohort-005-project/tree/08ed53f3339705b0d2f2c72366be3de95d75bbac), not uncommitted changes or a future implementation.

| Observed constraint and source | Integration implication, not a chosen design |
| --- | --- |
| [package.json](../../package.json): React 19.2.x, React Router 8.3.0, TypeScript, Node-oriented server packages, Tailwind 4, Radix, Sonner, Vitest; no shortlisted-provider SDK dependency. [react-router.config.ts](../../react-router.config.ts) explicitly enables SSR. | A Node server API is plausible for all three. Check the exact SDK version's React 19 peer dependencies, ESM/build behavior, browser-only imports, and hydration in this app; “React supported” is not verified React Router SSR compatibility. Do not copy Next.js-specific setup. |
| [app/routes/layout.app.tsx](../../app/routes/layout.app.tsx) loads the current user, renders the sidebar and nested outlet, and includes Sonner's `Toaster`. | There is an existing authenticated-user layout seam for an eventual inbox. Existing toasts do not provide persistent recipient history. Placement and supplied versus custom UI remain #4 decisions. |
| [app/lib/session.ts](../../app/lib/session.ts), [app/routes/api.switch-user.ts](../../app/routes/api.switch-user.ts), and [app/lib/access.server.ts](../../app/lib/access.server.ts) use a development cookie-selected numeric user ID; actions have their own access guards. | Derive provider identity on the server from the current valid user, never from a browser-supplied recipient ID. The DevUI is not production identity assurance. A hosted signature protects the provider boundary but does not upgrade the app's development login. On switching users/signing out, dispose old subscriptions and cached feed data before showing another inbox. |
| [app/db/schema.ts](../../app/db/schema.ts) has numeric user IDs and Student/Instructor/Admin roles; Team Admin is a team-membership role, not a fourth `UserRole`. [GLOSSARY.md](../../GLOSSARY.md) defines the four candidate people and Purchase/Enrollment/Seat/Refund Request distinctions. | A stable, environment-separated string mapping of the internal user ID is feasible; email need not be the identity for an in-app-only inbox. Neither provider “tenant” support nor a team label chooses recipients. Determine relevant ownership/membership server-side after #2; do not model Team Admin as every Platform Admin or vice versa. |
| [app/db/index.ts](../../app/db/index.ts) uses one local SQLite file via synchronous better-sqlite3/Drizzle. [app/lib/refunds.server.ts](../../app/lib/refunds.server.ts) performs refund decisions in database transactions. [app/routes/courses.$slug.purchase.tsx](../../app/routes/courses.$slug.purchase.tsx) contains separate purchase/enrollment mutations. | A hosted API call cannot share an atomic SQLite commit. For selected events, identify the authoritative successful transition before sending; decide how to handle the commit-to-send failure gap. This does **not** prescribe a queue/outbox or promise exactly-once delivery. |
| [app/lib/access.server.ts](../../app/lib/access.server.ts) evaluates course ownership, Enrollment and country-related access; [app/lib/refunds.server.test.ts](../../app/lib/refunds.server.test.ts) tests services against an injected in-memory database. | Notification possession is not permission to access its destination. Reauthorize links using current domain rules. A provider adapter can be faked in Vitest for recipient/payload/failure tests, but fake tests cannot establish hosted authentication, persistence, or billing behavior. |
| [README.md](../../README.md) suggests a free Knock Developer account. | That is a starting suggestion, not a decision; current published pricing calls the free plan “Free.” No existing account or keys were assumed or inspected. |

Repository links resolve to the same unchanged code on this research branch. The baseline commit above pins the observations if the branch later moves.

## Hosted integration, identity, UI, and persistent state

| Dimension | Knock | Novu Cloud | MagicBell |
| --- | --- | --- | --- |
| Actual server send | Trigger a configured workflow by key with recipients and data; authenticate backend calls using a secret API key. Recipients can be identified inline. Response contains a workflow run ID. [K2, K4] | `POST /v1/events/trigger`, API-key authenticated, with a workflow identifier, subscriber(s), and payload; returns a transaction ID. Documented maximum is 100 recipients per trigger. [N2] | `POST https://api.magicbell.com/v2/broadcasts`, authenticated using a **Project JWT**. Broadcast content and recipients generate individual notifications. “Broadcast” is the API primitive, not a requirement to notify everyone. [M2, M3, M7] |
| Backend configuration | Set up a hosted environment, in-app channel, and committed workflow/template, then identify recipients/trigger. Templates render supplied data. [K4, K7] | Configure a Cloud environment and a workflow containing an in-app step; use the matching application identifier, API key and subscriber identity. [N2, N3, N7] | Configure a project and inbox, obtain project authentication and User JWT signing credentials. Content is supplied in the broadcast call; a dashboard compose test is also documented. [M2–M4, M6] |
| Browser recipient authentication | Public key **plus RS256-signed JWT** identifying `sub`, with recommended `iat`/`exp`, when enhanced security is enabled. It is off by default: public key alone can act as any user. Explicit grants can restrict feed read/write and tenant access. [K2] | Public `applicationIdentifier` plus subscriber identity; **enable HMAC security** and generate `subscriberHash` using HMAC-SHA256 on the server. Docs explicitly warn that guessing IDs without HMAC can expose someone else's inbox. Context-aware usage additionally signs context. [N3] | Current React SDK requires a **User JWT**, signed server-side using HS256 with the project's Secret Key. Claims include `api_key` and `user_external_id` and/or email. A Project JWT is privileged and must never reach the browser. [M3–M5] |
| Isolation limitations | Signed recipient identity and optional scoped grants are documented, but sender-side recipient selection still belongs to Cadence. A public-key-only demo is not evidence of isolation. [K2, K4] | HMAC authenticates subscriber identity; context authentication is separately documented. Neither a client-side feed filter nor an unsigned team/context identifier establishes domain authorization. Token/session revocation behavior needs validation. [N3] | User JWT and user-scoped API authentication are documented. Exact token scope/revocation and team-context filtering were not established here. Use explicit recipient selection rather than assume broadcasts isolate an audience automatically. [M3, M7] |
| Supplied versus custom React UI | `@knocklabs/react`: feed, popover and icon button; headless hooks and lower-level JS client are documented. [K3] | `@novu/react`: Inbox plus headless `useNotifications`, `useCounts`, and client actions; pagination and real-time updates are documented. [N4] | `@magicbell/react`: embedded `Inbox`, `FloatingInbox`, item/button/inbox overrides and click interception. Current provider also exposes a `toasts` option, default true; decide whether to disable it rather than accidentally duplicate Sonner behavior. Headless parity was not verified. [M5] |
| SSR fit | Unknown in this exact React Router 8/React 19 app; no SDK build or hydration test performed. | The Next.js example uses a client component, which is not proof of compatibility with this SSR app. Use React integration evidence, not an assumed Next.js adapter. [N7] | Current React documentation does not establish this app's server-render/import behavior. |
| Persistent feed and state | Per-user feed, reverse chronological items, read/seen/unread counts, archived filtering and status updates/unmarking. Content/metadata cannot be edited after sending; docs suggest archive and retrigger. Docs also mention priority sorting but the FAQ says order cannot change: validate if custom ordering becomes a requirement. [K2, K5] | Recipient notifications and read/unread/archive actions; counts and paginated headless feed are documented. Exact UX semantics (when “read” occurs, dismiss versus archive) remain product decisions. [N4] | Recipient notifications track read/seen/archived state and timestamps. React Inbox supports pagination/read-unread; OpenAPI exposes feed/status operations. [M5, M7, M8] |

**Cross-provider implication:** a signed feed identity does not recall sensitive text already delivered when a role, Enrollment, country, or team membership changes. Decide payload minimization, visibility on subsequent visits, and any archive/deletion policy in #5. Do not send full Refund Request reasons, course content, personal data, or monetary details merely because a provider accepts arbitrary JSON.

## Published development plans and billing

All figures below are **documented**, not negotiated, runtime-tested, or assumed sufficient. Overage behavior must be confirmed before approved usage; do not treat “free” as a guaranteed hard stop.

| Item | Knock [K1] | Novu Cloud [N1] | MagicBell [M1] |
| --- | --- | --- | --- |
| Free plan | Free: $0/month, 10,000 messages/month; no credit card required | Free: $0/month, 10,000 workflow runs/month; no credit card required | Builder: $0/month, 1,000 deliveries/month; credit-card requirement not established |
| Relevant configuration limits | Unlimited workflows, stored profiles, in-app feeds, team members, isolated environments | 5 workflows, 2 environments, 3 team members | 1 project, unlimited users/team members |
| Next paid tier | Starter: $250/month, 50,000 messages, then $0.005/message | Pro: from $30/month, 30,000 runs; comparison lists $1.20/additional 1,000 runs and 20 workflows | Startup: $249/month, 50,000 deliveries, then $0.0025/delivery; 5 projects, $99/additional project |
| Meter | One delivered message to one user on one channel; failed/bounced messages excluded. Trigger calls alone are not billed as messages. | Workflow runs, not delivered-message count. Confirm fan-out, skipped/failed executions and current billing rules for the chosen workflow shape before forecasting. | One delivery per user per channel; a targeted in-app delivery to each of 100 people counts as 100, not one broadcast. |
| Free/overage caveat | FAQ says messages are not hard-capped and provider will contact a free customer over the limit about billing next month. | Do not assume a hard free cap; verify current overage policy and organization controls. Visible plan names and some FAQ text have differed (“Team”/“Business”). | FAQ says deliveries beyond included limits are charged per use; the Builder-specific charging/stop behavior needs confirmation before use. |
| Branding | Removing Knock branding is paid. Verify actual free inbox rendering. | Removing Novu branding is paid. | Free inbox branding constraints not established. |
| Development separation | Unlimited isolated environments documented | Dev + Prod fit within the two-environment Free limit | Docs recommend separate staging/production projects, but Builder includes only one: either dedicate it to synthetic development or explicitly approve a different arrangement. [M6] |

**Capacity interpretation:** #2's selected events determine recipients per event; #4 determines any batching/digest behavior. Those choices can change both workflow count and billed usage. No expected monthly cost or “cheapest” conclusion is defensible yet. Five Novu workflows, for example, is a concrete constraint to revisit, not evidence that five event types have been chosen.

## Failure handling, retries, and deduplication

These are API guarantees within documented windows, **not end-to-end exactly-once processing of a Cadence domain event**.

| Provider | Documented support | Limit or unverified point |
| --- | --- | --- |
| Knock | `Idempotency-Key` on the workflow trigger only, at most 255 characters; identical retries within 24 hours replay the successful response. Changed parameters error; only 2xx responses are cached. Cancellation keys and workflow test tooling exist. [K4, K7, K8] | Sending the header elsewhere has no effect. It does not cover missed sends before the API call, retries after 24 hours, or a separately recreated domain event. Internal in-app delivery retry schedule and durable terminal-failure recovery were not established. |
| Novu Cloud | API-key-authenticated idempotency applies before queuing: one processed trigger/one billed run; duplicates in progress get 409/`Retry-After`, later retries get the cached response. Success **and error** response caches last 24 hours; in-progress cache is 5 minutes. `transactionId` is separately checked during processing and is not equivalent billing/deduplication protection. [N2, N5] | Docs say idempotency is **not enabled for all organizations**, so availability on an approved free account is a gating check. Do not assume a new key is a safe workaround for a cached failure. Internal in-app retry/terminal-failure behavior still needs verification. |
| MagicBell | Some endpoints support `Idempotency-Key`; the first status/body is cached for 24 hours. REST limit is 500 requests/minute per IP; a 429 block clears after 60 seconds. [M2] | The idempotency section uses a broadcast example but does not explicitly enumerate covered endpoints; confirm `POST /v2/broadcasts` before relying on it. Internal retries, SDK auto-retry defaults and failure recovery were not established. |

Novu publishes 60 trigger RPS on Free, 240 on Pro and 600 on Team; bulk calls cost 100 request tokens. These differ from monthly billing units. [N6] None of these documented rates establishes Cadence's needed capacity. For Knock, recheck the selected endpoint's limit rather than assume all endpoints share one.

**Contract questions for #5:** define a stable event/recipient retry key and its lifetime; decide whether a failed notification blocks the business operation; define bounded timeout/backoff and observable failure behavior; and choose proportionate handling of a committed database change whose send never happens. A provider idempotency header is not a reason to require infrastructure by default, nor permission to send before commit. Acceptance of an asynchronous trigger is not proof an inbox item was delivered.

## Data location, retention, and deletion

| Provider | Established evidence | Remaining gap |
| --- | --- | --- |
| Knock | In-app feed items are available indefinitely, including status updates after associated message logs expire. Logs generally retain 30 days on non-Enterprise and 90 days on Enterprise; API logs retain 30 days. [K6] | Region/residency was not established. Pricing says feed retention is unlimited and configurable [K1], while the retention doc says custom retention windows are not supported [K6]. Do not promise configurable deletion without clarifying this apparent difference. Recipient deletion, export, backup purge and retention obligations remain to verify if required. |
| Novu Cloud | Pricing publishes US/EU residency for all plans and additional Enterprise regions. EU clients must use the matching API/socket endpoints. Activity/observability retention is 24 hours Free, 7 days Pro, 90 days Team. [N1, N3] | **Activity Feed is not the end-user inbox.** Pricing separately lists “Inbox feed retention”; fetched comparison text suggests 30 days Free and 90 days paid, but column alignment was not reliable enough to certify that mapping. Verify exact inbox retention before treating persistence duration as a fit. Deletion/export/backup treatment not established. |
| MagicBell | Notifications have per-recipient interaction timestamps and state. [M8] | Published notification retention, regional hosting/residency, deletion/export and backup purge were not established from the reviewed pages. Do not infer indefinite persistence from the presence of a feed API. |

No residency, compliance certification, retention duration, or right-to-delete requirement has been invented for Cadence. These are explicit inputs to the later provider/contract discussion, especially if selected payloads contain financial or personal information. Vendor privacy/DPA review and any unacceptable data-transfer constraints remain before real data is sent.

## Development and testability: what can be trusted now

**Documented tooling:** Knock has environment separation and a workflow test runner, including sandbox/skip-delay settings usable via API. The dashboard runner uses the last **saved** workflow and bypasses trigger-frequency rules, while API sends use the last **committed** workflow: a dashboard pass is not equivalent to a production-like trigger test. Sandbox preview is not proof of a persisted recipient inbox. [K7] Novu's Cloud environments and Activity Feed/transaction tracing provide development separation and diagnostics. [N1, N2] MagicBell documents dashboard broadcast testing, Events diagnostics and separate staging/production projects. [M6]

**Not performed:** account setup, SDK installation, React 19/SSR rendering, signed cross-recipient denial tests, reconnect/multi-tab behavior, API retries, billing-meter tests, or retention/deletion experiments. No provider-hosted test was attempted without approval. Local/CI mocks were not established as equivalent to a real hosted sandbox for any provider.

**Suggested evidence checklist for an approved later spike, not new requirements or authorization to provision:**

1. Use synthetic recipients A and B in an isolated development environment/project. Trigger exactly one selected-event-shaped in-app notification server-side. Inspect the returned run/broadcast ID and verify the intended persistent recipient feed after reload.
2. Verify A cannot list, read, mark, or archive B's notification; check no-signature and wrong-signature rejection. Exercise sign-out, DevUI user switching, multiple tabs and token expiry/rotation. Novu HMAC is not an expiring JWT; settle revocation expectations rather than assume equal token lifetimes. MagicBell's sample one-year token expiry is an example, not Cadence policy. [N3, M4]
3. Use the actual React Router build/server-render/hydration path and React 19, with no private key in browser code or loader output. Compare supplied versus headless/custom rendering, accessible keyboard/focus behavior, narrow-screen layout, theme and loading/empty/error states against #4's prototype.
4. Retry the identical trigger under a stable key; examine the resulting feed and meter. Explicitly verify Novu entitlement and MagicBell send-endpoint coverage. Simulate timeout-after-acceptance, 429/5xx and reconnect; test eventual failure handling without triggering real customer events.
5. Verify read/unread/archive semantics across reloads/tabs; test stale destinations and current access denial after role/team/Enrollment changes. Confirm inbox retention separately from dashboard logs, and document deletion behavior.
6. With developer-approved credentials only, keep real-hosted checks opt-in and separate from deterministic Vitest adapter tests. Use current SDK peer dependencies and `npm run typecheck` then `npm run test` for a later app change. Do not add a remote dependency to normal CI merely to prove this research.

## Explicit remaining decisions and event-dependent rechecks

Canonical decisions remain in their tickets; this note does not resolve them:

| Ticket | What this research contributes / what remains |
| --- | --- |
| [#2: first-release events and recipients](https://github.com/jasonumiker/cohort-005-project/issues/2) | Select events, authoritative transitions and recipients, including any actor suppression or role overlap. Then recheck workflow limits, fan-out and burst limits, recipient mapping and needed payloads. Do not use any candidate event area as an approved send. |
| [#6: provider choice](https://github.com/jasonumiker/cohort-005-project/issues/6) | Compare the documented trade-offs against #2, acceptable price/usage, UI freedom and data constraints. Resolve only material evidence gaps for the contender(s): especially Novu inbox retention/idempotency and MagicBell retention/region/send idempotency; Knock region/configurable retention if needed. No winner is selected here. |
| [#4: in-app experience](https://github.com/jasonumiker/cohort-005-project/issues/4) | Agree the throwaway prototype and semantics for read/unread, dismissal/archive and action behavior. Recheck custom ordering, sent-content updates, stale items, batching, supplied UI branding and accessibility only if those become needed capabilities. |
| [#5: integration contract and acceptance](https://github.com/jasonumiker/cohort-005-project/issues/5) | Decide identity/access boundaries, transaction timing, state ownership, acceptable failure/duplicate behavior, minimal payload and retention, changed destination access and approved hosted validation. Assess an outbox/queue only if the agreed reliability warrants it. |

No new fog ticket is justified by this pass: the concrete unknowns are already covered by the provider-selection and integration-contract questions. No human decision is resolved, and no existing map fog should be marked complete.

## Primary-source register

All links accessed **2026-11-12**, without authentication. Short identifiers above cite these sources; a reference supports only the relevant documented claim, not every inference in its row.

### Knock

- **K1:** [Pricing and FAQ](https://knock.app/pricing) — allowances, billing unit, branding, environments, published retention comparison and overage handling.
- **K2:** [Security and authentication](https://docs.knock.app/in-app-ui/security-and-authentication) — server/public keys, enhanced-security default, RS256 JWTs, grants and tenant scoping.
- **K3:** [React overview](https://docs.knock.app/in-app-ui/react/overview) — current React SDK, supplied components and headless hooks.
- **K4:** [Triggering workflows via API](https://docs.knock.app/send-notifications/triggering-workflows/api) — configured workflow keys, recipients/inline identity, data, cancellation and response IDs.
- **K5:** [Feeds overview and FAQ](https://docs.knock.app/in-app-ui/feeds/overview) — persistent per-recipient feed/state, real-time service, immutable content and ordering caveats.
- **K6:** [Data retention](https://docs.knock.app/manage-your-account/data-retention.md) — indefinite in-app items versus expiring logs and warning about custom retention.
- **K7:** [Testing workflows](https://docs.knock.app/send-notifications/testing-workflows.md) — test runner, sandbox, skip delays, trigger-frequency bypass and saved/committed distinction.
- **K8:** [Idempotent requests](https://docs.knock.app/api-reference/overview/idempotent-requests.md) — trigger-only scope, 24-hour window and successful-response caching.

### Novu Cloud

- **N1:** [Pricing and comparison](https://www.novu.co/pricing/) — hosted Free/Pro/Team plans, billing runs, workflows/environments, regions and distinct activity/inbox retention rows. Some table alignment and FAQ naming remain uncertain.
- **N2:** [Trigger event API](https://docs.novu.co/api-reference/events/trigger-event.md) — Cloud URLs, API-key auth, recipient cap, transaction IDs and idempotency/billing distinction.
- **N3:** [Prepare Inbox for production](https://docs.novu.co/platform/inbox/prepare-for-production.md) — HMAC opt-in, subscriber/context signatures, environment/region configuration and branding.
- **N4:** [Headless mode](https://docs.novu.co/platform/inbox/headless-mode.md) — React hooks, notification/count state, pagination and read/archive actions.
- **N5:** [Idempotency](https://docs.novu.co/api-reference/idempotency.md) — organization-enablement caveat, API-key requirement, TTLs and duplicate/error responses.
- **N6:** [Rate limiting](https://docs.novu.co/api-reference/rate-limiting.md) — plan/category limits, request-token costs and retry headers.
- **N7:** [Next.js quickstart](https://docs.novu.co/platform/quickstart/nextjs.md) — documented client-component example, not verification of Cadence's framework.

### MagicBell

- **M1:** [Pricing and FAQ](https://www.magicbell.com/pricing) — Builder/Startup allowances, project limits, delivery counting and overage charging.
- **M2:** [REST API v2](https://www.magicbell.com/docs/api) — hosted base URL, errors, per-IP rate limit and limited-endpoint idempotency.
- **M3:** [Project JWT](https://www.magicbell.com/docs/api/authentication/project) — privileged server-side token, dashboard creation and revocation.
- **M4:** [User JWT](https://www.magicbell.com/docs/api/authentication/user) — recipient claims, HS256 server signing and example expiration.
- **M5:** [Current React components](https://www.magicbell.com/docs/libraries/magicbell-react) — User JWT requirement, provider, inbox customization, pagination, read/unread and default toasts.
- **M6:** [Quick start](https://www.magicbell.com/docs/quick-start) — automatic user creation, dashboard/API testing, diagnostics and staging/production project guidance.
- **M7:** [Official OpenAPI v2](https://www.magicbell.com/docs/api/openapi.json) — hosted server, project-authenticated broadcasts and user-authenticated notification/state API.
- **M8:** [Notification primitive](https://www.magicbell.com/docs/primitive/notification) — individual recipient model, state and interaction timestamps.
