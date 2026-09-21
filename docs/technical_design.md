# Technical Design / Functional Specification: Trip Planner
 
**Status:** Draft v1
**Companion to:** `trip-planner-prd.md`
**Last updated:** derived from Shared View redesign session
 
---
 
## 1. Purpose
 
This document translates the Product Requirements Document into a concrete technical architecture: chosen platforms, languages, services, and the reasoning behind each. It is the implementation-facing counterpart to the PRD — where the PRD defines *what* the product does, this defines *how* it will be built.
 
---
 
## 2. Architecture at a Glance
 
| Layer | Decision |
|---|---|
| Client platform | Web application (primary), used by both Trip Planners (desktop-first) and Travelers (mobile browser) |
| Frontend framework | React with Next.js |
| Frontend data layer | TanStack Query (React Query) |
| Backend language/framework | Go |
| API style | REST |
| Database | PostgreSQL with PostGIS enabled |
| Authentication | OAuth (Google, and Apple as a secondary provider) |
| Trip collaboration model | Invite link |
| Live-sync model | Polling (10–30s interval) |
| Geocoding | Google Geocoding API (Google Maps links) + Apple MapKit/Maps server APIs (Apple Maps links) |
| Map rendering | Google Maps JavaScript SDK |
| Hosting | Render (all-in-one: frontend, API, and managed Postgres) |
| Repo structure | Monorepo |
| CI/CD | GitHub Actions (test/lint on PR) + Render native auto-deploy-on-push to `main` |
 
---
 
## 3. Client Platform
 
**Decision:** Web application is the primary and only planned client for MVP.
 
**Reasoning:** The PRD's two roles — Trip Planner and Traveler (Section 2) — map cleanly onto two different device contexts rather than two different apps. Trip Planners do the heavy-lift planning work (adding Spots, building Day Plans) primarily on a desktop browser pre-trip. Travelers consume plans in the field, primarily on a phone browser. A single responsive web app serves both without the cost of building and maintaining native or cross-platform mobile apps at this stage.
 
A native mobile app remains an option for a future phase if usage patterns justify it, but nothing in the MVP architecture should preclude that path later (see Section 10, Forward Compatibility).
 
### 3.1 Offline Handling (FR-8)
 
**Decision:** The web app is online-only. There is no in-app offline cache, service worker, or PWA layer for MVP.
 
**Reasoning:** FR-8 (Offline Day Plan Viewing) is satisfied indirectly through FR-9 (Shared Itinerary Message Export). A Member copies a formatted, text-based Day Plan to their clipboard while online, and pastes it into any app of their choosing (Notes, Messages, email draft) for later offline reference. This avoids the real engineering cost of a service-worker-based offline cache (cache invalidation, storage quotas, sync-on-reconnect logic) while still meeting the underlying user need: being able to see your plan with no signal.
 
**Trade-off accepted:** The Traveler must remember to export before losing connectivity; there's no automatic background caching safety net. This is a reasonable MVP trade-off given the product's flexible, low-pressure planning philosophy.
 
---
 
## 3.2 Day Plan Spot Ordering (FR-6)
 
**Decision:** Day Plan Spot lists support free click-and-drag reordering, rather than a fixed order-added sequence or step-based (up/down) reordering. This applies uniformly to every Member's own Day Plan. There is no separate "Shared" list to reorder — Shared View is a read-only derived aggregate, not an independently editable list (see Section 5.1a).
 
**Reasoning:** Ordering within a Day Plan was originally an open item deferred out of MVP (see Section 13). It has since been pulled into MVP scope. Drag-and-drop was chosen over up/down controls as the more natural interaction for freely resequencing a short, unordered list of Spots.
 
**Storage — Rank, not array position:** Order is persisted as a **Rank** value on each Day Plan↔Spot association, rather than an implicit array index or a renumbered sequence position. This is the standard pattern for user-reorderable lists backed by a relational table (comparable to Jira/Trello-style "lexo-rank" schemes): on drop, a Spot's new Rank is set to a value between its two new neighbors' Ranks, so a single reorder touches only the row being moved — the rest of the list's Rank values don't need to shift. This also makes it possible for the Shared View (Section 5.1a) to sort a merged, multi-Member list (by lowest contributing Rank, then alphabetically — PRD Section 3) without re-fetching or re-indexing every contributing Member's full Day Plan on every read.
 
**Rank key format — not yet chosen:** Whether Rank is a float (simple, but degrades in precision after many reorders between the same two neighbors — needs periodic rebalancing) or a sortable string key (e.g., fractional/lexicographic indexing, avoids the float precision issue but is slightly more complex to implement) is an open implementation detail — see Section 13.
 
**Mobile consideration — needs a production-build decision:** The current mockup implements reordering with the browser's native HTML5 drag-and-drop API (`draggable`, `dragstart`/`dragover`/`drop`). This works reliably with desktop pointer input but is known to be unreliable on touch-only mobile browsers. Since Section 3 identifies Travelers as primarily using this app on mobile browsers in the field, native HTML5 drag-and-drop is not expected to be sufficient for the real implementation — a touch-friendly drag library (e.g. `@dnd-kit`) should be evaluated before this ships.
 
---
 
## 4. Frontend
 
**Decision:** React with Next.js.
 
**Reasoning:** Largest ecosystem and hiring pool of the major frontend frameworks, mature support for the Google Maps JS SDK integration the Map View (FR-5) requires, and Next.js provides a sensible default project structure (routing, API route conventions, SSR/SSG options) without needing to hand-assemble tooling.
 
### 4.1 Data Fetching & Polling
 
**Decision:** TanStack Query (React Query).
 
**Reasoning:** Given the polling-based sync model (Section 6), TanStack Query's `refetchInterval` handles the 10–30s refresh cycle natively. It also provides request deduplication, background refetch-on-window-focus (useful when a Trip Planner returns to a backgrounded tab), and a query invalidation model that keeps related resources (Spots, Categories, Day Plans, Accommodations) consistent after a mutation — without hand-building any of this.
 
---
 
## 5. Backend
 
**Decision:** Go, exposing a REST API.
 
**Reasoning:**
- Go was chosen for performance, simplicity, and strong concurrency primitives with minimal boilerplate.
- REST was chosen over GraphQL because: Go's REST tooling is more mature than its GraphQL tooling; the polling-based sync model just needs plain resource GETs, not flexible nested querying; and the data model (Trip → Spots, Trip → Day Plans, etc.) is mostly straightforward resource hierarchies rather than deeply nested graphs a frontend would need to shape per-view. GraphQL's core benefit — avoiding over/under-fetching on complex queries — doesn't offset its setup and operational cost here.
### 5.1 Suggested Resource Shape (illustrative, not final)
 
```
/trips/:tripId
/trips/:tripId/members
/trips/:tripId/spots
/trips/:tripId/categories
/trips/:tripId/accommodations
/trips/:tripId/flights (per-Member, may need member scoping: /trips/:tripId/members/:memberId/flights)
/trips/:tripId/day-plans/:memberId/:date
/trips/:tripId/day-plans/shared-view/:date
```
 
This should be refined during API design, but reflects the entity relationships in the PRD's Section 5 data model.
 
#### 5.1a Shared View endpoint
 
`/trips/:tripId/day-plans/shared-view/:date` is **read-only** — there is nothing to `POST`/`PUT` to it directly, since Shared View has no independent storage (PRD Section 5). It resolves server-side as a query across the selected Members' individual `/day-plans/:memberId/:date` rows for that date, merged, deduplicated by Spot, tagged with contributing Member(s), and sorted by lowest contributing Rank then Spot name. Member subset selection is a query parameter (e.g. `?members=memberId1,memberId2`), defaulting to all Members on the Trip when omitted. A single Member's own `/day-plans/:memberId/:date` resource remains the only writable Day Plan endpoint — there is no longer a separate writable "shared" Day Plan resource.
 
---
 
## 6. Real-Time Collaboration Model
 
**Decision:** Polling, at a 10–30 second interval, rather than WebSockets.
 
**Reasoning:** WebSockets were initially considered (enabling instant propagation of another Member's changes) but rejected as disproportionately complex for an MVP — a self-managed WebSocket layer requires connection management plus a pub/sub mechanism (Redis or Postgres LISTEN/NOTIFY) for fan-out if the API ever runs more than one instance, or alternatively a paid managed real-time vendor. Given the product's explicit philosophy of flexible, improvised, low-pressure planning (Section 1 of the PRD) rather than tightly synced live editing, near-real-time polling delivers sufficient perceived freshness at a fraction of the engineering cost. This can be revisited post-MVP if usage patterns show a real need for instant propagation.
 
---
 
## 7. Data Storage
 
**Decision:** PostgreSQL, with the PostGIS extension enabled from day one.
 
**Reasoning:** The data model (PRD Section 5) is fundamentally relational — many-to-many relationships (Spot↔Category, Day Plan↔Spot), foreign keys, and date-range logic (Accommodations, Trip Window) — which favors a relational database over a document store. PostGIS was enabled immediately rather than deferred: it's a free, license-cost-free extension, so there's no cost trade-off to enabling it now, and it future-proofs any proximity-based querying (e.g., a future "spots near this Accommodation" feature) without requiring a later migration. Map View (FR-5) itself remains purely visual/manual in MVP and doesn't require PostGIS querying yet — this is a forward-compatibility investment, not an MVP requirement.
 
**Day Plan table shape (illustrative):** with the per-Member model, `day_plans` no longer needs a discriminator column for "is this the shared row" — every row is uniquely keyed on `(trip_id, member_id, date)`. The `day_plan_spots` join table carries the `rank` column discussed in Section 3.2.
 
---
 
## 8. Authentication & Trip Collaboration
 
**Decision:** OAuth via Google (with Apple as a secondary provider); Members join a Trip via invite link.
 
**Reasoning:** OAuth avoids building and securing password storage/reset flows, and is the fastest path to a working auth system. Google is the primary provider given likely user overlap with Google Maps link usage (FR-1); Apple is included as a secondary option for users who prefer it. Invite links keep the onboarding flow for a new Trip Member frictionless — a Trip Planner shares one link, and anyone with it can join (optionally after authenticating), which matches the collaborative, informal nature of group trip planning.
 
---
 
## 9. Geocoding & Maps
 
### 9.1 Geocoding (FR-1)
 
**Decision:** Google Geocoding API for Google Maps links; Apple's MapKit/Maps server APIs for Apple Maps links — each provider handles its own native link format rather than routing everything through one vendor.
 
**Reasoning:** Apple Maps links don't reliably expose coordinates in a form Google's Geocoding API can resolve without an intermediate step, so using each vendor natively for its own link type is more reliable than forcing both through a single API.
 
### 9.2 Map Rendering (FR-5)
 
**Decision:** Google Maps JavaScript SDK.
 
**Reasoning:** Consistency with the already-integrated Google Geocoding API, and a mature React ecosystem for embedding it. This renders pins for Spots regardless of whether they originated from a Google or Apple Maps link — the origin only matters for the geocoding step, not for later display.
 
### 9.3 Google Maps Export (FR-7) — Pulled from MVP
 
**Decision:** FR-7 is removed from MVP scope and moved to the backlog.
 
**Reasoning:** The original intent was closer to "add these Spots to a Google Maps Saved List" — but there is no public Google Maps Platform API for programmatically creating or writing to a Saved List; this is a consumer-account-only feature with no corresponding write endpoint. This is a known, long-standing gap: see Google Issue Tracker [#453378725](https://issuetracker.google.com/issues/453378725), "API Feature Request: Bulk Save to Google Maps Lists," reportedly picked up by Google as of April 2026 but not confirmed resolved as of this writing.
 
**Backlog action item:** Before scoping FR-7 for a post-MVP release, re-check the status of issue #453378725. If resolved, a native Saved-List integration may be possible and would likely be preferable to either deep-link workaround (multi-destination route link with a waypoint limit, or individual per-Spot links) originally considered.
 
---
 
## 10. Shared Itinerary Message Export (FR-9)
 
**Decision:** Copy-to-clipboard only.
 
**Reasoning:** Simplest possible mechanism, universally supported across browsers with no platform-specific API dependency (ruling out the Web Share API's inconsistent support) and no need to stand up shareable public read-only links for non-Members. A Member copies the formatted text (Spot name, address, Category per entry) and pastes it wherever they choose.
 
**Design note carried forward:** Since FR-8's offline need is now fully dependent on this export, the export UI should make clear to the Member that they need to actually paste the copied text somewhere persistent (a note, a draft message) *before* losing connectivity — this is a UX consideration for the export screen, not an engineering one.
 
---
 
## 11. Hosting & Infrastructure
 
**Decision:** Render, hosting the Next.js frontend, Go API, and managed PostgreSQL (with PostGIS) together under a single dashboard.
 
**Reasoning:** Balances "cheap and easy to scale" against reliability. Render offers a genuine free tier, flat and predictable per-service pricing as usage grows, and is generally regarded as the more production-stable of the two leading budget PaaS options (the alternative, Railway, has a documented pattern of outages and platform instability through 2026, and disabled its CDN in May 2026). An all-in-one dashboard was preferred over a best-of-breed split (e.g., Vercel + Neon/Supabase + a separate API host) to minimize the number of vendor dashboards/bills the team manages at this stage, at the cost of not using the single most Next.js-optimized host (Vercel) for the frontend specifically.
 
---
 
## 12. Repository Structure & CI/CD
 
**Decision:** Monorepo (Next.js frontend + Go API in one repository); GitHub Actions for test/lint on pull requests, with Render's native git-push auto-deploy handling actual deployment to `main`.
 
**Reasoning:** With a small team and an API contract still actively evolving (see open items in Section 13), a monorepo avoids the coordination overhead of two-PR/two-repo changes every time a Spot or Day Plan field changes on both frontend and backend. Render supports monorepos natively by pointing each service at a subdirectory. CI is kept intentionally lightweight — a quality gate before merge — rather than duplicating deploy logic that Render already handles.
 
---
 
## 13. Open Items Carried Forward
 
From the PRD (Section 7) and this design session, still unresolved:
 
- ~~**Spot ordering** within lists~~ — resolved: persisted as **Rank** per Day Plan↔Spot association (Section 3.2); Shared View sorts by lowest contributing Rank, then alphabetically by Spot name (PRD Section 3, Shared View definition).
- **Rank key format** — float vs. sortable string (fractional/lexicographic) key not yet chosen; floats are simpler but need periodic rebalancing after many reorders between the same two neighbors (Section 3.2).
- **Member permissions** around deleting another Member's Spot from the merged view (PRD Section 7).
- **Notification/sync UX** — polling covers data freshness, but no decision yet on whether Members see any indicator that something changed (vs. silent refresh).
- **FR-7 (Google Maps Export)** — backlogged; contingent on Google Issue Tracker #453378725.
- **API resource design** — the shape in Section 5.1 is illustrative and needs a dedicated design pass, especially around Flight scoping (per-Member) and Shared View query-parameter conventions (Section 5.1a).
---
 
## 14. Forward Compatibility Notes
 
- PostGIS is enabled now specifically so proximity-based features (e.g., "Spots near my Active Accommodation") can be added later without a database migration.
- The Flight data model (per PRD FR-3a) is designed for multi-leg extension; this technical design doesn't change that — it remains a backend schema concern independent of the infra choices above.
- Nothing in this architecture (web-first, REST, polling) blocks a future native mobile app or a move to WebSockets if real-time needs grow — both would be additive, not replacements, to what's decided here.