"use client";

import { useState } from "react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

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

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onUpdate(newData);
  };

  const validate = () => {
    if (!localData.address.trim()) {
      alert("Please enter an address");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div>
      <h2>Property Details</h2>

      <div style={{ marginBottom: "24px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
        >
          Property Address
        </label>
        <AddressAutocomplete
          value={localData.address}
          onChange={(value) => handleInputChange("address", value)}
        />
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
        >
          Property Type
        </label>
        <div style={{ display: "flex", gap: "12px" }}>
          <label>
            <input
              type="radio"
              value="residential"
              checked={localData.propertyType === "residential"}
              onChange={(e) =>
                handleInputChange("propertyType", e.target.value)
              }
            />
            <span style={{ marginLeft: "8px" }}>Residential</span>
          </label>
          <label>
            <input
              type="radio"
              value="commercial"
              checked={localData.propertyType === "commercial"}
              onChange={(e) =>
                handleInputChange("propertyType", e.target.value)
              }
            />
            <span style={{ marginLeft: "8px" }}>Commercial</span>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label
          style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}
        >
          Capture Scope
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label>
            <input
              type="radio"
              value="interior"
              checked={localData.captureScope === "interior"}
              onChange={(e) =>
                handleInputChange("captureScope", e.target.value)
              }
            />
            <span style={{ marginLeft: "8px" }}>Interior Only</span>
            {localData.captureScope === "interior" && (
              <input
                type="number"
                placeholder="Square footage"
                value={localData.areaInt}
                onChange={(e) => handleInputChange("areaInt", e.target.value)}
                style={{ marginLeft: "16px", padding: "4px 8px" }}
              />
            )}
          </label>
          <label>
            <input
              type="radio"
              value="exterior"
              checked={localData.captureScope === "exterior"}
              onChange={(e) =>
                handleInputChange("captureScope", e.target.value)
              }
            />
            <span style={{ marginLeft: "8px" }}>Exterior Only</span>
            {localData.captureScope === "exterior" && (
              <input
                type="number"
                placeholder="Square footage"
                value={localData.areaExt}
                onChange={(e) => handleInputChange("areaExt", e.target.value)}
                style={{ marginLeft: "16px", padding: "4px 8px" }}
              />
            )}
          </label>
          <label>
            <input
              type="radio"
              value="interior-exterior"
              checked={localData.captureScope === "interior-exterior"}
              onChange={(e) =>
                handleInputChange("captureScope", e.target.value)
              }
            />
            <span style={{ marginLeft: "8px" }}>Interior & Exterior</span>
            {localData.captureScope === "interior-exterior" && (
              <div style={{ marginLeft: "24px", marginTop: "8px" }}>
                <input
                  type="number"
                  placeholder="Interior sq ft"
                  value={localData.areaBothInt}
                  onChange={(e) =>
                    handleInputChange("areaBothInt", e.target.value)
                  }
                  style={{ padding: "4px 8px", marginRight: "8px" }}
                />
                <input
                  type="number"
                  placeholder="Exterior sq ft"
                  value={localData.areaBothExt}
                  onChange={(e) =>
                    handleInputChange("areaBothExt", e.target.value)
                  }
                  style={{ padding: "4px 8px" }}
                />
              </div>
            )}
          </label>
        </div>
      </div>

      <button
        onClick={handleNext}
        style={{
          padding: "12px 24px",
          background: "#db0f83",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        Next
      </button>
    </div>
  );
}
