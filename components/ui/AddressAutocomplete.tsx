// components/ui/AddressAutocomplete.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface Suggestion {
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
  onSelect,
}: {
  value?: string;
  onSelect: (val: string, coords?: { lat: number; lon: number }) => void;
}) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setOpen(false);
      return;
    }

    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const data = await res.json();

        const filtered = data.filter((d: any) => {
          const a = d.address || {};
          return (
            (a.house_number || a.road) &&
            (a.city || a.town || a.village) &&
            a.state === "California"
          );
        });

        setResults(filtered);
        setOpen(filtered.length > 0);
      } catch {
        setResults([]);
        setOpen(false);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (s: Suggestion) => {
    const a = s.address || {};
    const primary = `${a.house_number || ""} ${a.road || ""}`.trim();
    const city = a.city || a.town || a.village || "";
    const zip = a.postcode || "";
    const full = `${primary}, ${city}, CA ${zip}`.replace(" ,", ",");
    setQuery(full);
    onSelect(full, { lat: parseFloat(s.lat), lon: parseFloat(s.lon) });
    setOpen(false);
  };

  return (
    <div className="ac-wrap" ref={ref}>
      <input
        id="address"
        className="input"
        placeholder="Start typing your address..."
        value={query}
        autoComplete="off"
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      {open && (
        <div className="ac-panel">
          {results.map((s, idx) => {
            const a = s.address || {};
            const primary = `${a.house_number || ""} ${a.road || ""}`.trim();
            const city = a.city || a.town || a.village || "";
            const zip = a.postcode || "";
            return (
              <div
                key={idx}
                className="ac-item"
                onClick={() => handleSelect(s)}
              >
                <svg
                  className="ac-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                </svg>
                <div className="ac-text">
                  <div className="ac-title">{primary || s.display_name}</div>
                  <div className="ac-sub">
                    {city} {zip}
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
