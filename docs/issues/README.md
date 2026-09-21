# Release 1 Outstanding Issues

This directory contains markdown definitions for all outstanding Release 1 user stories and technical tasks that require implementation. These serve as the source specification for creating GitHub issues.

## Outstanding Issues List

1. **[R1-A-02: Trip Window Edit Flow](r1-a-02-trip-window-edit.md)**
   - *Area:* Trip Management (Area A)
   - *FR:* FR-3
   - *Description:* Add backend endpoint (`PATCH /trips/:id`) and frontend UI to edit an existing Trip's start and end dates.

2. **[R1-C-01 & R1-C-02: Per-Member Flights & Validation](r1-c-flights.md)**
   - *Area:* Accommodations & Flights (Area C)
   - *FR:* FR-3a
   - *Description:* Implement `Flight` model (arrival/departure legs per member), API endpoints, and frontend form with warning validation if flight dates fall outside the Trip Window.

3. **[R1-C-03 to R1-C-05: Accommodations & Active Accommodation Selection](r1-c-accommodations.md)**
   - *Area:* Accommodations & Flights (Area C)
   - *FR:* FR-4
   - *Description:* Implement `Accommodation` model, date range validation, overlap warning handling, and manual "Active Accommodation" selection for overlapping dates.

4. **[R1-D-01: Map View with Google Maps JS SDK](r1-d-map-view.md)**
   - *Area:* Map View (Area D)
   - *FR:* FR-5
   - *Status:* ✅ Implemented
   - *Description:* Integrate Google Maps JavaScript SDK in `tripsui` to render real geocoded pins for Trip Spots and Accommodations, replacing mock percentage pins.

5. **[R1-E-01 & R1-E-02: Day Plan Assignment & Drag-and-Drop Ranking](r1-e-day-plans.md)**
   - *Area:* Day Plans & Shared View (Area E)
   - *FR:* FR-6
   - *Description:* Implement `DayPlan` and `DayPlanSpot` models with `rank` ordering, endpoints, and frontend drag-and-drop reordering (evaluating `@dnd-kit` for touch support).

6. **[R1-E-03 & R1-E-04: Derived Shared View Endpoint & UI](r1-e-shared-view.md)**
   - *Area:* Day Plans & Shared View (Area E)
   - *FR:* FR-6
   - *Description:* Implement read-only Shared View API endpoint (`/trips/:tripId/day-plans/shared-view/:date`) aggregating members' day plans sorted by lowest contributing Rank then alphabetical, with member filtering query parameters.

7. **[R1-F-03: Shared Itinerary Message Export](r1-f-itinerary-export.md)**
   - *Area:* Exports & Offline (Area F)
   - *FR:* FR-9
   - *Description:* Implement copy-to-clipboard text export of Day Plans or Shared Views (listing spot name, address, category) for offline reference.
