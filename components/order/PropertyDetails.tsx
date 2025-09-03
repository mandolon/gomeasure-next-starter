"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

const PropertyMap = dynamic(() => import("@/components/map/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: "400px", background: "#f0f0f0", borderRadius: "10px" }}
    />
  ),
});

interface PropertyDetailsProps {
  formData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

export default function PropertyDetails({
  formData,
  onUpdate,
  onNext,
}: PropertyDetailsProps) {
  const [localData, setLocalData] = useState({
    address: "",
    propertyType: "residential",
    captureScope: "interior",
    areaInt: "",
    areaExt: "",
    areaBothInt: "",
    areaBothExt: "",
    ...formData,
  });
  const [showMap, setShowMap] = useState(false);
  const [mapArea, setMapArea] = useState(0);
  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdate(newData);
    setErrors({ ...errors, [field]: false });
  };

  const handleMapAreaSave = () => {
    if (!mapArea) return;
    const scope = localData.captureScope;

    if (scope === "interior-exterior") {
      if (!localData.areaBothInt) {
        handleInputChange("areaBothInt", mapArea.toString());
      } else {
        handleInputChange("areaBothExt", mapArea.toString());
      }
    } else if (scope === "interior") {
      handleInputChange("areaInt", mapArea.toString());
    } else {
      handleInputChange("areaExt", mapArea.toString());
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!localData.address.trim()) newErrors.address = true;

    if (localData.captureScope === "interior" && !Number(localData.areaInt)) {
      newErrors.areaInt = true;
    } else if (
      localData.captureScope === "exterior" &&
      !Number(localData.areaExt)
    ) {
      newErrors.areaExt = true;
    } else if (localData.captureScope === "interior-exterior") {
      if (!Number(localData.areaBothInt)) newErrors.areaBothInt = true;
      if (!Number(localData.areaBothExt)) newErrors.areaBothExt = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <>
      <div className="section-header">
        <div className="section-number">1</div>
        <div className="section-title">Property Address</div>
      </div>

      <AddressAutocomplete
        value={localData.address}
        onChange={(value) => handleInputChange("address", value)}
        onError={(hasError) => setErrors({ ...errors, address: hasError })}
      />

      <div className="section-header">
        <div className="section-number">2</div>
        <div className="section-title">Property Type</div>
      </div>

      <div className="choices choices--2x">
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            id="prop-res"
            value="residential"
            checked={localData.propertyType === "residential"}
            onChange={(e) => handleInputChange("propertyType", e.target.value)}
          />
          <label className="choice" htmlFor="prop-res">
            <span className="dot-sel"></span>
            <span className="title">Residential</span>
          </label>
        </div>
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            id="prop-com"
            value="commercial"
            checked={localData.propertyType === "commercial"}
            onChange={(e) => handleInputChange("propertyType", e.target.value)}
          />
          <label className="choice" htmlFor="prop-com">
            <span className="dot-sel"></span>
            <span className="title">Commercial</span>
          </label>
        </div>
      </div>

      <div className="section-header">
        <div className="section-number">3</div>
        <div className="section-title">What would you like captured?</div>
      </div>

      <div className="choices choices--2x">
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            id="cap-int"
            value="interior"
            checked={localData.captureScope === "interior"}
            onChange={(e) => handleInputChange("captureScope", e.target.value)}
          />
          <label className="choice" htmlFor="cap-int">
            <span className="dot-sel"></span>
            <svg className="icon" viewBox="0 0 64 64">
              <path
                d="M8 50 V18 l24-10 24 10 v32 H8z M8 26 h48"
                strokeWidth="2"
                fill="none"
                stroke="var(--accent)"
              />
              <path
                d="M20 34 h12 v12 H20z"
                strokeWidth="2"
                fill="none"
                stroke="var(--accent)"
              />
            </svg>
            <div>
              <div className="title">Interior Only</div>
              <div className="desc">
                3D capture of interior rooms and circulation. Fast and precise
                for planning + measurements.
              </div>
              <div
                className="area-row"
                style={{
                  display:
                    localData.captureScope === "interior" ? "flex" : "none",
                }}
              >
                <input
                  className={`input mini ${errors.areaInt ? "error" : ""}`}
                  type="number"
                  placeholder="Enter area"
                  value={localData.areaInt}
                  onChange={(e) => handleInputChange("areaInt", e.target.value)}
                />
                <span className="unit">sq ft</span>
              </div>
            </div>
          </label>
        </div>

        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            id="cap-ext"
            value="exterior"
            checked={localData.captureScope === "exterior"}
            onChange={(e) => handleInputChange("captureScope", e.target.value)}
          />
          <label className="choice" htmlFor="cap-ext">
            <span className="dot-sel"></span>
            <svg className="icon" viewBox="0 0 64 64">
              <path
                d="M8 44 V28 l12-8 12 8 v16z M40 40 l10-6 8 6 v6 H40z"
                strokeWidth="2"
                fill="none"
                stroke="var(--accent)"
              />
            </svg>
            <div>
              <div className="title">Exterior Only</div>
              <div className="desc">
                3D capture of facades and site context—ideal for elevations,
                setbacks, and envelope checks.
              </div>
              <div
                className="area-row"
                style={{
                  display:
                    localData.captureScope === "exterior" ? "flex" : "none",
                }}
              >
                <input
                  className={`input mini ${errors.areaExt ? "error" : ""}`}
                  type="number"
                  placeholder="Enter area"
                  value={localData.areaExt}
                  onChange={(e) => handleInputChange("areaExt", e.target.value)}
                />
                <span className="unit">sq ft</span>
              </div>
            </div>
          </label>
        </div>

        <div className="choice-wrap span-2">
          <input
            className="choice-input"
            type="radio"
            id="cap-both"
            value="interior-exterior"
            checked={localData.captureScope === "interior-exterior"}
            onChange={(e) => handleInputChange("captureScope", e.target.value)}
          />
          <label className="choice" htmlFor="cap-both">
            <span className="dot-sel"></span>
            <svg className="icon" viewBox="0 0 64 64">
              <path
                d="M6 50 V26 l14-10 14 10 v24z M34 42 l10-8 14 8 v8 H34z M6 50 h52"
                strokeWidth="2"
                fill="none"
                stroke="var(--accent)"
              />
            </svg>
            <div>
              <div className="title">Interior & Exterior</div>
              <div className="desc">
                Complete capture—interior spaces plus walkable exterior for
                coordination and BIM-ready context.
              </div>
              <div
                className="area-row area-row--split"
                style={{
                  display:
                    localData.captureScope === "interior-exterior"
                      ? "grid"
                      : "none",
                }}
              >
                <label className="mini-field">
                  <span className="labelline">
                    <strong>Interior</strong>
                    <em className="unit-top">(sq ft)</em>
                  </span>
                  <input
                    className={`input mini ${errors.areaBothInt ? "error" : ""}`}
                    type="number"
                    placeholder="Enter area"
                    value={localData.areaBothInt}
                    onChange={(e) =>
                      handleInputChange("areaBothInt", e.target.value)
                    }
                  />
                </label>
                <label className="mini-field">
                  <span className="labelline">
                    <strong>Exterior</strong>
                    <em className="unit-top">(sq ft)</em>
                  </span>
                  <input
                    className={`input mini ${errors.areaBothExt ? "error" : ""}`}
                    type="number"
                    placeholder="Enter area"
                    value={localData.areaBothExt}
                    onChange={(e) =>
                      handleInputChange("areaBothExt", e.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="map-toggle">
        <button
          className="map-toggle-btn"
          type="button"
          onClick={() => setShowMap(!showMap)}
        >
          Measure on map
        </button>
      </div>

      {showMap && (
        <div className="map-wrap open">
          <div className="map-instructions">
            Draw a polygon around your property
          </div>
          <div style={{ height: "400px" }}>
            <PropertyMap
              onAreaMeasured={setMapArea}
              address={localData.address}
            />
          </div>
          <div className="map-results">
            <div className="measured-value">
              <span>{mapArea.toLocaleString()}</span> sq ft
            </div>
            <button
              className="btn-save"
              type="button"
              onClick={handleMapAreaSave}
              disabled={mapArea === 0}
            >
              Save to area field
            </button>
          </div>
        </div>
      )}

      <div className="hint">
        <a
          href="#"
          className="underline"
          onClick={(e) => {
            e.preventDefault();
            alert("Demo: open article on estimating property size.");
          }}
        >
          How to estimate property size
        </a>
      </div>

      <div className="actions">
        <button className="btn btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </>
  );
}
