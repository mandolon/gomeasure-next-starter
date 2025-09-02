import { useState, useRef, useEffect } from 'react';
import styles from '../styles/AddressAutocomplete.module.css';

const CA_VIEWBOX = '-124.48,32.53,-114.13,42.01';

export default function AddressAutocomplete({ value, onChange, error, onAddressSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const debounceRef = useRef(null);

  const searchAddresses = async (query) => {
    if (query.length < 3) return [];
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=us&bounded=1&viewbox=${CA_VIEWBOX}&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, { 
        headers: { 'Accept-Language': 'en' } 
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      const filtered = data.filter(d => {
        const a = d.address || {};
        const inCA = (a.state === 'California') || (a.state_code === 'CA');
        const isAddr = ['house', 'residential', 'building', 'yes', 'address', 'road'].includes(d.type) || a.house_number;
        return inCA && isAddr;
      });
      
      return filtered.map(d => {
        const a = d.address || {};
        const num = a.house_number || '';
        const road = a.road || a.pedestrian || a.footway || a.path || '';
        const primary = (num && road) ? `${num} ${road}` : (d.name || d.display_name.split(',')[0]);
        const city = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || '';
        const zip = a.postcode || '';
        return { 
          primary, 
          city, 
          zip, 
          lat: d.lat, 
          lon: d.lon,
          fullAddress: `${primary}, ${city}, CA${zip ? ' ' + zip : ''}`
        };
      });
    } catch (e) {
      return [];
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    clearTimeout(debounceRef.current);
    
    if (newValue.length < 3) {
      setSuggestions([]);
      setShowPanel(false);
      return;
    }
    
    debounceRef.current = setTimeout(async () => {
      const results = await searchAddresses(newValue);
      setSuggestions(results);
      setShowPanel(results.length > 0);
      setActiveIndex(-1);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (!showPanel || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowPanel(false);
      setActiveIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion.fullAddress);
    setShowPanel(false);
    setActiveIndex(-1);
    
    if (onAddressSelect) {
      onAddressSelect({
        address: suggestion.fullAddress,
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon)
      });
    }
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowPanel(true);
    }
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.acWrap}>
      <input
        ref={inputRef}
        className={`${styles.input} ${error ? styles.error : ''}`}
        type="text"
        placeholder="Start typing your address..."
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        autoComplete="street-address"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        role="combobox"
      />
      
      {showPanel && (
        <div ref={panelRef} className={styles.acPanel} role="listbox">
          {suggestions.length === 0 ? (
            <div className={styles.acItem} style={{ cursor: 'default' }}>
              <div className={styles.acText}>
                <div className={styles.acSub}>No results found</div>
              </div>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`${styles.acItem} ${index === activeIndex ? styles.isActive : ''}`}
                role="option"
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <svg className={styles.acIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div className={styles.acText}>
                  <div className={styles.acTitle}>{suggestion.primary}</div>
                  <div className={styles.acSub}>
                    {suggestion.city}, CA{suggestion.zip ? ' ' + suggestion.zip : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}