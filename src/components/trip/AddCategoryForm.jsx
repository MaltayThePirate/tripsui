"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus } from "lucide-react";
import { apiPost } from "@/lib/api";

export default function AddCategoryForm({ tripId, onClose }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4A6FA5");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ name, color }) =>
      apiPost(`/trips/${tripId}/categories`, { category: { name, color } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId, "categories"] });
      setName("");
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutation.mutate({ name: name.trim(), color });
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E4DDCE",
        borderRadius: "10px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#8A8270",
          }}
        >
          Add Custom Category
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ border: "none", background: "none", color: "#A99F8B", cursor: "pointer", display: "flex" }}
        >
          <X size={15} strokeWidth={2} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name (e.g. Karaoke)"
            disabled={mutation.isPending}
            style={{
              flex: 1,
              border: "1px solid #E4DDCE",
              borderRadius: "8px",
              padding: "10px 12px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "13.5px",
              color: "#1F2E35",
              boxSizing: "border-box",
            }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={mutation.isPending}
            title="Choose category color"
            style={{
              width: "42px",
              height: "42px",
              border: "1px solid #E4DDCE",
              borderRadius: "8px",
              padding: "2px",
              background: "#FFFFFF",
              cursor: "pointer",
            }}
          />
        </div>

        {mutation.isError && (
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12.5px",
              color: "#B8462F",
              marginBottom: "10px",
            }}
          >
            {mutation.error.message}
          </div>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || !name.trim()}
          style={{
            width: "100%",
            background: mutation.isPending || !name.trim() ? "#E4DDCE" : "#1F2E35",
            color: mutation.isPending || !name.trim() ? "#A99F8B" : "#FAF7F1",
            border: "none",
            borderRadius: "8px",
            padding: "10px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "13.5px",
            cursor: mutation.isPending || !name.trim() ? "not-allowed" : "pointer",
          }}
        >
          {mutation.isPending ? "Creating..." : "Create Category"}
        </button>
      </form>
    </div>
  );
}
