# [R1-A-02] Trip Window Edit Flow

- **Product Area:** Area A (Trip Management)
- **User Story:** R1-A-02
- **Functional Requirement:** FR-3
- **Status:** 🟡 Pending Implementation

## User Story
As a Trip Planner, I want to edit the Trip Window after creation, in case our travel dates change.

## Acceptance Criteria
- [ ] Backend supports `PATCH /trips/:id` (or `PUT /trips/:id`) accepting `name`, `start_date`, and `end_date`.
- [ ] Validation ensures `end_date >= start_date`.
- [ ] Frontend trip settings or header provides an edit modal/form to modify trip dates.
- [ ] TanStack Query invalidates trip cache upon successful update, reflecting new dates across the app.
