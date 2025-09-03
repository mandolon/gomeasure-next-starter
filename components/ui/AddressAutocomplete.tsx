'use client';

import { useState, useRef, useEffect } from 'react';

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

export default function AddressAutocomplete({ value, onChange }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer for debounced search
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
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}&countrycodes=us`);
      
      if (!response.ok) {
        console.error('Failed to fetch suggestions');
        return;
      }
      
      const data = await response.json();
      
      // Filter for California addresses only and format properly
      const filteredData = data
        .filter((suggestion: Suggestion) => {
          const displayName = suggestion.display_name.toLowerCase();
          return displayName.includes('california') || displayName.includes(', ca,') || displayName.includes(', ca ');
        })
        .filter((suggestion: Suggestion) => {
          // Only include addresses that have house number, street, and postcode
          const address = suggestion.address;
          return address && address.house_number && address.road && address.postcode;
        });
      
      setSuggestions(filteredData);
      setIsOpen(filteredData.length > 0);
    } catch (error) {
      console.error('Error searching address:', error);
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    const { primary, secondary } = formatAddress(suggestion);
    const formattedAddress = `${primary}, ${secondary}`;
    onChange(formattedAddress);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
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
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatAddress = (suggestion: Suggestion) => {
    const address = suggestion.address;
    if (!address) {
      return {
        primary: suggestion.display_name.split(',')[0],
        secondary: suggestion.display_name.split(',').slice(1).join(',').trim()
      };
    }
    
    // Format as: number street
    const streetParts = [];
    if (address.house_number) streetParts.push(address.house_number);
    if (address.road) streetParts.push(address.road);
    const primary = streetParts.join(' ');
    
    // Format as: city, CA zipcode
    const secondaryParts = [];
    if (address.city || address.town || address.village) {
      secondaryParts.push(address.city || address.town || address.village);
    }
    secondaryParts.push('CA');
    if (address.postcode) secondaryParts.push(address.postcode);
    
    const secondary = secondaryParts.join(' ');
    
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
          style={{ display: 'block' }} 
          role="listbox" 
          aria-label="Address suggestions"
        >
          {suggestions.map((suggestion, index) => {
            const { primary, secondary } = formatAddress(suggestion);
            return (
              <div 
                key={suggestion.place_id || index}
                className={`ac-item ${index === activeIndex ? 'is-active' : ''}`}
                onClick={() => selectSuggestion(suggestion)}
                role="option"
                aria-selected={index === activeIndex}
              >
                <svg className="ac-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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