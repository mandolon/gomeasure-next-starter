"use client";

import { useState } from "react";
import PropertyMap from "@/components/map/PropertyMap";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

interface PropertyDetailsProps {
  formData?: any;
  onUpdate?: (data: any) => void;
  onNext?: () => void;
}

export default function PropertyDetails({
  formData = {},
  onUpdate = () => {},
  onNext = () => {},
}: PropertyDetailsProps) {
  const [localData, setLocalData] = useState({
    address: "",
    propertyType: "residential",
    captureScope: "interior",
    areaInt: 0,
    areaExt: 0,
    areaBothInt: 0,
    areaBothExt: 0,
    ...formData,
  });

  // signal used to auto-open the map when an address is selected
  const [openMapSignal, setOpenMapSignal] = useState(0);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdate(newData);
  };

  const handleAreaFromMap = (area: number) => {
    const scope = localData.captureScope;
    if (scope === "interior") {
      handleInputChange("areaInt", area);
    } else if (scope === "exterior") {
      handleInputChange("areaExt", area);
    } else if (scope === "interior-exterior") {
      handleInputChange("areaBothExt", area);
    }
  };

  const handleNext = () => {
    if (!localData.address) {
      alert("Please enter an address");
      return;
    }
    onNext();
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-number">1</div>
        <div className="section-title">Property Address</div>
      </div>

      <AddressAutocomplete
        value={localData.address}
        onChange={(value) => handleInputChange("address", value)}
        onSelect={(full) => {
          handleInputChange("address", full);
          // bump the signal so the map opens and drops the pin (like original HTML)
          setOpenMapSignal((n) => n + 1);
        }}
      />

      <div className="section-header">
        <div className="section-number">2</div>
        <div className="section-title">Property Type</div>
      </div>
      <div
        className="choices choices--2x"
        role="radiogroup"
        aria-label="Property type"
      >
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            name="propType"
            id="prop-res"
            value="residential"
            checked={localData.propertyType === "residential"}
            onChange={(e) => handleInputChange("propertyType", e.target.value)}
          />
          <label className="choice" htmlFor="prop-res">
            <span className="dot-sel" aria-hidden="true"></span>
            <span className="title">Residential</span>
          </label>
        </div>
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            name="propType"
            id="prop-com"
            value="commercial"
            checked={localData.propertyType === "commercial"}
            onChange={(e) => handleInputChange("propertyType", e.target.value)}
          />
          <label className="choice" htmlFor="prop-com">
            <span className="dot-sel" aria-hidden="true"></span>
            <span className="title">Commercial</span>
          </label>
        </div>
      </div>

      <div className="section-header">
        <div className="section-number">3</div>
        <div className="section-title">What would you like captured?</div>
      </div>

      <div
        className="choices choices--2x"
        role="radiogroup"
        aria-label="Capture scope"
      >
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            name="capScope"
            id="cap-int"
            value="interior"
            checked={localData.captureScope === "interior"}
            onChange={(e) => handleInputChange("captureScope", e.target.value)}
          />
          <label className="choice" htmlFor="cap-int">
            <span className="dot-sel" aria-hidden="true"></span>
            <svg className="icon" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M8 50 V18 l24-10 24 10 v32 H8z M8 26 h48" strokeWidth="2" />
              <path d="M20 34 h12 v12 H20z" strokeWidth="2" />
            </svg>
            <div>
              <div className="title">Interior Only</div>
              <div className="desc">
                3D capture of interior rooms and circulation. Fast and precise
                for planning + measurements.
              </div>
              <div className="area-row">
                <input
                  id="area-int"
                  className="input mini"
                  type="number"
                  inputMode="numeric"
                  placeholder="Enter area"
                  min="0"
                  value={localData.areaInt || ""}
                  onChange={(e) =>
                    handleInputChange("areaInt", Number(e.target.value))
                  }
                />
                <span className="unit">sq&nbsp;ft</span>
              </div>
            </div>
          </label>
        </div>

        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            name="capScope"
            id="cap-ext"
            value="exterior"
            checked={localData.captureScope === "exterior"}
            onChange={(e) => handleInputChange("captureScope", e.target.value)}
          />
          <label className="choice" htmlFor="cap-ext">
            <span className="dot-sel" aria-hidden="true"></span>
            <svg className="icon" viewBox="0 0 64 64" aria-hidden="true">
              <path
                d="M8 44 V28 l12-8 12 8 v16z M40 40 l10-6 8 6 v6 H40z"
                strokeWidth="2"
              />
            </svg>
            <div>
              <div className="title">Exterior Only</div>
              <div className="desc">
                3D capture of facades and site context—ideal for elevations,
                setbacks, and envelope checks.
              </div>
              <div className="area-row">
                <input
                  id="area-ext"
                  className="input mini"
                  type="number"
                  inputMode="numeric"
                  placeholder="Enter area"
                  min="0"
                  value={localData.areaExt || ""}
                  onChange={(e) =>
                    handleInputChange("areaExt", Number(e.target.value))
                  }
                />
                <span className="unit">sq&nbsp;ft</span>
              </div>
            </div>
          </label>
        </div>

        <div className="choice-wrap span-2">
          <input
            className="choice-input"
            type="radio"
            name="capScope"
            id="cap-both"
            value="interior-exterior"
            checked={localData.captureScope === "interior-exterior"}
            onChange={(e) => handleInputChange("captureScope", e.target.value)}
          />
          <label className="choice" htmlFor="cap-both">
            <span className="dot-sel" aria-hidden="true"></span>
            <svg className="icon" viewBox="0 0 64 64" aria-hidden="true">
              <path
                d="M6 50 V26 l14-10 14 10 v24z M34 42 l10-8 14 8 v8 H34z M6 50 h52"
                strokeWidth="2"
              />
            </svg>
            <div>
              <div className="title">Interior &amp; Exterior</div>
              <div className="desc">
                Complete capture—interior spaces plus walkable exterior for
                coordination and BIM-ready context.
              </div>
              <div className="area-row area-row--split">
                <label className="mini-field" htmlFor="area-both-int">
                  <span className="labelline">
                    <strong>Interior</strong>
                    <em className="unit-top">(sq ft)</em>
                  </span>
                  <input
                    id="area-both-int"
                    className="input mini"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter area"
                    min="0"
                    value={localData.areaBothInt || ""}
                    onChange={(e) =>
                      handleInputChange("areaBothInt", Number(e.target.value))
                    }
                  />
                </label>

                <label className="mini-field" htmlFor="area-both-ext">
                  <span className="labelline">
                    <strong>Exterior</strong>
                    <em className="unit-top">(sq ft)</em>
                  </span>
                  <input
                    id="area-both-ext"
                    className="input mini"
                    type="number"
                    inputMode="numeric"
                    placeholder="Enter area"
                    min="0"
                    value={localData.areaBothExt || ""}
                    onChange={(e) =>
                      handleInputChange("areaBothExt", Number(e.target.value))
                    }
                  />
                </label>
              </div>
            </div>
          </label>
        </div>
      </div>

      <PropertyMap
        address={localData.address}
        onAreaMeasured={handleAreaFromMap}
        openSignal={openMapSignal}
      />

      <div className="hint">
        <a
          href="#"
          className="underline"
          onClick={(e) => {
            e.preventDefault();
            alert("Property size estimation guide would go here");
          }}
        >
          How to estimate property size
        </a>
      </div>

      <div className="desktop-actions">
        <button className="btn btn-primary" type="button" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
