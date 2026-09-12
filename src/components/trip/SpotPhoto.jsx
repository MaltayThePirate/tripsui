import { useState } from "react";

export default function SpotPhoto({ spot, width = "100%", height = "140px" }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <img
      src={`${process.env.NEXT_PUBLIC_API_URL}/trips/${spot.trip_id}/spots/${spot.id}/photo`}
      alt={spot.name}
      onError={() => setFailed(true)}
      style={{
        width,
        height,
        objectFit: "cover",
        borderRadius: "8px",
        flexShrink: 0,
      }}
    />
  );
}