import { MapPin, ExternalLink } from "lucide-react";
import SpotPhoto from "@/components/trip/SpotPhoto";

const PROVIDER_LABELS = {
    google: "Google Maps",
    apple: "Apple Maps",
};

export default function SpotCard({ spot, view }) {
    const categories = spot.categories || [];

    return (
        <div
            style={{
                background: "#FFFFFF",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                padding: view === "grid" ? "18px" : "16px 20px",
                display: "flex",
                flexDirection: view === "grid" ? "column" : "row",
                alignItems: view === "grid" ? "stretch" : "center",
                gap: view === "grid" ? "10px" : "20px",
            }}
        >
            <SpotPhoto spot={spot} width={view === "grid" ? "100%" : "80px"} height={view === "grid" ? "140px" : "80px"} />
            <div style={{ flex: view === "list" ? "1" : undefined, minWidth: 0 }}>
                <div
                    style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontWeight: 600,
                        fontSize: "15px",
                        color: "var(--color-ink)",
                        marginBottom: "3px",
                    }}
                >
                    {spot.name}
                </div>
                {spot.address && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontFamily: "var(--font-ibm-plex-mono), monospace",
                            fontSize: "11.5px",
                            color: "var(--color-muted)",
                            marginBottom: categories.length > 0 ? "6px" : undefined,
                        }}
                    >
                        <MapPin size={11} strokeWidth={2} />
                        {spot.address}
                    </div>
                )}

                {categories.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "4px" }}>
                        {categories.map((cat) => (
                            <span
                                key={cat.id}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    background: `${cat.color}15`,
                                    color: cat.color,
                                    border: `1px solid ${cat.color}35`,
                                    borderRadius: "4px",
                                    padding: "2px 7px",
                                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                                    fontSize: "10px",
                                    fontWeight: 500,
                                }}
                            >
                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cat.color }} />
                                {cat.name}
                            </span>
                        ))}
                    </div>
                )}

                {spot.note && (
                    <div
                        style={{
                            fontFamily: "var(--font-inter), sans-serif",
                            fontStyle: "italic",
                            fontSize: "12.5px",
                            color: "var(--color-muted)",
                            marginTop: "4px",
                        }}
                    >
                        "{spot.note}"
                    </div>
                )}
            </div>

            <a
                href={spot.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    fontSize: "10.5px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--color-teal)",
                    textDecoration: "none",
                    marginLeft: view === "list" ? "auto" : undefined,
                    flexShrink: 0,
                }}
            >
                {PROVIDER_LABELS[spot.source_provider] || spot.source_provider}
                <ExternalLink size={11} strokeWidth={2} />
            </a>
        </div>
    );
}