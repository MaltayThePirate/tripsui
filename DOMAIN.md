# Business Domain Model: Wander

This document defines the core domain entities, attributes, and relationships for the Wander application, serving as the canonical business domain reference for the frontend application (`tripsui`).

---

## Core Entities & Relationships

### 1. Trip
- **Definition:** A shared container for a group's travel planning.
- **Attributes:** `name`, `start_date`, `end_date` (defining the overall **Trip Window**).
- **Relationships:**
  - Has many **Members** (`TripMembership`)
  - Has many **Spots** (Master List)
  - Has many **Categories** (Trip-wide custom + starter set)
  - Has many **Accommodations**
  - Has many **Day Plans**

### 2. Member / User
- **Definition:** A person participating in a Trip. A single Member can hold either or both roles (Trip Planner pre-travel, Traveler on-location).
- **Attributes:** `email`, authentication metadata.
- **Relationships:**
  - Belongs to many **Trips** via `TripMembership`
  - Owns **Spots**
  - Owns **Flights**
  - Owns **Day Plans** (one per date)

### 3. Spot
- **Definition:** A saved place with a precise, mappable location created by pasting a Google or Apple Maps link.
- **Attributes:** `name`, `address`, `latitude`, `longitude` (PostGIS geography point), `source_url`, `source_provider`.
- **Relationships:**
  - Belongs to a **Trip**
  - Belongs to an owning **Member** (`user_id`)
  - Has one **Spot Note** (single free-text field, editable by any trip member)
  - Has many **Categories** through `SpotCategory` (many-to-many)
  - Appears in **Day Plans** through `DayPlanSpot` (many-to-many with **Rank**)

### 4. Category
- **Definition:** A label for grouping Spots (e.g., "Places to Eat", "Landmarks").
- **Attributes:** `name`, `color` (hex code).
- **Relationships:**
  - Belongs to a **Trip** (Trip-owned; starter set of 5 seeded automatically via `after_create`, plus custom trip-wide categories).
  - Has many **Spots** through `SpotCategory`.

### 5. Accommodation
- **Definition:** A lodging location with a date range within the Trip Window.
- **Attributes:** `name`, `address`, `start_date`, `end_date`, `active` status (for distance calculations on overlapping dates).
- **Relationships:**
  - Belongs to a **Trip**.

### 6. Flight
- **Definition:** A member's arrival and/or departure flight details for personal reference.
- **Attributes:** Arrival leg details, departure leg details (MVP: 1 arrival, 1 departure per Member).
- **Relationships:**
  - Belongs to a **Member** and a **Trip**.
  - *Note:* Informational only; does not define or alter the Trip Window.

### 7. Day Plan
- **Definition:** An ordered set of Spots assigned to a specific date for a specific Member.
- **Attributes:** `date`.
- **Relationships:**
  - Belongs to a **Trip** and a **Member** (keyed uniquely on `(trip_id, user_id, date)`).
  - Has many **Spots** through `DayPlanSpot`, where each association carries a **Rank** value for user-defined drag-and-drop ordering.

### 8. Shared View (Derived Concept)
- **Definition:** A read-only aggregate showing all Spots planned for a date across individual Day Plans of two or more Members.
- **Characteristics:** Not a stored/persisted entity. Resolved server-side as a query across selected Members' `DayPlan` rows for a date, deduplicated by Spot, tagged with contributing Member(s), and sorted by lowest contributing Rank then alphabetically by Spot name.
