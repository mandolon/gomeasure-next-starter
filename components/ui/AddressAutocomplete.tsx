'use client';

import { useState, useRef, useEffect } from 'react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AddressAutocomplete({ value, onChange }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=us&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data);
      setIsOpen(data.length > 0);
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  const selectSuggestion = (suggestion: any) => {
    onChange(suggestion.display_name);
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
      {isOpen && (
        <div id="addr-list" className="ac-panel" style={{ display: 'block' }} role="listbox" aria-label="Address suggestions">
          {suggestions.map((suggestion, index) => (
            <div 
              key={suggestion.place_id}
              className={`ac-item ${index === activeIndex ? 'is-active' : ''}`}
              onClick={() => selectSuggestion(suggestion)}
              role="option"
              aria-selected={index === activeIndex}
            >
              <svg className="ac-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="ac-text">
                <div className="ac-title">
                  {suggestion.display_name.split(',')[0]}
                </div>
                <div className="ac-sub">
                  {suggestion.display_name.split(',').slice(1).join(',').trim()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}