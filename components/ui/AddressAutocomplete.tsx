"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

// Comprehensive California city data with zip codes
const CALIFORNIA_CITIES = [
  {
    city: "Los Angeles",
    zips: [
      "90001",
      "90002",
      "90003",
      "90004",
      "90005",
      "90006",
      "90007",
      "90008",
      "90010",
      "90011",
      "90012",
      "90013",
      "90014",
      "90015",
      "90016",
      "90017",
      "90018",
      "90019",
      "90020",
      "90021",
    ],
  },
  {
    city: "San Francisco",
    zips: [
      "94102",
      "94103",
      "94104",
      "94105",
      "94107",
      "94108",
      "94109",
      "94110",
      "94111",
      "94112",
      "94114",
      "94115",
      "94116",
      "94117",
      "94118",
    ],
  },
  {
    city: "San Diego",
    zips: [
      "92101",
      "92102",
      "92103",
      "92104",
      "92105",
      "92106",
      "92107",
      "92108",
      "92109",
      "92110",
      "92111",
      "92113",
      "92114",
      "92115",
    ],
  },
  {
    city: "San Jose",
    zips: [
      "95110",
      "95111",
      "95112",
      "95113",
      "95116",
      "95117",
      "95118",
      "95119",
      "95120",
      "95121",
      "95122",
      "95123",
      "95124",
      "95125",
    ],
  },
  {
    city: "Sacramento",
    zips: [
      "95814",
      "95815",
      "95816",
      "95817",
      "95818",
      "95819",
      "95820",
      "95821",
      "95822",
      "95823",
      "95824",
      "95825",
      "95826",
      "95827",
    ],
  },
  {
    city: "Oakland",
    zips: [
      "94601",
      "94602",
      "94603",
      "94605",
      "94606",
      "94607",
      "94609",
      "94610",
      "94611",
      "94612",
      "94613",
      "94618",
      "94619",
      "94621",
    ],
  },
  {
    city: "Fresno",
    zips: [
      "93650",
      "93701",
      "93702",
      "93703",
      "93704",
      "93705",
      "93706",
      "93710",
      "93711",
      "93720",
      "93721",
      "93722",
      "93726",
      "93727",
    ],
  },
  {
    city: "Long Beach",
    zips: [
      "90802",
      "90803",
      "90804",
      "90805",
      "90806",
      "90807",
      "90808",
      "90809",
      "90810",
      "90813",
      "90814",
      "90815",
    ],
  },
  {
    city: "Anaheim",
    zips: ["92801", "92802", "92804", "92805", "92806", "92807", "92808"],
  },
  {
    city: "Bakersfield",
    zips: [
      "93301",
      "93304",
      "93305",
      "93306",
      "93307",
      "93308",
      "93309",
      "93311",
      "93312",
      "93313",
      "93314",
    ],
  },
];

// Common street names - expanded list
const STREET_NAMES = [
  "Main",
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
  "Oak",
  "Pine",
  "Maple",
  "Cedar",
  "Elm",
  "Washington",
  "Park",
  "Market",
  "Broadway",
  "Mission",
  "Spring",
  "Grove",
  "Hill",
  "Lake",
  "Union",
  "Central",
  "High",
  "Church",
  "State",
  "Front",
  "River",
  "Center",
  "North",
  "South",
  "East",
  "West",
  "Sunset",
  "Ocean",
  "Beach",
  "Vista",
  "Mountain",
  "Valley",
  "Lincoln",
  "Jefferson",
  "Madison",
  "Monroe",
  "Jackson",
  "Harrison",
  "Tyler",
  "Polk",
  "Taylor",
  "Grant",
  "Wilson",
  "Roosevelt",
  "Adams",
  "Franklin",
  "Hamilton",
];

const STREET_TYPES = [
  { short: "St", long: "Street" },
  { short: "Ave", long: "Avenue" },
  { short: "Blvd", long: "Boulevard" },
  { short: "Dr", long: "Drive" },
  { short: "Rd", long: "Road" },
  { short: "Ln", long: "Lane" },
  { short: "Way", long: "Way" },
  { short: "Ct", long: "Court" },
  { short: "Pl", long: "Place" },
  { short: "Cir", long: "Circle" },
  { short: "Ter", long: "Terrace" },
  { short: "Pkwy", long: "Parkway" },
];

interface Suggestion {
  id: string;
  address: string;
  city: string;
  zip: string;
  fullAddress: string;
  confidence: number;
}

export default function AddressAutocomplete({
  value,
  onChange,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showNoResults, setShowNoResults] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Enhanced suggestion generation with fuzzy matching
  const generateSuggestions = useMemo(() => {
    return (input: string): Suggestion[] => {
      if (input.length < 2) return [];

      const suggestions: Suggestion[] = [];
      const lowerInput = input.toLowerCase().trim();
      const parts = input.trim().split(/\s+/);

      // Check if input starts with a number
      const startsWithNumber = /^\d+/.test(parts[0]);
      const houseNumber = startsWithNumber ? parts[0] : null;
      const streetParts = startsWithNumber ? parts.slice(1) : parts;
      const streetSearch = streetParts.join(" ").toLowerCase();

      if (houseNumber) {
        // User has entered a house number - generate specific addresses
        for (const streetName of STREET_NAMES) {
          const streetLower = streetName.toLowerCase();

          // Check if the street name matches what user is typing
          if (
            streetSearch.length === 0 ||
            streetLower.startsWith(streetSearch) ||
            streetSearch.includes(streetLower) ||
            streetLower.includes(streetSearch)
          ) {
            // Generate suggestions for different street types
            for (let i = 0; i < Math.min(3, STREET_TYPES.length); i++) {
              const streetType = STREET_TYPES[i];

              // Generate for different cities
              for (let j = 0; j < Math.min(3, CALIFORNIA_CITIES.length); j++) {
                const cityData = CALIFORNIA_CITIES[j];
                const zip = cityData.zips[0];

                // Use both short and long forms
                const addressShort = `${houseNumber} ${streetName} ${streetType.short}`;
                const addressLong = `${houseNumber} ${streetName} ${streetType.long}`;

                // Calculate confidence based on match quality
                let confidence = 0;
                if (streetLower.startsWith(streetSearch)) confidence = 100;
                else if (streetLower.includes(streetSearch)) confidence = 80;
                else if (streetSearch.includes(streetLower)) confidence = 60;
                else confidence = 40;

                suggestions.push({
                  id: `${addressShort}-${cityData.city}-${zip}`,
                  address: addressShort,
                  city: cityData.city,
                  zip,
                  fullAddress: `${addressShort}, ${cityData.city}, CA ${zip}`,
                  confidence,
                });

                // Also add the long form if different
                if (streetType.short !== streetType.long) {
                  suggestions.push({
                    id: `${addressLong}-${cityData.city}-${zip}`,
                    address: addressLong,
                    city: cityData.city,
                    zip,
                    fullAddress: `${addressLong}, ${cityData.city}, CA ${zip}`,
                    confidence: confidence - 5,
                  });
                }
              }
            }
          }
        }

        // Also check if user is typing a specific format like "220 23rd"
        if (streetSearch.match(/^\d+(st|nd|rd|th)/i)) {
          const ordinalStreet = streetSearch.replace(
            /(\d+)(st|nd|rd|th)/i,
            "$1$2",
          );
          const streetNum = streetSearch.match(/\d+/)?.[0];

          if (streetNum) {
            const ordinalFull = `${streetNum}${
              streetNum.endsWith("1") && streetNum !== "11"
                ? "st"
                : streetNum.endsWith("2") && streetNum !== "12"
                  ? "nd"
                  : streetNum.endsWith("3") && streetNum !== "13"
                    ? "rd"
                    : "th"
            }`;

            for (const streetType of STREET_TYPES.slice(0, 3)) {
              for (const cityData of CALIFORNIA_CITIES.slice(0, 5)) {
                const zip = cityData.zips[0];
                const address = `${houseNumber} ${ordinalFull} ${streetType.short}`;

                suggestions.push({
                  id: `${address}-${cityData.city}-${zip}`,
                  address,
                  city: cityData.city,
                  zip,
                  fullAddress: `${address}, ${cityData.city}, CA ${zip}`,
                  confidence: 95,
                });
              }
            }
          }
        }
      } else {
        // No house number yet - suggest common address patterns
        const commonNumbers = [
          "100",
          "200",
          "300",
          "500",
          "1000",
          "1234",
          "2020",
        ];

        for (const streetName of STREET_NAMES) {
          const streetLower = streetName.toLowerCase();

          if (
            lowerInput.length === 0 ||
            streetLower.startsWith(lowerInput) ||
            lowerInput.includes(streetLower) ||
            streetLower.includes(lowerInput)
          ) {
            for (let i = 0; i < Math.min(2, commonNumbers.length); i++) {
              const number = commonNumbers[i];
              const streetType = STREET_TYPES[0];
              const cityData = CALIFORNIA_CITIES[0];
              const zip = cityData.zips[0];
              const address = `${number} ${streetName} ${streetType.short}`;

              suggestions.push({
                id: `${address}-${cityData.city}-${zip}`,
                address,
                city: cityData.city,
                zip,
                fullAddress: `${address}, ${cityData.city}, CA ${zip}`,
                confidence: 50,
              });
            }
          }
        }
      }

      // Sort by confidence and limit results
      return suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 8);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowNoResults(false);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced search
    if (newValue.length > 1) {
      debounceTimer.current = setTimeout(() => {
        let newSuggestions = generateSuggestions(newValue);
        const lowerValue = newValue.toLowerCase();
        const parts = lowerValue.split(/\s+/);

        // Check for city match (partial or full)
        let cityMatch = null;
        for (const part of parts) {
          if (part.length >= 3) {
            // Only match if at least 3 chars
            cityMatch = CALIFORNIA_CITIES.find(
              (city) =>
                city.city.toLowerCase().startsWith(part) ||
                city.city.toLowerCase().includes(part),
            );
            if (cityMatch) break;
          }
        }

        // Check for zip code match
        let zipMatch = null;
        for (const part of parts) {
          if (/^\d{5}$/.test(part)) {
            // Full zip code
            for (const city of CALIFORNIA_CITIES) {
              if (city.zips.includes(part)) {
                zipMatch = { city: city.city, zip: part };
                break;
              }
            }
          } else if (/^\d{3,4}$/.test(part)) {
            // Partial zip
            for (const city of CALIFORNIA_CITIES) {
              const matchingZip = city.zips.find((zip) => zip.startsWith(part));
              if (matchingZip) {
                zipMatch = { city: city.city, zip: matchingZip };
                break;
              }
            }
          }
        }

        // Apply filtering based on city or zip match
        if (cityMatch || zipMatch) {
          const targetCity = cityMatch ? cityMatch.city : zipMatch.city;
          const targetZip = zipMatch?.zip;

          // Filter existing suggestions
          newSuggestions = newSuggestions.filter((s) => {
            if (targetZip) {
              return s.city === targetCity && s.zip === targetZip;
            }
            return s.city === targetCity;
          });

          // If we filtered everything out, generate new suggestions for that city/zip
          if (newSuggestions.length === 0) {
            const cityData = CALIFORNIA_CITIES.find(
              (c) => c.city === targetCity,
            );
            if (cityData) {
              // Extract the street/number part (remove city/zip from input)
              let streetPart = newValue;
              parts.forEach((part) => {
                if (
                  cityData.city.toLowerCase().startsWith(part) ||
                  cityData.zips.some((z) => z.startsWith(part))
                ) {
                  streetPart = streetPart
                    .replace(new RegExp(part, "gi"), "")
                    .trim();
                }
              });

              const hasNumber = /^\d+/.test(streetPart);
              const houseNumber = hasNumber
                ? streetPart.match(/^\d+/)[0]
                : null;
              const streetSearch = hasNumber
                ? streetPart.replace(/^\d+\s*/, "").toLowerCase()
                : streetPart.toLowerCase();

              newSuggestions = [];
              for (const streetName of STREET_NAMES) {
                if (
                  !streetSearch ||
                  streetName.toLowerCase().startsWith(streetSearch) ||
                  streetSearch.includes(streetName.toLowerCase())
                ) {
                  const streetType = STREET_TYPES[0];
                  const zip = targetZip || cityData.zips[0];
                  const finalNumber = houseNumber || "100";
                  const address = `${finalNumber} ${streetName} ${streetType.short}`;

                  newSuggestions.push({
                    id: `${address}-${cityData.city}-${zip}`,
                    address,
                    city: cityData.city,
                    zip,
                    fullAddress: `${address}, ${cityData.city}, CA ${zip}`,
                    confidence: 95,
                  });

                  if (newSuggestions.length >= 8) break;
                }
              }
            }
          }
        }

        setSuggestions(newSuggestions);
        setIsOpen(newSuggestions.length > 0);

        // Only show "no results" message after user has typed enough
        if (newValue.length > 5 && newSuggestions.length === 0) {
          setShowNoResults(true);
        }
      }, 150);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setShowNoResults(false);
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.fullAddress);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setShowNoResults(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowNoResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        autoComplete="off"
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
          className="ac-panel"
          style={{ display: "block" }}
          role="listbox"
          aria-label="Address suggestions"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`ac-item ${index === activeIndex ? "is-active" : ""}`}
              onClick={() => selectSuggestion(suggestion)}
              role="option"
              aria-selected={index === activeIndex}
            >
              <svg className="ac-icon" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ac-text">
                <div className="ac-title">{suggestion.address}</div>
                <div className="ac-sub">
                  {suggestion.city}, CA {suggestion.zip}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Only show this after sufficient typing and no results */}
      {showNoResults && value.length > 5 && suggestions.length === 0 && (
        <div
          className="ac-panel"
          style={{
            display: "block",
            padding: "12px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          <div>No matching addresses found.</div>
          <button
            onClick={() => {
              window.open(
                `https://www.google.com/maps/search/${encodeURIComponent(value + " California")}`,
                "_blank",
              );
            }}
            style={{
              marginTop: "8px",
              background: "none",
              border: "none",
              color: "#0066cc",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "13px",
              padding: 0,
            }}
          >
            Search with Google Maps →
          </button>
        </div>
      )}
    </div>
  );
}
