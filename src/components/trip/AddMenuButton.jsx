"use client";

import { MapPin, Plane, Home, Plus, Users } from "lucide-react";

const ADD_MENU_ITEMS = [
  { key: "spot", label: "Add a Spot", icon: MapPin },
  { key: "flight", label: "Add Flight Details", icon: Plane },
  { key: "accommodation", label: "Add Accommodation", icon: Home },
  { key: "attendees", label: "Add Attendee(s)", icon: Users },
];

export default function AddMenuButton({ isOpen, onToggleOpen, onSelect, size = "default" }) {
  const isLarge = size === "large";

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={onToggleOpen}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--color-ink)",
          color: "var(--color-parchment)",
          border: "none",
          borderRadius: "8px",
          padding: isLarge ? "12px 22px" : "10px 16px",
          fontFamily: "var(--font-inter), sans-serif",
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
            border: "1px solid var(--color-border)",
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
              className="add-menu-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                width: "100%",
                border: "none",
                background: "none",
                color: "var(--color-ink)",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "13px",
                padding: "9px 10px",
                borderRadius: "7px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Icon size={15} strokeWidth={2} color="var(--color-teal)" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}