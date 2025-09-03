"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f0f0",
        border: "1px solid var(--line)",
        borderRadius: "10px",
      }}
    >
      Loading map...
    </div>
  ),
});

interface PropertyMapProps {
  address?: string;
  onAreaMeasured: (area: number) => void;
}

export default function PropertyMap({
  address,
  onAreaMeasured,
}: PropertyMapProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [measuredArea, setMeasuredArea] = useState(0);

  const handleAreaMeasured = (area: number) => {
    setMeasuredArea(area);
  };

  const handleSaveArea = () => {
    onAreaMeasured(measuredArea);
    setIsOpen(false);
  };

  return (
    <>
      <div className="map-toggle">
        <button
          type="button"
          className="map-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Close map" : "Measure on map"}
        </button>
      </div>

      {isOpen && (
        <div className="map-wrap open">
          <div className="map-instructions">
            Draw a polygon around your property
          </div>
          <LeafletMap address={address} onAreaMeasured={handleAreaMeasured} />
          <div className="map-results">
            <div className="measured-value">
              <span>{measuredArea.toLocaleString()}</span> sq ft
            </div>
            <button
              className="btn-save"
              type="button"
              onClick={handleSaveArea}
              disabled={measuredArea === 0}
            >
              Save to area field
            </button>
          </div>
        </div>
      )}
    </>
  );
}
