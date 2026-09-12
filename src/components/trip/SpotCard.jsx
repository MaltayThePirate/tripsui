import { MapPin, ExternalLink } from "lucide-react";
import SpotPhoto from "@/components/trip/SpotPhoto";

const PROVIDER_LABELS = {
    google: "Google Maps",
    apple: "Apple Maps",
};

export default function SpotCard({ spot, view }) {
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
            <div style={{ flex: view === "list" ? "0 0 220px" : undefined, minWidth: 0 }}>
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
                        }}
                    >
                        <MapPin size={11} strokeWidth={2} />
                        {spot.address}
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