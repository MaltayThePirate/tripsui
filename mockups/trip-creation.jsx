import { useState } from "react";
import { MapPin, Plane, Home, Plus, Info, X, Search, LayoutGrid, List as ListIcon, Users } from "lucide-react";

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
`;

function formatShortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const ADD_MENU_ITEMS = [
  { key: "spot", label: "Add a Spot", icon: MapPin },
  { key: "flight", label: "Add Flight Details", icon: Plane },
  { key: "accommodation", label: "Add Accommodation", icon: Home },
  { key: "attendees", label: "Add Attendee(s)", icon: Users },
];

// Placeholder for now — Spot Creation (FR-1), Flight entry (FR-3a),
// Accommodation setup (FR-4), and inviting Attendees (invite-link
// collaboration, PRD Section 8) don't have dedicated screens yet. Selecting
// any of these just surfaces a note; each becomes a real flow in a later pass.
function AddMenuButton({ isOpen, onToggleOpen, onSelect, size = "default" }) {
  const isLarge = size === "large";
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={onToggleOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "#1F2E35",
          color: "#FAF7F1",
          border: "none",
          borderRadius: "8px",
          padding: isLarge ? "12px 22px" : "10px 16px",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: isLarge ? "14.5px" : "13.5px",
          cursor: "pointer",
        }}
      >
        <Plus size={isLarge ? 16 : 15} strokeWidth={2.5} />
        Add
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: isLarge ? "50%" : undefined,
            right: isLarge ? undefined : 0,
            transform: isLarge ? "translateX(-50%)" : undefined,
            background: "#FFFFFF",
            border: "1px solid #E4DDCE",
            borderRadius: "10px",
            boxShadow: "0 4px 14px rgba(31,46,53,0.18)",
            padding: "6px",
            width: "220px",
            zIndex: 30,
            textAlign: "left",
          }}
        >
          {ADD_MENU_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onSelect(key, label)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                width: "100%",
                border: "none",
                background: "none",
                color: "#1F2E35",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13px",
                padding: "9px 10px",
                borderRadius: "7px",
                cursor: "pointer",
                textAlign: "left",
              }}
              className="add-menu-item"
            >
              <Icon size={15} strokeWidth={2} color="#2B6E6E" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TripCreationForm({ onCreate }) {
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const isValid = tripName.trim() !== "" && startDate !== "" && endDate !== "" && endDate >= startDate;

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#FAF7F1",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          border: "1px solid #E4DDCE",
          borderRadius: "14px",
          padding: "36px 32px",
          boxShadow: "0 2px 10px rgba(31,46,53,0.06)",
        }}
      >
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#C98A2E",
            marginBottom: "6px",
          }}
        >
          New Trip
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 600,
            fontSize: "26px",
            color: "#1F2E35",
            margin: "0 0 6px",
          }}
        >
          Where to, and when?
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            color: "#8A8270",
            margin: "0 0 26px",
            lineHeight: 1.5,
          }}
        >
          Give the Trip a name and set the Trip Window. You can add Spots, Flights, and Accommodations right after.
        </p>

        <label
          style={{
            display: "block",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10.5px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#8A8270",
            marginBottom: "6px",
          }}
        >
          Trip Name
        </label>
        <input
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          placeholder="e.g. Tokyo Trip"
          style={{
            width: "100%",
            border: "1px solid #E4DDCE",
            borderRadius: "8px",
            padding: "10px 12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "14px",
            color: "#1F2E35",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        />

        <label
          style={{
            display: "block",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10.5px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#8A8270",
            marginBottom: "6px",
          }}
        >
          Trip Window
        </label>
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #E4DDCE",
              borderRadius: "8px",
              padding: "9px 10px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "#1F2E35",
              boxSizing: "border-box",
            }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              flex: 1,
              border: "1px solid #E4DDCE",
              borderRadius: "8px",
              padding: "9px 10px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              color: "#1F2E35",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          disabled={!isValid}
          onClick={() => onCreate({ tripName: tripName.trim(), startDate, endDate })}
          style={{
            width: "100%",
            background: isValid ? "#1F2E35" : "#E4DDCE",
            color: isValid ? "#FAF7F1" : "#A99F8B",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            cursor: isValid ? "pointer" : "not-allowed",
          }}
        >
          Create Trip
        </button>
      </div>
    </div>
  );
}

function TripHome({ trip, onBackToStart }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [emptyMenuOpen, setEmptyMenuOpen] = useState(false);
  const [note, setNote] = useState(null);

  // A freshly created Trip starts with zero Spots — this mockup demonstrates
  // that state specifically, so the list is intentionally always empty here.
  const spots = [];

  const handleSelect = (key, label) => {
    setHeaderMenuOpen(false);
    setEmptyMenuOpen(false);
    setNote(label);
  };

  const dateRangeLabel = `${formatShortDate(trip.startDate)}–${formatShortDate(trip.endDate)}`;

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#FAF7F1",
        fontFamily: "'Inter', sans-serif",
        padding: "28px 24px 60px",
      }}
    >
      <style>{FONT_IMPORT}</style>
      <style>{`
        .add-menu-item:hover { background: #2B6E6E14 !important; }
        .view-btn:focus-visible, .search-input:focus-visible { outline: 2px solid #C98A2E; outline-offset: 2px; }
        ::placeholder { color: #A99F8B; }
      `}</style>

      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "22px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#C98A2E",
                marginBottom: "4px",
              }}
            >
              {trip.tripName} · {dateRangeLabel}
            </div>
            <h1
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: "30px",
                color: "#1F2E35",
                margin: 0,
              }}
            >
              Spots
            </h1>
          </div>

          <AddMenuButton
            isOpen={headerMenuOpen}
            onToggleOpen={() => setHeaderMenuOpen((v) => !v)}
            onSelect={handleSelect}
          />
        </div>

        {/* Placeholder-action note */}
        {note && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "8px",
              background: "#C98A2E0d",
              border: "1px solid #C98A2E33",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "18px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "12.5px",
              color: "#8A6017",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <Info size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: "1px" }} />
              "{note}" doesn't have a screen yet — this is a placeholder for a flow that's still being designed.
            </div>
            <button
              onClick={() => setNote(null)}
              aria-label="Dismiss"
              style={{ border: "none", background: "none", color: "#8A6017", cursor: "pointer", display: "flex", flexShrink: 0 }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Search + view toggle — kept for structural continuity with the
            populated Spot Master List, even though there's nothing to
            search or filter yet. */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#FFFFFF",
              border: "1px solid #E4DDCE",
              borderRadius: "8px",
              padding: "9px 14px",
            }}
          >
            <Search size={15} color="#A99F8B" strokeWidth={2} />
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Spots by name or address"
              disabled
              style={{
                border: "none",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
                fontSize: "13.5px",
                color: "#1F2E35",
                width: "100%",
                background: "transparent",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              background: "#FFFFFF",
              border: "1px solid #E4DDCE",
              borderRadius: "8px",
              padding: "3px",
            }}
          >
            <button
              className="view-btn"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              style={{
                border: "none",
                background: view === "grid" ? "#1F2E35" : "transparent",
                color: view === "grid" ? "#FAF7F1" : "#8A8270",
                borderRadius: "6px",
                padding: "7px 10px",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <LayoutGrid size={15} strokeWidth={2} />
            </button>
            <button
              className="view-btn"
              onClick={() => setView("list")}
              aria-label="List view"
              style={{
                border: "none",
                background: view === "list" ? "#1F2E35" : "transparent",
                color: view === "list" ? "#FAF7F1" : "#8A8270",
                borderRadius: "6px",
                padding: "7px 10px",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <ListIcon size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Empty Trip state */}
        {spots.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "70px 24px",
              border: "1.5px dashed #E4DDCE",
              borderRadius: "14px",
              background: "#FFFFFF",
            }}
          >
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600,
                fontSize: "20px",
                color: "#1F2E35",
                marginBottom: "8px",
              }}
            >
              Your Trip is empty
            </div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "13.5px",
                color: "#8A8270",
                margin: "0 0 22px",
                maxWidth: "360px",
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.5,
              }}
            >
              Start by adding a Spot, your flight details, or where you're staying.
            </p>
            <AddMenuButton
              isOpen={emptyMenuOpen}
              onToggleOpen={() => setEmptyMenuOpen((v) => !v)}
              onSelect={handleSelect}
              size="large"
            />
          </div>
        )}

        <button
          onClick={onBackToStart}
          style={{
            display: "block",
            margin: "28px auto 0",
            border: "none",
            background: "none",
            color: "#A99F8B",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          ← start over (demo only)
        </button>
      </div>
    </div>
  );
}

export default function TripCreationFlow() {
  const [trip, setTrip] = useState(null);

  if (!trip) {
    return <TripCreationForm onCreate={setTrip} />;
  }

  return <TripHome trip={trip} onBackToStart={() => setTrip(null)} />;
}
