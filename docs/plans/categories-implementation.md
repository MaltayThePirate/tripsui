# Implementation Plan: Categories (FR-2, FR-2a)

**Scope:** Trip-owned Categories — a fixed starter set of five, seeded automatically when a Trip is created, plus the ability for any Member to create custom Categories that become Trip-wide. A Spot can belong to multiple Categories (many-to-many via a join model). Covers the model/migration, endpoints, and frontend wiring for both the starter-set seeding and custom-category creation, plus assigning Categories to a Spot.

**Companion docs:** `trip-planner-prd.md` (FR-2, FR-2a), `trip-planner-technical-design.md`, `implementation-plan-spot-creation.md` (Spot model this builds on)

**Design decisions confirmed for this plan:**
1. **Starter set:** the five categories from the mockups — `Places to Eat` (#B8462F), `Landmarks` (#2B6E6E), `Nightlife` (#7A4FA3), `Nature` (#3E7A3E), `Shopping` (#C98A2E).
2. **Trip-owned, not global:** each Trip gets its own five `Category` rows (matching the PRD's literal wording, "each Trip has a fixed starter set"), not shared/global rows referenced by every Trip.
3. **Seeding mechanism:** a `Trip` model `after_create` callback, so every Trip gets its starter set regardless of how the Trip is created (controller, console, tests, future import) — not a controller-only concern.
4. **Color lives on `Category`** (not a frontend-hardcoded `CATEGORY_COLORS` map keyed by name), since custom Categories need a color too, and two Trips could each have a category named "Shopping" with different colors.
5. **Real join model (`SpotCategory`), not `has_and_belongs_to_many`** — consistent with the existing `TripMembership` pattern for `Trip`↔`User`, and leaves room for a future per-assignment attribute without a schema change, even though nothing needs one today.

---

## 1. What "done" looks like

A newly created Trip automatically has its five starter Categories. Any Member can create a custom Category for the Trip, which immediately becomes usable by every Member. A Spot can be assigned to one or more Categories at creation time and (if included in this pass — see Step 6) re-categorized afterward. The Spot Master List UI reads real Category data (name + color) instead of the mockup's hardcoded `CATEGORY_COLORS`.

Out of scope for this plan: editing or deleting an existing Category (PRD FR-2 only calls for creating custom ones and using them; no update/destroy endpoints are specified here — flag if that's wanted later).

---

## 2. Backend (Rails)

### 2.1 Migrations — already created, confirm shape before proceeding

Two migrations have already been generated and run locally:

```bash
rails generate migration CreateCategories trip:references name:string color:string
rails generate migration CreateSpotCategories spot:references category:references
```

Before writing models, **verify the migration files match this shape** (edit them if `rails generate` didn't produce exactly this):

```ruby
# db/migrate/..._create_categories.rb
class CreateCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :categories do |t|
      t.references :trip, null: false, foreign_key: true
      t.string :name, null: false
      t.string :color, null: false

      t.timestamps
    end

    add_index :categories, [:trip_id, :name], unique: true
  end
end
```

```ruby
# db/migrate/..._create_spot_categories.rb
class CreateSpotCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :spot_categories do |t|
      t.references :spot, null: false, foreign_key: true
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end

    add_index :spot_categories, [:spot_id, :category_id], unique: true
  end
end
```

The two unique indexes matter: `[:trip_id, :name]` prevents duplicate Category names within one Trip (across Trips, duplicate names are fine — "Shopping" can exist independently per Trip); `[:spot_id, :category_id]` prevents assigning the same Category to the same Spot twice. If migrations already ran without these indexes, add a follow-up migration rather than editing an already-run migration file.

If the migrations haven't been run yet:

```bash
rails db:migrate
```

### 2.2 Models

```ruby
# app/models/category.rb
class Category < ApplicationRecord
  belongs_to :trip
  has_many :spot_categories, dependent: :destroy
  has_many :spots, through: :spot_categories

  validates :name, presence: true, uniqueness: { scope: :trip_id }
  validates :color, presence: true
end
```

```ruby
# app/models/spot_category.rb
class SpotCategory < ApplicationRecord
  belongs_to :spot
  belongs_to :category

  validates :category_id, uniqueness: { scope: :spot_id }
end
```

```ruby
# app/models/spot.rb — add:
has_many :spot_categories, dependent: :destroy
has_many :categories, through: :spot_categories
```

```ruby
# app/models/trip.rb — add:
has_many :categories, dependent: :destroy

STARTER_CATEGORIES = [
  { name: "Places to Eat", color: "#B8462F" },
  { name: "Landmarks",     color: "#2B6E6E" },
  { name: "Nightlife",     color: "#7A4FA3" },
  { name: "Nature",        color: "#3E7A3E" },
  { name: "Shopping",      color: "#C98A2E" },
].freeze

after_create :seed_default_categories

private

def seed_default_categories
  STARTER_CATEGORIES.each { |attrs| categories.create!(attrs) }
end
```

**Verify in `rails console`:**

```ruby
trip = Trip.create!(name: "Test Trip", start_date: "2026-06-10", end_date: "2026-06-14")
trip.categories.pluck(:name)
# => ["Places to Eat", "Landmarks", "Nightlife", "Nature", "Shopping"]

trip.categories.create!(name: "Karaoke", color: "#4A6FA5")
trip.categories.count # => 6

# Uniqueness check — should raise:
trip.categories.create!(name: "Karaoke", color: "#000000")
```

### 2.3 Routes

```ruby
# config/routes.rb
resources :trips, only: [:create, :show] do
  resources :spots, only: [:index, :create]
  resources :categories, only: [:index, :create]
end
```

### 2.4 CategoriesController

```ruby
# app/controllers/categories_controller.rb
class CategoriesController < ApplicationController
  def index
    trip = Trip.find(params[:trip_id])
    render json: trip.categories.map { |c| category_json(c) }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Trip not found" }, status: :not_found
  end

  def create
    trip = Trip.find(params[:trip_id])
    category = trip.categories.new(category_params)

    if category.save
      render json: category_json(category), status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Trip not found" }, status: :not_found
  end

  private

  def category_params
    params.require(:category).permit(:name, :color)
  end

  def category_json(category)
    { id: category.id, name: category.name, color: category.color }
  end
end
```

**Open decision needed before building the custom-category UI (Step 5 below): how does a custom Category get its color?**
- **Option A — Member picks a color** (a swatch/palette picker in the "new custom category" form). More flexible, but the mockups have no precedent for this UI.
- **Option B — backend auto-assigns** from a fixed palette (e.g. cycle through a list of hex values not already used by the Trip's existing Categories). Zero UI decisions needed, but less expressive.

This plan writes `category_params` to accept `:color` from the client either way, so either option works without a controller change — just resolve it before building `AddCategoryForm` (Step 5).

### 2.5 Spot↔Category assignment on SpotsController

Add `category_ids` to Spot creation, and support setting them at creation time:

```ruby
# app/controllers/spots_controller.rb
def create
  # ...existing geocoding logic through `spot = trip.spots.new(...)`...

  if spot.save
    spot.category_ids = spot_params[:category_ids] || []
    render json: spot_json(spot), status: :created
  else
    render json: { errors: spot.errors.full_messages }, status: :unprocessable_entity
  end
  # ...existing rescues unchanged...
end

private

def spot_params
  params.require(:spot).permit(:source_url, category_ids: [])
end

def spot_json(spot)
  {
    id: spot.id,
    name: spot.name,
    address: spot.address,
    latitude: spot.latitude,
    longitude: spot.longitude,
    source_provider: spot.source_provider,
    owner_id: spot.user_id,
    categories: spot.categories.map { |c| { id: c.id, name: c.name, color: c.color } }
  }
end
```

`spot.category_ids = [...]` is ActiveRecord's built-in bulk assignment for a `has_many :through` — it diffs against the current set and creates/removes `SpotCategory` rows as needed, so this also works later for re-categorizing an existing Spot (via a future `SpotsController#update`, not built in this plan, but this line doesn't need to change when that's added).

Also update the existing `SpotsController#index` to include `categories` in each Spot's JSON, using the same `spot_json` shape above, so the frontend has Category data to render without a second request per Spot.

---

## 3. Frontend (Next.js)

### 3.1 Fetching Categories

New `useQuery` in whatever page/hook currently loads Trip data (Trip Home, Spot Master List, Map View, Day Plan View all need this): `GET /trips/:tripId/categories`. Same polling `refetchInterval` convention as the rest of the app.

### 3.2 Replace hardcoded `CATEGORY_COLORS`

All three mockups (`spot-master-list.jsx`, `map-view.jsx`, `day-plan-view.jsx`) currently define a local:

```js
const CATEGORY_COLORS = {
  "Places to Eat": "#B8462F",
  "Landmarks": "#2B6E6E",
  "Nightlife": "#7A4FA3",
  "Nature": "#3E7A3E",
  "Shopping": "#C98A2E",
};
```

Replace this with a lookup built from the fetched Categories list (`{ [category.name]: category.color }`, or better, key by `category.id` throughout once Spots carry real `category_ids` instead of the mockup's `categories: ["Places to Eat"]` string-array shape). This is a real data-shape change, not just a swap-the-constant — `StampBadge` and the category filter chips in all three files currently key off Category **name strings**; moving to real IDs is the more correct long-term shape but touches more lines. Flagging as a decision: keep name-keying for now (smaller diff, matches mockup shape) or switch to ID-keying (correct shape, larger diff)?

### 3.3 New component: `AddCategoryForm`

Small inline form or modal — single text input for name, plus a color input (swatch picker or plain `<input type="color">`, styling your call) if Option A (Section 2.4) was chosen; no color input at all if Option B. Suggested location: `components/trip/AddCategoryForm.jsx`.

```
components/trip/AddCategoryForm.jsx
  - controlled input(s): name (+ color, if Option A)
  - submit → TanStack Query useMutation → POST /trips/:tripId/categories
    body: { category: { name: <name>, color: <color or omitted> } }
  - on success: invalidate the trip's categories query, close the form
  - on error: show backend error inline (uniqueness violation is the
    most likely one a Member will hit — "Name has already been taken")
```

### 3.4 Wiring category selection into Spot creation

`AddSpotForm` (from the Spot Creation plan) needs a multi-select of the Trip's Categories (checkboxes or toggle chips, matching the existing `StampBadge`/chip visual language already used elsewhere) added to its form state, included in the `POST /trips/:tripId/spots` body as `category_ids: [...]`.

---

## 4. Suggested order of work

1. Confirm migrations match Section 2.1's shape (already generated/run — just verify indexes)
2. Rails: `Category` + `SpotCategory` models, associations on `Spot`/`Trip`, starter-set constant + `after_create` callback
3. Rails: verify seeding + uniqueness in `rails console` (Section 2.2)
4. Rails: routes + `CategoriesController` (index/create)
5. Rails: manual `curl` verification (Section 5 below)
6. Rails: extend `SpotsController` for `category_ids` on create + include `categories` in Spot JSON (both `index` and `create`)
7. **Resolve open decision:** custom-category color — Member-picked vs. auto-assigned (Section 2.4) — before Step 8
8. Next.js: `AddCategoryForm` component + mutation
9. Next.js: replace hardcoded `CATEGORY_COLORS` in the three mockup files with real fetched data (resolve name-keyed vs. ID-keyed per Section 3.2 first)
10. Next.js: add Category multi-select to `AddSpotForm`
11. Manual browser pass: create a Trip, confirm the five starter Categories appear; create a custom Category; create a Spot with 2+ Categories assigned; confirm it renders correctly in Spot Master List

---

## 5. Manual verification (curl, before wiring the frontend)

```bash
# List a Trip's Categories — should return the 5 starter categories for a fresh Trip
curl http://localhost:3000/trips/1/categories
```

```bash
# Create a custom Category
curl -X POST http://localhost:3000/trips/1/categories \
  -H "Content-Type: application/json" \
  -d '{"category":{"name":"Karaoke","color":"#4A6FA5"}}'
```
Should return `201` with the Category JSON.

```bash
# Duplicate name — should 422 with a uniqueness error
curl -X POST http://localhost:3000/trips/1/categories \
  -H "Content-Type: application/json" \
  -d '{"category":{"name":"Karaoke","color":"#000000"}}'
```

```bash
# Create a Spot with Categories assigned — replace category ids with real ones
curl -X POST http://localhost:3000/trips/1/spots \
  -H "Content-Type: application/json" \
  -d '{"spot":{"source_url":"https://maps.google.com/?q=Golden+Gai","category_ids":[1,3]}}'
```
Should return `201` with the Spot JSON including a `categories` array with both assigned Categories.

```bash
# Confirm it shows up correctly on list
curl http://localhost:3000/trips/1/spots
```

---

## 6. What this deliberately leaves unresolved

- **Custom Category color assignment** (Member-picked vs. auto-assigned) — flagged in Section 2.4, needs a decision before Step 8.
- **Name-keyed vs. ID-keyed frontend lookups** — flagged in Section 3.2, needs a decision before Step 9.
- **No `update`/`destroy` for Category** — not specified by PRD FR-2; add as a follow-up plan if wanted.
- **No `update` for Spot's `category_ids` yet** — `spot.category_ids = [...]` is written to also work from a future `SpotsController#update`, but that action isn't built in this plan (re-categorizing an existing Spot happens later).
- **Error message field-keying** — same open item carried from earlier plans (flat-array `errors.full_messages` vs. field-keyed) — this plan's `create` actions follow the same flat-array precedent for consistency, not because the underlying question has been resolved.