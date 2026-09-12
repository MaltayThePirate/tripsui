import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { apiPost } from "@/lib/api";

export default function AddSpotForm({ tripId, onClose }) {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ sourceUrl, note }) =>
      apiPost(`/trips/${tripId}/spots`, { spot: { source_url: sourceUrl, note } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trip", tripId, "spots"] });
      setUrl("");
      setNote("");
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    mutation.mutate({ sourceUrl: url.trim(), note: note.trim() });
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
          marginBottom: "10px",
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
          Add a Spot
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
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a Google or Apple Maps link"
          disabled={mutation.isPending}
          style={{
            width: "100%",
            border: "1px solid #E4DDCE",
            borderRadius: "8px",
            padding: "10px 12px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13.5px",
            color: "#1F2E35",
            marginBottom: "10px",
            boxSizing: "border-box",
          }}
        />

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note — reservation details, why you added it, etc."
          disabled={mutation.isPending}
          rows={3}
          style={{
            width: "100%",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "10px 12px",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "13.5px",
            color: "var(--color-ink)",
            marginBottom: "10px",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />

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
          disabled={mutation.isPending || !url.trim()}
          style={{
            width: "100%",
            background: mutation.isPending || !url.trim() ? "#E4DDCE" : "#1F2E35",
            color: mutation.isPending || !url.trim() ? "#A99F8B" : "#FAF7F1",
            border: "none",
            borderRadius: "8px",
            padding: "10px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: "13.5px",
            cursor: mutation.isPending || !url.trim() ? "not-allowed" : "pointer",
          }}
        >
          {mutation.isPending ? "Adding..." : "Add Spot"}
        </button>
      </form>
    </div>
  );
}