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
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const cache = useRef<Map<string, Suggestion[]>>(new Map());
  const abortController = useRef<AbortController | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Cancel any pending requests
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Set new timer for debounced search
    if (newValue.length > 3) {
      setIsLoading(true);
      debounceTimer.current = setTimeout(() => {
        searchAddress(newValue);
      }, 600); // Increased debounce time to reduce API calls
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const searchAddress = async (query: string) => {
    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (cache.current.has(cacheKey)) {
      const cached = cache.current.get(cacheKey)!;
      setSuggestions(cached);
      setIsOpen(cached.length > 0);
      setIsLoading(false);
      return;
    }

    // Create new abort controller for this request
    abortController.current = new AbortController();

    try {
      const timeoutId = setTimeout(() => abortController.current?.abort(), 4000);
      
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`,
        { signal: abortController.current.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      
      // Cache the result
      cache.current.set(cacheKey, data);
      
      // Keep cache size limited (LRU-like)
      if (cache.current.size > 30) {
        const firstKey = cache.current.keys().next().value;
        cache.current.delete(firstKey);
      }
      
      setSuggestions(data);
      setIsOpen(data.length > 0);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled, do nothing
        return;
      }
      console.error('Error searching address:', error);
      setSuggestions([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.display_name);
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setIsLoading(false);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const formatAddress = (suggestion: Suggestion) => {
    const address = suggestion.address;
    if (!address) {
      const parts = suggestion.display_name.split(',');
      return {
        primary: parts[0].trim(),
        secondary: parts.slice(1).join(',').trim()
      };
    }
    
    const parts = [];
    if (address.house_number) parts.push(address.house_number);
    if (address.road) parts.push(address.road);
    
    const primary = parts.join(' ') || suggestion.display_name.split(',')[0];
    
    const secondaryParts = [];
    if (address.city || address.town || address.village) {
      secondaryParts.push(address.city || address.town || address.village);
    }
    if (address.state) secondaryParts.push(address.state);
    if (address.postcode) secondaryParts.push(address.postcode);
    
    const secondary = secondaryParts.join(', ') || suggestion.display_name.split(',').slice(1).join(',').trim();
    
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
        aria-expanded={isOpen || isLoading} 
        aria-owns="addr-list" 
        aria-controls="addr-list" 
        aria-busy={isLoading}
        role="combobox" 
        required
      />
      {isLoading && (
        <div 
          className="ac-panel" 
          style={{ display: 'block', padding: '12px', textAlign: 'center', color: '#666' }}
        >
          <div style={{ fontSize: '14px' }}>Searching addresses...</div>
        </div>
      )}
      {!isLoading && isOpen && suggestions.length > 0 && (
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