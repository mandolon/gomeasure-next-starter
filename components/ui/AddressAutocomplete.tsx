// components/ui/AddressAutocomplete.tsx
"use client";

import { useState, useRef, useEffect } from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

interface Suggestion {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

export default function AddressAutocomplete({
  value,
  onChange,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (newValue.length > 3) {
      debounceTimer.current = setTimeout(() => {
        searchAddress(newValue);
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const searchAddress = async (query: string) => {
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) return;
      const data: Suggestion[] = await response.json();

      const filtered = data.filter((d) => {
        const a = d.address || {};
        return (
          (a.house_number || a.road) &&
          (a.city || a.town || a.village) &&
          a.state === "California"
        );
      });

      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } catch {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.display_name);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatAddress = (suggestion: Suggestion) => {
    const a = suggestion.address || {};
    const primary =
      `${a.house_number || ""} ${a.road || ""}`.trim() ||
      suggestion.display_name.split(",")[0];
    const city = a.city || a.town || a.village || "";
    const zip = a.postcode || "";
    const secondary = [city, zip].filter(Boolean).join(", ");
    return { primary, secondary };
  };

  return (
    <div className="ac-wrap" ref={inputRef}>
      <input
        id="address"
        className="input"
        type="text"
        placeholder="Start typing your address..."
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoComplete="street-address"
        role="combobox"
        aria-expanded={isOpen}
      />
      {isOpen && suggestions.length > 0 && (
        <div className="ac-panel" role="listbox">
          {suggestions.map((s, idx) => {
            const { primary, secondary } = formatAddress(s);
            return (
              <div
                key={s.place_id || idx}
                className={`ac-item ${idx === activeIndex ? "is-active" : ""}`}
                onClick={() => selectSuggestion(s)}
                role="option"
                aria-selected={idx === activeIndex}
              >
                <svg
                  className="ac-icon"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ac-text">
                  <div className="ac-title">{primary}</div>
                  <div className="ac-sub">{secondary}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
