# Product Requirements Document: Trip Planner
 
**Status:** Draft v2
**Last updated:** derived from Shared View redesign session
 
---
 
## 1. Product Philosophy
 
This product intentionally excludes time-of-day scheduling. Travelers get a **list of things to do per day**, with the order improvised on the day itself — not a minute-by-minute itinerary. Every design decision downstream of this document should preserve that principle: no forced sequencing, no time slots, no "9:00 AM" style entries.
 
---
 
## 2. Actors & Roles
 
| Role | Description |
|---|---|
| **Trip Planner** | A Member configuring the trip pre-travel (adding Spots, Categories, Accommodations, Day Plans) |
| **Traveler** | A Member consuming the plan while on-location (offline viewing, exporting, navigating) |
 
A single **Member** can hold either or both roles depending on the trip — the product supports both solo use (one person plans and travels) and group use (multiple people plan and/or travel together).
 
---
 
## 3. Glossary
 
| Term | Definition |
|---|---|
| **Trip** | A shared container for a group's travel planning. Has one or more Members. |
| **Member** | A person participating in a Trip. Can act as Trip Planner, Traveler, or both. |
| **Spot** | A saved place with a precise, mappable location. Created by pasting a Google Maps or Apple Maps link, which the app geocodes. Owned by the Member who created it, but visible to all Members in the Trip's merged view. |
| **Spot Note** | A single, free-text field on a Spot, visible and editable by any Member on the Trip. |
| **Spot Master List** | The full set of a Trip's Spots, merged across all Members, independent of any day assignment. |
| **Category** | A label for grouping Spots (e.g., "places to eat," "nightlife," "landmarks"). Starts from a fixed system list; Members can add custom Categories, which become visible/usable Trip-wide. A Spot may belong to multiple Categories. |
| **Trip Window** | The overall date range for the Trip, manually configured (not derived from any Member's flights). Bounds valid dates for Accommodations and Day Plans. |
| **Flight** | A Member's own arrival and/or departure flight details, entered for their personal reference (e.g., to help them book Accommodations). MVP: exactly one arrival leg and one departure leg per Member, though the data model is designed to extend to multi-leg trips later. Informational only — does not define or constrain the Trip Window. |
| **Accommodation** | A lodging location with a date range within the Trip Window. A Trip may have multiple Accommodations, each covering a different (possibly overlapping) date range. |
| **Day Plan** | An ordered set of Spots assigned to a specific date, belonging to exactly one Member. Each Member has their own Day Plan per date, editable only by that Member. Spot order within a Day Plan is user-defined (drag-and-drop) and persisted as a **Rank** per Spot, rather than a fixed sequence position — this allows a Spot to be reordered without renumbering the rest of the list. |
| **Shared View** | A read-only, derived aggregate showing all Spots planned for a date across the individual Day Plans of two or more Members. Each Spot is tagged with which of the selected Member(s) have it planned. Defaults to all Members on the Trip; a Member can narrow the selection, including down to a single Member — at which point it is functionally identical to viewing that Member's own Day Plan, and the UI does not block or special-case this. Spots are ordered by the lowest Rank among the contributing Members, then alphabetically by Spot name for ties. Shared View is not itself an editable entity — there is nothing to "assign to" the Shared View directly, and it is not a stored/persisted record. |
| **Map View** | A visual display of a Trip's Spots and the relevant Accommodation(s) on a map, used by a Member to manually judge proximity and grouping. Purely visual — no algorithmic clustering or suggestions in MVP. |
| **Active Accommodation** | On dates where two or more Accommodations overlap, the Accommodation a Member manually designates as "active" for that date's Map View distance calculations. |
| **Google Maps Export** | An export action where a Member selects a Category, and all Spots in that Category are sent to Google Maps (e.g., via deep link), regardless of day assignment. |
| **Offline Day Plan View** | A read-only, text-based view of a Day Plan's Spots (name, address, notes, Category) available without network connectivity. Does not include cached map imagery. |
| **Shared Itinerary Message** | A shareable, text-based summary of a chosen Day Plan (a Member's own, or the Shared View for a date) listing each Spot with its name, address, and Category. |
 
---
 
## 4. Functional Requirements
 
### 4.1 Planning
 
**FR-1: Spot Creation**
- A Member creates a Spot by pasting a Google Maps or Apple Maps link.
- The app geocodes the link to derive a precise, mappable location.
- If the link fails to geocode or is not a recognized maps link, the app shows an error and discards the input. No manual entry fallback exists.
- A created Spot is owned by the creating Member but appears in the Trip's merged Spot Master List, visible to all Members.
**FR-2: Categorization**
- Each Trip has a fixed starter set of system Categories.
- Any Member can create a custom Category, which becomes visible and usable by all Members on the Trip.
- A Spot can be assigned to multiple Categories.
**FR-2a: Spot Notes**
- Each Spot has a single free-text note field.
- Any Member can view and edit this note; there is no per-Member private note.
**FR-3: Trip Window**
- Any Trip Planner manually configures a single date range for the Trip (the Trip Window).
- This date range is independent of any Member's individual flights and bounds valid dates for Accommodations and Day Plans.
**FR-3a: Per-Member Flights**
- Each Member can independently enter their own arrival flight and departure flight (MVP: one arrival leg, one departure leg per Member).
- Flight details are informational only, intended to help that Member evaluate/book their own Accommodations — they do not define or alter the Trip Window.
- If a Member's flight date falls outside the Trip's manually-configured Trip Window, the app displays a warning but does not block saving.
- Data model supports future extension to multiple flight legs per Member (connections, multi-city) without a breaking schema change.
**FR-4: Accommodations**
- A Member can add one or more Accommodations to a Trip, each with a date range within the Trip Window.
- If a new Accommodation's date range overlaps an existing one, the app displays a warning but allows the Member to save it anyway.
- If overlapping Accommodations exist for a given date, a Member manually selects which one is the "Active Accommodation" for that date's distance calculations.
**FR-5: Map View**
- Displays all Spots in the Spot Master List alongside the relevant Accommodation(s) for visual reference.
- Supports manual, human-driven assessment of proximity and grouping — no automatic clustering or suggested groupings in MVP.
**FR-6: Day Plan Assignment**
- A Member can assign any Spot from the Spot Master List to their own Day Plan for a given date.
- A Spot may be assigned to multiple dates and/or appear on multiple Members' Day Plans, with no restriction.
- Spots not assigned to any Day Plan require no special "unassigned" bucket — they simply remain in the Spot Master List, filterable by assignment status.
- Within a Member's own Day Plan for a date, Spot order is user-defined via drag-and-drop and persisted as a Rank per Spot.
- The Shared View for a date is automatically derived from all Members' Day Plans for that date — there is no separate assignment action for the Shared View itself.
### 4.2 On Location
 
**FR-7: Google Maps Export**
- A Member selects a Category and exports all Spots in that Category to Google Maps.
- This export is independent of Day Plan assignment (i.e., it is not scoped by date).
- Exporting a Category with zero Spots is disallowed; the app shows an error or disabled state.
**FR-8: Offline Day Plan Viewing**
- A Member can view a Day Plan (their own, or the Shared View for a date) as a text-based list — Spot name, address, notes, and Category — without network connectivity.
- No map imagery is cached or required for offline viewing.
**FR-9: Shared Itinerary Message Export**
- A Member selects a date and chooses whether to export that date's Shared View (aggregated across all, or a selected subset of, Members) or their own Day Plan, as a shareable message.
- The message lists each Spot with its name, address, and Category. It does not include per-Member attribution, even when exporting the Shared View — Member tagging is a screen-only affordance.
- Exporting a Day Plan or Shared View with zero Spots is disallowed; the app shows an error or disabled state.
---
 
## 5. Data Model Summary (conceptual)
 
- **Trip** 1—* **Member**
- **Trip** 1—* **Spot** (each Spot has one owning Member)
- **Trip** 1—* **Category** (system defaults + Trip-wide custom)
- **Spot** *—* **Category** (many-to-many)
- **Trip** 1—* **Accommodation** (date-ranged, possibly overlapping)
- **Trip** has one manually-configured **Trip Window** (date range attribute, not a derived entity)
- **Member** 1—2 **Flight** (MVP: exactly one arrival, one departure per Member; model supports more)
- **Trip** 1—* **Day Plan** (exactly one per Member per date — no separate "Shared" row type)
- **Day Plan** *—* **Spot** (many-to-many; no uniqueness constraint; each Day Plan↔Spot association carries a **Rank** value for user-defined ordering)
- **Shared View** is not a stored entity. It is a derived, read-only query aggregating a selected subset (2+, or by UI convention 1+) of Members' Day Plans for a given date, sorted by lowest contributing Rank then alphabetically by Spot name.
---
 
## 6. Out of Scope (MVP)
 
- Time-of-day scheduling or ordering within a day (by design)
- Manual Spot entry / in-app location search (import-only via maps link)
- Algorithmic grouping or clustering suggestions on the Map View
- Offline map tiles/imagery
- Support for maps apps other than Google Maps (export)
- Multi-leg flights per Member (connections, multi-city) — designed for, not built in MVP
---
 
## 7. Open Items for Future Discussion
 
- ~~Ordering/sorting logic within Offline Day Plan View and Shared Itinerary Message~~ — **likely resolved** by the introduction of Rank (FR-6): a Member's own Day Plan exports/displays in Rank order; the Shared View exports/displays in lowest-Rank-then-alphabetical order, matching its on-screen sort. Flagging as tentative rather than fully closed, since this extends a decision made for the live screen into the export/offline contexts and hasn't been explicitly confirmed for those contexts specifically.
- Permissions edge cases (e.g., can a Member delete another Member's Spot from the merged view?)
- Notification/sync behavior when Spots or Categories are added by other Members