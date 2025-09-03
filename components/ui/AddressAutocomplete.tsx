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
    <div className="ac-wrap relative" ref={inputRef}>
      <input
        id="address"
        className="input w-full border rounded p-2"
        type="text"
        placeholder="Start typing your address..."
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoComplete="street-address"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-owns="addr-list"
        aria-controls="addr-list"
        role="combobox"
        required
      />
      {isOpen && suggestions.length > 0 && (
        <div
          id="addr-list"
          className="ac-panel absolute bg-white border rounded shadow-md w-full mt-1 z-10"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => {
            const { primary, secondary } = formatAddress(suggestion);
            return (
              <div
                key={suggestion.place_id || index}
                className={`ac-item p-2 cursor-pointer hover:bg-gray-100 ${
                  index === activeIndex ? "bg-gray-100" : ""
                }`}
                onClick={() => selectSuggestion(suggestion)}
                role="option"
                aria-selected={index === activeIndex}
              >
                <div className="ac-text">
                  <div className="ac-title font-medium">{primary}</div>
                  <div className="ac-sub text-sm text-gray-500">
                    {secondary}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
