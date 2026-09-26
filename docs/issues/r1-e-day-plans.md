# [R1-E-01 & R1-E-02] Day Plan Assignment & Drag-and-Drop Ranking

- **Product Area:** Area E (Day Plans & Shared View)
- **User Story:** R1-E-01, R1-E-02
- **Functional Requirement:** FR-6
- **Status:** ✅ Implemented

## User Stories
- As a Trip Planner, I can assign any Spot from the master list to my own Day Plan for a specific date, so I can build out a day's rough plan.
- As a Trip Planner, I can freely drag and reorder Spots within my own Day Plan, persisted as a Rank value, since the order I want to visit them in isn't fixed when I add them.

## Acceptance Criteria
- [ ] Create `DayPlan` model (keyed uniquely on `trip_id`, `user_id`, `date`) and `DayPlanSpot` join model carrying a `rank` value.
- [ ] REST API endpoints for managing member day plans and spot assignments/ranking (`/trips/:tripId/day-plans/:memberId/:date`).
- [ ] Evaluate and integrate touch-friendly drag-and-drop library (`@dnd-kit`) in `tripsui`.
- [ ] Persist new rank on drop without shifting entire list sequences.
