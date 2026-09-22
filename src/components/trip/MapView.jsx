"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { MapPin, Home, Info, X, Plus, Check, Users, User } from "lucide-react";

const CATEGORY_COLORS = {
  "Places to Eat": "#B8462F",
  "Landmarks": "#2B6E6E",
  "Nightlife": "#7A4FA3",
  "Nature": "#3E7A3E",
  "Shopping": "#C98A2E",
  "Coffee": "#724F27",
};

const STAMP_TILT = -1.5;

export function StampBadge({ label }) {
  const color = CATEGORY_COLORS[label] || "#2B6E6E";
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "var(--font-ibm-plex-mono), monospace",
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color,
        border: `1.5px dashed ${color}`,
        borderRadius: "4px",
        padding: "3px 7px",
        transform: `rotate(${STAMP_TILT}deg)`,
        background: `${color}0d`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function AddToPlanControl({ date, inShared, inPersonal, isOpen, onToggleOpen, onToggleShared, onTogglePersonal, compact }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={onToggleOpen}
        aria-label="Add to Plan"
        title="Add to Plan"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: compact ? "26px" : "30px",
          height: compact ? "26px" : "30px",
          border: "1px solid " + (inShared || inPersonal ? "#2B6E6E" : "#E4DDCE"),
          background: inShared || inPersonal ? "#2B6E6E" : "#FFFFFF",
          color: inShared || inPersonal ? "#FAF7F1" : "#1F2E35",
          borderRadius: "50%",
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
        }}
      >
        <Plus size={compact ? 14 : 16} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            background: "#FFFFFF",
            border: "1px solid #E4DDCE",
            borderRadius: "10px",
            boxShadow: "0 4px 14px rgba(31,46,53,0.18)",
            padding: "8px",
            width: "190px",
            zIndex: 30,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: "10px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#A99F8B",
              padding: "2px 6px 6px",
            }}
          >
            Add to plan for {date}
          </div>
          <button
            onClick={onToggleShared}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              width: "100%",
              border: "none",
              background: "none",
              color: "#1F2E35",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "12.5px",
              padding: "7px 6px",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Users size={13} strokeWidth={2} />
            Shared Day Plan
            <span style={{ marginLeft: "auto", display: "flex" }}>
              {inShared && <Check size={13} strokeWidth={2.5} color="#2B6E6E" />}
            </span>
          </button>
          <button
            onClick={onTogglePersonal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              width: "100%",
              border: "none",
              background: "none",
              color: "#1F2E35",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "12.5px",
              padding: "7px 6px",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <User size={13} strokeWidth={2} />
            My Day Plan
            <span style={{ marginLeft: "auto", display: "flex" }}>
              {inPersonal && <Check size={13} strokeWidth={2.5} color="#2B6E6E" />}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function MapView({ spots = [], accommodations = [] }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);

  const [activeCategories, setActiveCategories] = useState([]);
  const [selectedDate, setSelectedDate] = useState("Jun 10");
  const [hoveredSpotId, setHoveredSpotId] = useState(null);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [activeAccommodationId, setActiveAccommodationId] = useState(null);

  const [sharedByDate, setSharedByDate] = useState({});
  const [personalByDate, setPersonalByDate] = useState({});

  const [mapMenuOpen, setMapMenuOpen] = useState(false);
  const [listMenuOpenId, setListMenuOpenId] = useState(null);

  // Initialize Google Maps
  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", initMap);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = () => {
      console.error("Failed to load Google Maps script.");
    };
    document.head.appendChild(script);

    return () => {
      if (script) {
        script.removeEventListener("load", initMap);
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;

    let center = { lat: 35.6762, lng: 139.6503 }; // Tokyo default
    if (spots && spots.length > 0 && spots[0].latitude && spots[0].longitude) {
      center = { lat: spots[0].latitude, lng: spots[0].longitude };
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      disableDefaultUI: false,
    });

    setMap(mapInstance);
  };

  const formattedSpots = useMemo(() => {
    return spots.map((s) => {
      const categories = s.categories ? s.categories.map(c => c.name) : ["Landmarks"];
      return {
        ...s,
        categories,
      };
    });
  }, [spots]);

  const formattedAccommodations = useMemo(() => {
    return accommodations.map((a) => ({
      ...a,
      dateRange: ["Jun 10", "Jun 11", "Jun 12", "Jun 13", "Jun 14"],
    }));
  }, [accommodations]);

  const TRIP_DATES = ["Jun 10", "Jun 11", "Jun 12", "Jun 13", "Jun 14"];
  const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS);

  const toggleCategory = (cat) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const visibleSpots = useMemo(() => {
    return formattedSpots.filter(
      (s) => activeCategories.length === 0 || s.categories.some((c) => activeCategories.includes(c))
    );
  }, [formattedSpots, activeCategories]);

  const relevantAccommodations = formattedAccommodations.filter((a) =>
    a.dateRange.includes(selectedDate)
  );
  const hasOverlap = relevantAccommodations.length > 1;

  const effectiveActiveId = hasOverlap
    ? (activeAccommodationId || relevantAccommodations[0]?.id)
    : relevantAccommodations[0]?.id ?? null;

  const selectedSpot = selectedSpotId ? formattedSpots.find((s) => s.id === selectedSpotId) : null;

  const isInShared = (id, date) => (sharedByDate[date] || []).includes(id);
  const isInPersonal = (id, date) => (personalByDate[date] || []).includes(id);
  const toggleShared = (id, date) => {
    setSharedByDate((prev) => {
      const list = prev[date] || [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [date]: next };
    });
  };
  const togglePersonal = (id, date) => {
    setPersonalByDate((prev) => {
      const list = prev[date] || [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [date]: next };
    });
  };

  // Render styled markers on Google Map instance
  useEffect(() => {
    if (!map || !window.google || !window.google.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    visibleSpots.forEach((spot) => {
      if (spot.latitude && spot.longitude) {
        const position = { lat: spot.latitude, lng: spot.longitude };
        const cat = spot.categories[0] || "Landmarks";
        const color = CATEGORY_COLORS[cat] || "#2B6E6E";

        const svgMarker = {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: color,
          fillOpacity: 1,
          scale: 8,
          strokeColor: "#FAF7F1",
          strokeWeight: 2,
        };

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: spot.name,
          icon: svgMarker,
        });

        marker.addListener("click", () => {
          setSelectedSpotId(spot.id === selectedSpotId ? null : spot.id);
          setMapMenuOpen(false);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
        hasPoints = true;
      }
    });

    relevantAccommodations.forEach((acc) => {
      if (acc.latitude && acc.longitude) {
        const position = { lat: acc.latitude, lng: acc.longitude };
        const isActive = acc.id === effectiveActiveId;

        const accMarker = {
          path: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
          fillColor: isActive ? "#1F2E35" : "#FFFFFF",
          fillOpacity: 1,
          scale: 1,
          strokeColor: isActive ? "#C98A2E" : "#8A8270",
          strokeWeight: 2,
        };

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: `Accommodation: ${acc.name}`,
          icon: accMarker,
          zIndex: isActive ? 10 : 5,
        });

        marker.addListener("click", () => {
          if (hasOverlap) setActiveAccommodationId(acc.id);
        });

        markersRef.current.push(marker);
        bounds.extend(position);
        hasPoints = true;
      }
    });

    if (hasPoints) {
      map.fitBounds(bounds);
    }
  }, [map, visibleSpots, relevantAccommodations, effectiveActiveId, selectedSpotId]);

  return (
    <div style={{ width: "100%" }}>
      <style>{`
        .cat-chip, .accom-chip, .spot-list-row { cursor: pointer; user-select: none; }
        .cat-chip:focus-visible, .accom-chip:focus-visible, .spot-list-row:focus-visible {
          outline: 2px solid #C98A2E;
          outline-offset: 2px;
        }
        .spot-list-row:hover { border-color: #C98A2E !important; }
      `}</style>

      {/* Category filter chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px", alignItems: "center" }}>
        {ALL_CATEGORIES.map((cat) => {
          const active = activeCategories.includes(cat);
          const color = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              className="cat-chip"
              onClick={() => toggleCategory(cat)}
              style={{
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: "11px",
                letterSpacing: "0.03em",
                padding: "6px 12px",
                borderRadius: "20px",
                border: `1.5px solid ${color}`,
                background: active ? color : "transparent",
                color: active ? "#FAF7F1" : color,
              }}
            >
              {cat}
            </button>
          );
        })}
        {activeCategories.length > 0 && (
          <button
            onClick={() => setActiveCategories([])}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              border: "none",
              background: "none",
              color: "#8A8270",
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "12px",
              cursor: "pointer",
              padding: "6px 4px",
            }}
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Map + side list */}
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Google Map container */}
        <div
          style={{
            position: "relative",
            flex: "1 1 560px",
            minWidth: "320px",
            aspectRatio: "4 / 3",
            borderRadius: "12px",
            border: "1px solid #E4DDCE",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(31,46,53,0.08)",
            background: "#E2E8F0",
          }}
        >
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

          {/* Accommodation overlay */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 6,
              background: "#FAF7F1",
              border: "1px solid #E4DDCE",
              borderRadius: "10px",
              padding: "10px 12px",
              boxShadow: "0 2px 8px rgba(31,46,53,0.12)",
              maxWidth: "220px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                fontSize: "10px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#8A8270",
                marginBottom: "6px",
              }}
            >
              <Home size={11} strokeWidth={2} />
              Accommodation
            </div>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: "100%",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "12.5px",
                color: "#1F2E35",
                border: "1px solid #E4DDCE",
                borderRadius: "6px",
                padding: "5px 7px",
                marginBottom: "8px",
                background: "#FFFFFF",
              }}
            >
              {TRIP_DATES.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>

            {relevantAccommodations.length === 0 && (
              <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: "12px", color: "#A99F8B" }}>
                No Accommodation set for {selectedDate}.
              </div>
            )}

            {!hasOverlap && relevantAccommodations.length === 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  color: "#1F2E35",
                }}
              >
                <Home size={12} strokeWidth={2} />
                {relevantAccommodations[0].name}
              </div>
            )}

            {hasOverlap && (
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: "11px",
                    color: "#8A6017",
                    marginBottom: "5px",
                  }}
                >
                  2 overlap — set active:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {relevantAccommodations.map((a) => {
                    const active = a.id === effectiveActiveId;
                    return (
                      <button
                        key={a.id}
                        className="accom-chip"
                        onClick={() => setActiveAccommodationId(a.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: "12px",
                          fontWeight: 500,
                          padding: "5px 9px",
                          borderRadius: "6px",
                          border: `1.5px solid ${active ? "#1F2E35" : "#E4DDCE"}`,
                          background: active ? "#1F2E35" : "#FFFFFF",
                          color: active ? "#FAF7F1" : "#1F2E35",
                          textAlign: "left",
                        }}
                      >
                        <Home size={11} strokeWidth={2} />
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Selected Spot Popover Card */}
          {selectedSpot && (
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "#FFFFFF",
                border: "1px solid #E4DDCE",
                borderRadius: "10px",
                padding: "12px 14px",
                width: "240px",
                boxShadow: "0 6px 18px rgba(31,46,53,0.25)",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontWeight: 600,
                      fontSize: "13.5px",
                      color: "#1F2E35",
                      marginBottom: "2px",
                    }}
                  >
                    {selectedSpot.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontSize: "10.5px",
                      color: "#8A8270",
                    }}
                  >
                    <MapPin size={10} strokeWidth={2} />
                    {selectedSpot.address}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSpotId(null)}
                  style={{ border: "none", background: "none", cursor: "pointer", color: "#8A8270", padding: 0 }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "8px" }}>
                {selectedSpot.categories.map((c) => (
                  <StampBadge key={c} label={c} />
                ))}
              </div>

              <AddToPlanControl
                date={selectedDate}
                inShared={isInShared(selectedSpot.id, selectedDate)}
                inPersonal={isInPersonal(selectedSpot.id, selectedDate)}
                isOpen={mapMenuOpen}
                onToggleOpen={() => setMapMenuOpen((v) => !v)}
                onToggleShared={() => toggleShared(selectedSpot.id, selectedDate)}
                onTogglePersonal={() => togglePersonal(selectedSpot.id, selectedDate)}
              />
            </div>
          )}
        </div>

        {/* Side list */}
        <div style={{ flex: "0 0 280px", minWidth: "240px" }}>
          <div
            style={{
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: "11px",
              color: "#A99F8B",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {visibleSpots.length} Spots shown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {visibleSpots.map((spot) => {
              const isSelected = spot.id === selectedSpotId;
              return (
                <div
                  key={spot.id}
                  className="spot-list-row"
                  tabIndex={0}
                  onMouseEnter={() => setHoveredSpotId(spot.id)}
                  onMouseLeave={() => setHoveredSpotId(null)}
                  onClick={() => {
                    setMapMenuOpen(false);
                    setSelectedSpotId(spot.id === selectedSpotId ? null : spot.id);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#FFFFFF",
                    border: `1.5px solid ${isSelected ? "#C98A2E" : "#E4DDCE"}`,
                    borderRadius: "8px",
                    padding: "8px 10px",
                  }}
                >
                  <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: CATEGORY_COLORS[spot.categories[0]] || "#2B6E6E",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontWeight: 500,
                        fontSize: "13px",
                        color: "#1F2E35",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {spot.name}
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <AddToPlanControl
                      date={selectedDate}
                      inShared={isInShared(spot.id, selectedDate)}
                      inPersonal={isInPersonal(spot.id, selectedDate)}
                      isOpen={listMenuOpenId === spot.id}
                      onToggleOpen={() => setListMenuOpenId((cur) => (cur === spot.id ? null : spot.id))}
                      onToggleShared={() => toggleShared(spot.id, selectedDate)}
                      onTogglePersonal={() => togglePersonal(spot.id, selectedDate)}
                      compact
                    />
                  </div>
                </div>
              );
            })}
            {visibleSpots.length === 0 && (
              <div
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: "12.5px",
                  color: "#A99F8B",
                  padding: "10px 4px",
                }}
              >
                No Spots match the selected Categories.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
