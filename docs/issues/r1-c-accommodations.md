# [R1-C-03 to R1-C-05] Accommodations & Active Accommodation Selection

- **Product Area:** Area C (Accommodations & Flights)
- **User Story:** R1-C-03, R1-C-04, R1-C-05
- **Functional Requirement:** FR-4
- **Status:** ⬜ Not Started

## User Stories
- As a Trip Planner, I can add one or more Accommodations with their own date ranges, so the group knows where we're staying and when.
- As a Trip Planner, I want a warning (not a block) if a new Accommodation's dates overlap an existing one, so double-bookings or planning changes aren't silently hidden.
- As a Trip Planner, when two Accommodations overlap on the same date, I can manually pick which one is "active" for that date's map distance calculations.

## Acceptance Criteria
- [ ] Create `Accommodation` model (`trip_id`, `name`, `address`, `start_date`, `end_date`, `active` or per-date active designation).
- [ ] REST API endpoints for CRUD on Accommodations (`/trips/:tripId/accommodations`).
- [ ] Backend/frontend overlap detection triggering a non-blocking warning when date ranges intersect.
- [ ] UI mechanism to designate an "Active Accommodation" on dates with overlapping accommodations.
