"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, LayoutGrid, List as ListIcon, Info, X } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatShortDate } from "@/lib/format";

import PageHeader from "@/components/layout/PageHeader";
import AddMenuButton from "@/components/trip/AddMenuButton";
import AddSpotForm from "@/components/trip/AddSpotForm";

export default function TripHomePage({ params }) {
  const { tripId } = useParams();

  const [search, setSearch] = useState("");
  const [view, setView] = useState("grid");
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [emptyMenuOpen, setEmptyMenuOpen] = useState(false);
  const [note, setNote] = useState(null);
  const [showAddSpotForm, setShowAddSpotForm] = useState(false);

  const tripQuery = useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => apiGet(`/trips/${tripId}`),
  });

  const spotsQuery = useQuery({
    queryKey: ["trip", tripId, "spots"],
    queryFn: () => apiGet(`/trips/${tripId}/spots`),
  });

  const handleSelect = (key, label) => {
    setHeaderMenuOpen(false);
    setEmptyMenuOpen(false);
    if (key === "spot") {
      setShowAddSpotForm(true);
      return;
    }
    setNote(label);
  };

  if (tripQuery.isLoading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <div className="spinner" />
        <div className="eyebrow-label">Charting the route…</div>
      </div>
    );
  }

  if (tripQuery.isError) {
    return (
      <div style={{ padding: "28px 24px", color: "var(--color-rust)" }}>
        {tripQuery.error.message}
      </div>
    );
  }

  const trip = tripQuery.data;
  const spots = spotsQuery.data ?? [];
  const dateRangeLabel = `${formatShortDate(trip.start_date)}–${formatShortDate(trip.end_date)}`;

  return (
    <div style={{ padding: "28px 24px 60px" }}>
      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
        <PageHeader eyebrow={`${trip.name} · ${dateRangeLabel}`} title="Spots">
          <AddMenuButton
            isOpen={headerMenuOpen}
            onToggleOpen={() => setHeaderMenuOpen((v) => !v)}
            onSelect={handleSelect}
          />
        </PageHeader>

        {showAddSpotForm && (
          <div
            onClick={() => setShowAddSpotForm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(31, 46, 53, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "24px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: "420px" }}
            >
              <AddSpotForm tripId={tripId} onClose={() => setShowAddSpotForm(false)} />
            </div>
          </div>
        )}

        {note && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "8px",
              background: "rgba(201, 138, 46, 0.05)",
              border: "1px solid rgba(201, 138, 46, 0.2)",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "18px",
              fontFamily: "var(--font-inter), sans-serif",
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

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#FFFFFF",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "9px 14px",
            }}
          >
            <Search size={15} color="var(--color-muted)" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Spots by name or address"
              disabled
              style={{
                border: "none",
                outline: "none",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "13.5px",
                color: "var(--color-ink)",
                width: "100%",
                background: "transparent",
              }}
            />
          </div>
          <div style={{ display: "flex", background: "#FFFFFF", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "3px" }}>
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              style={{
                border: "none",
                background: view === "grid" ? "var(--color-ink)" : "transparent",
                color: view === "grid" ? "var(--color-parchment)" : "var(--color-muted)",
                borderRadius: "6px",
                padding: "7px 10px",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <LayoutGrid size={15} strokeWidth={2} />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              style={{
                border: "none",
                background: view === "list" ? "var(--color-ink)" : "transparent",
                color: view === "list" ? "var(--color-parchment)" : "var(--color-muted)",
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

        {spots.length === 0 && (
          <div style={{ textAlign: "center", padding: "70px 24px", border: "1.5px dashed var(--color-border)", borderRadius: "14px", background: "#FFFFFF" }}>
            <div style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 600, fontSize: "20px", color: "var(--color-ink)", marginBottom: "8px" }}>
              Your Trip is empty
            </div>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "13.5px", color: "var(--color-muted)", margin: "0 0 22px", maxWidth: "360px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
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
      </div>
    </div>
  );
}