"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

async function createTrip(tripData) {
  const response = await fetch("http://localhost:3001/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trip: tripData }),
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(body.errors?.join(", ") || "Failed to create trip");
  }

  return response.json();
}

export default function TripCreationPage() {
  const router = useRouter();
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const submitMutation = useMutation({
    mutationFn: (tripData) => apiPost("/trips", { trip: tripData }),
    onSuccess: (trip) => {
      router.push(`/trips/${trip.id}`);
    },
  });

  const isValid =
    tripName.trim() !== "" && startDate !== "" && endDate !== "" && endDate >= startDate;

  const handleSubmit = () => {
    submitMutation.mutate({
      name: tripName.trim(),
      start_date: startDate,
      end_date: endDate,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#FFFFFF",
          border: "1px solid var(--color-border)",
          borderRadius: "14px",
          padding: "36px 32px",
          boxShadow: "0 2px 10px rgba(31,46,53,0.06)",
        }}
      >
        <div className="eyebrow-label" style={{ marginBottom: "6px" }}>
          New Trip
        </div>
        <h1
          style={{
            fontFamily: "var(--font-fraunces), serif",
            fontWeight: 600,
            fontSize: "26px",
            color: "var(--color-ink)",
            margin: "0 0 6px",
          }}
        >
          Where to, and when?
        </h1>
        <p
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "13px",
            color: "var(--color-muted)",
            margin: "0 0 26px",
            lineHeight: 1.5,
          }}
        >
          Give the Trip a name and set the Trip Window. You can add Spots, Flights, and Accommodations right after.
        </p>

        <label className="field-label">Trip Name</label>
        <input
          value={tripName}
          onChange={(e) => setTripName(e.target.value)}
          placeholder="e.g. Tokyo Trip"
          className="text-input"
          style={{ marginBottom: "20px" }}
        />

        <label className="field-label">Trip Window</label>
        <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-input"
            style={{ flex: 1 }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-input"
            style={{ flex: 1 }}
          />
        </div>

        {submitMutation.isError && (
          <p style={{ color: "var(--color-rust)", fontSize: "12.5px", margin: "0 0 16px" }}>
            {submitMutation.error.message}
          </p>
        )}

        <button
          disabled={!isValid || submitMutation.isPending}
          onClick={handleSubmit}
          style={{
            width: "100%",
            background: isValid ? "var(--color-ink)" : "var(--color-border)",
            color: isValid ? "var(--color-parchment)" : "var(--color-muted)",
            border: "none",
            borderRadius: "8px",
            padding: "12px",
            fontFamily: "var(--font-inter), sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            cursor: isValid ? "pointer" : "not-allowed",
            marginTop: "16px",
          }}
        >
          {submitMutation.isPending ? "Creating…" : "Create Trip"}
        </button>
      </div>
    </div>
  );
}