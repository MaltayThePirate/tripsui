# [R1-C-01 & R1-C-02] Per-Member Flights & Validation

- **Product Area:** Area C (Accommodations & Flights)
- **User Story:** R1-C-01, R1-C-02
- **Functional Requirement:** FR-3a
- **Status:** ⬜ Not Started

## User Stories
- As a Trip Planner, I can enter my own arrival and departure flight details, so I have a personal reference point when deciding on Accommodations.
- As a Trip Planner, I want a warning (not a block) if my flight dates fall outside the Trip Window, so I'm alerted to a likely mistake without losing my data.

## Acceptance Criteria
- [ ] Create `Flight` model (belonging to `Trip` and `User`/Member) with fields for arrival leg details and departure leg details (MVP: one arrival, one departure per Member; schema designed for multi-leg extension).
- [ ] Implement REST endpoints for managing member flights (`/trips/:tripId/flights` or scoped under membership).
- [ ] Frontend form for members to input flight arrival/departure dates and times.
- [ ] Warning banner displayed in the UI if flight dates fall outside the trip's `start_date` / `end_date`, without blocking save functionality.
