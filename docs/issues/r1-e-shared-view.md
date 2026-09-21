# [R1-E-03 & R1-E-04] Derived Shared View Endpoint & UI

- **Product Area:** Area E (Day Plans & Shared View)
- **User Story:** R1-E-03, R1-E-04
- **Functional Requirement:** FR-6
- **Status:** ⬜ Not Started

## User Stories
- As a Traveler, I can view a read-only Shared View of all Members' planned Spots for a given date, tagged with who planned each one, sorted by lowest contributing Rank then alphabetically.
- As a Traveler, I can narrow the Shared View down to a subset of Members (including just myself), so I can see a specific person's or smaller group's plan without noise from everyone else.

## Acceptance Criteria
- [ ] Implement read-only Shared View API endpoint `/trips/:tripId/day-plans/shared-view/:date` (no independent storage).
- [ ] Server-side query aggregates selected members' day plans for the date, deduplicates spots, tags contributing members, and sorts by lowest contributing rank then spot name.
- [ ] Support member filtering query parameter (`?members=id1,id2`).
- [ ] Frontend Shared View UI displaying aggregated spots and member contributor tags.
