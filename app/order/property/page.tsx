'use client';
import StepNav from '../components/StepNav';
import { useOrder } from '../context';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

interface AddressResult {
  primary: string;
  city: string;
  zip: string;
  lat: string;
  lon: string;
}

export default function PropertyPage() {
  const { state, updateState } = useOrder();
  const [mapVisible, setMapVisible] = useState(false);
  const [currentSqFt, setCurrentSqFt] = useState(0);
  const [autocompleteItems, setAutocompleteItems] = useState<AddressResult[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [debounceId, setDebounceId] = useState<NodeJS.Timeout | null>(null);
  const [addressCoords, setAddressCoords] = useState<{ lat: number; lng: number } | undefined>();

  const CA_VIEWBOX = '-124.48,32.53,-114.13,42.01';

  // Enhanced address autocomplete with California filtering
  const searchCA = async (query: string): Promise<AddressResult[]> => {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&countrycodes=us&bounded=1&viewbox=${CA_VIEWBOX}&q=${encodeURIComponent(query)}`;
    
    try {
      const response = await fetch(url, { 
        headers: { 'Accept-Language': 'en' } 
      });
      if (!response.ok) return [];
      
      const data = await response.json();
      const filtered = data.filter((d: any) => {
        const a = d.address || {};
        const inCA = (a.state === 'California') || (a.state_code === 'CA');
        const isAddr = ['house', 'residential', 'building', 'yes', 'address', 'road'].includes(d.type) || a.house_number;
        return inCA && isAddr;
      });
      
      return filtered.map((d: any) => {
        const a = d.address || {};
        const num = a.house_number || '';
        const road = a.road || a.pedestrian || a.footway || a.path || '';
        const primary = (num && road) ? `${num} ${road}` : (d.name || d.display_name.split(',')[0]);
        const city = a.city || a.town || a.village || a.hamlet || a.municipality || a.county || '';
        const zip = a.postcode || '';
        return { primary, city, zip, lat: d.lat, lon: d.lon };
      });
    } catch(e) {
      return [];
    }
  };

  const handleAddressChange = (value: string) => {
    updateState({ address: value });
    
    // Clear existing debounce
    if (debounceId) {
      clearTimeout(debounceId);
    }
    
    if (value.length < 3) {
      setShowAutocomplete(false);
      setAutocompleteItems([]);
      return;
    }
    
    // Debounce search
    const newDebounceId = setTimeout(async () => {
      try {
        const results = await searchCA(value);
        setAutocompleteItems(results);
        setShowAutocomplete(true);
        setActiveIndex(-1);
      } catch(e) {
        setShowAutocomplete(false);
      }
    }, 300);
    
    setDebounceId(newDebounceId);
  };

  const selectAddress = (index: number) => {
    const item = autocompleteItems[index];
    if (!item) return;
    
    const fullAddress = `${item.primary}, ${item.city}, CA${item.zip ? ' ' + item.zip : ''}`;
    updateState({ address: fullAddress });
    setShowAutocomplete(false);
    setAutocompleteItems([]);
    setActiveIndex(-1);
    
    // Set coordinates for map centering
    setAddressCoords({ 
      lat: parseFloat(item.lat), 
      lng: parseFloat(item.lon) 
    });
    
    // Auto-open map
    if (!mapVisible) {
      setMapVisible(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!autocompleteItems.length) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % autocompleteItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + autocompleteItems.length) % autocompleteItems.length);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        selectAddress(activeIndex);
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
      setActiveIndex(-1);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#ac')) {
        setShowAutocomplete(false);
        setActiveIndex(-1);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const onAreaCalculated = (sqFt: number) => {
    setCurrentSqFt(sqFt);
  };

  const toggleMap = () => {
    setMapVisible(!mapVisible);
  };

  const saveMapArea = () => {
    if (!currentSqFt) return;
    
    const scope = state.capScope;
    if (scope === 'interior-exterior') {
      // For Interior & Exterior: save to first empty field, or exterior if both full
      if (!state.areaBothInt) {
        updateState({ areaBothInt: currentSqFt });
      } else if (!state.areaBothExt) {
        updateState({ areaBothExt: currentSqFt });
      } else {
        updateState({ areaBothExt: currentSqFt });
      }
    } else {
      // For single scopes, save to their input
      if (scope === 'interior') {
        updateState({ areaInt: currentSqFt });
      } else if (scope === 'exterior') {
        updateState({ areaExt: currentSqFt });
      }
    }
    setCurrentSqFt(0);
  };

  const handleEstimateLink = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Demo: Property size estimation guide');
  };

  return (
    <section className="card">
      <StepNav />
      
      {/* Section 1: Address */}
      <div className="section-header">
        <div className="section-number">1</div>
        <div className="section-title">Property Address</div>
      </div>
      
      <div className="ac-wrap" id="ac">
        <input
          id="address"
          className="input"
          type="text"
          value={state.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (autocompleteItems.length) setShowAutocomplete(true);
          }}
          placeholder="Start typing your address..."
          autoComplete="street-address"
          aria-autocomplete="list"
          aria-expanded={showAutocomplete}
          aria-activedescendant={activeIndex >= 0 ? `addr-opt-${activeIndex}` : undefined}
          role="combobox"
          required
        />
        
        {showAutocomplete && (
          <div id="addr-list" className="ac-panel" role="listbox" aria-label="Address suggestions" style={{ display: 'block' }}>
            {autocompleteItems.length > 0 ? (
              autocompleteItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`ac-item ${idx === activeIndex ? 'is-active' : ''}`}
                  onClick={() => selectAddress(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  role="option"
                  id={`addr-opt-${idx}`}
                >
                  <svg className="ac-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <div className="ac-text">
                    <div className="ac-title">{item.primary}</div>
                    <div className="ac-sub">{item.city}, CA{item.zip ? ' ' + item.zip : ''}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="ac-item" style={{ cursor: 'default' }}>
                <div className="ac-text">
                  <div className="ac-sub">No results found</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Property Type */}
      <div className="section-header">
        <div className="section-number">2</div>
        <div className="section-title">Property Type</div>
      </div>
      
      <div className="choices choices--2x" role="radiogroup" aria-label="Property type">
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            name="propType"
            id="prop-res"
            value="residential"
            checked={state.propType === 'residential'}
            onChange={(e) => updateState({ propType: e.target.value as any })}
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
            checked={state.propType === 'commercial'}
            onChange={(e) => updateState({ propType: e.target.value as any })}
          />
          <label className="choice" htmlFor="prop-com">
            <span className="dot-sel" aria-hidden="true"></span>
            <span className="title">Commercial</span>
          </label>
        </div>
      </div>

      {/* Section 3: Capture Scope */}
      <div className="section-header">
        <div className="section-number">3</div>
        <div className="section-title">What would you like captured?</div>
      </div>
      
      <div className="choices choices--2x" role="radiogroup" aria-label="Capture scope">
        {/* Interior */}
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            name="capScope"
            id="cap-int"
            value="interior"
            checked={state.capScope === 'interior'}
            onChange={(e) => updateState({ capScope: e.target.value as any })}
          />
          <label className="choice" htmlFor="cap-int">
            <span className="dot-sel" aria-hidden="true"></span>
            <svg className="icon" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M8 50 V18 l24-10 24 10 v32 H8z M8 26 h48" strokeWidth="2"/>
              <path d="M20 34 h12 v12 H20z" strokeWidth="2"/>
            </svg>
            <div>
              <div className="title">Interior Only</div>
              <div className="desc">3D capture of interior rooms and circulation. Fast and precise for planning + measurements.</div>

              <div className="area-row">
                <input
                  id="area-int"
                  className="input mini"
                  type="number"
                  inputMode="numeric"
                  value={state.areaInt || ''}
                  onChange={(e) => updateState({ areaInt: Number(e.target.value) })}
                  placeholder="Enter area"
                  min="0"
                />
                <span className="unit">sq&nbsp;ft</span>
              </div>
            </div>
          </label>
        </div>

        {/* Exterior */}
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            name="capScope"
            id="cap-ext"
            value="exterior"
            checked={state.capScope === 'exterior'}
            onChange={(e) => updateState({ capScope: e.target.value as any })}
          />
          <label className="choice" htmlFor="cap-ext">
            <span className="dot-sel" aria-hidden="true"></span>
            <svg className="icon" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M8 44 V28 l12-8 12 8 v16z M40 40 l10-6 8 6 v6 H40z" strokeWidth="2"/>
            </svg>
            <div>
              <div className="title">Exterior Only</div>
              <div className="desc">3D capture of facades and site context—ideal for elevations, setbacks, and envelope checks.</div>

              <div className="area-row">
                <input
                  id="area-ext"
                  className="input mini"
                  type="number"
                  inputMode="numeric"
                  value={state.areaExt || ''}
                  onChange={(e) => updateState({ areaExt: Number(e.target.value) })}
                  placeholder="Enter area"
                  min="0"
                />
                <span className="unit">sq&nbsp;ft</span>
              </div>
            </div>
          </label>
        </div>

        {/* Interior & Exterior */}
        <div className="choice-wrap span-2">
          <input
            className="choice-input"
            type="radio"
            name="capScope"
            id="cap-both"
            value="interior-exterior"
            checked={state.capScope === 'interior-exterior'}
            onChange={(e) => updateState({ capScope: e.target.value as any })}
          />
          <label className="choice" htmlFor="cap-both">
            <span className="dot-sel" aria-hidden="true"></span>
            <svg className="icon" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M6 50 V26 l14-10 14 10 v24z M34 42 l10-8 14 8 v8 H34z M6 50 h52" strokeWidth="2"/>
            </svg>
            <div>
              <div className="title">Interior &amp; Exterior</div>
              <div className="desc">Complete capture—interior spaces plus walkable exterior for coordination and BIM-ready context.</div>

              <div className="area-row area-row--split">
                <label className="mini-field" htmlFor="area-both-int">
                  <span className="labelline"><strong>Interior</strong><em className="unit-top">(sq ft)</em></span>
                  <input
                    id="area-both-int"
                    className="input mini"
                    type="number"
                    inputMode="numeric"
                    value={state.areaBothInt || ''}
                    onChange={(e) => updateState({ areaBothInt: Number(e.target.value) })}
                    placeholder="Enter area"
                    min="0"
                  />
                </label>

                <label className="mini-field" htmlFor="area-both-ext">
                  <span className="labelline"><strong>Exterior</strong><em className="unit-top">(sq ft)</em></span>
                  <input
                    id="area-both-ext"
                    className="input mini"
                    type="number"
                    inputMode="numeric"
                    value={state.areaBothExt || ''}
                    onChange={(e) => updateState({ areaBothExt: Number(e.target.value) })}
                    placeholder="Enter area"
                    min="0"
                  />
                </label>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Map Toggle */}
      <div className="map-toggle">
        <button id="openEstimator" className="map-toggle-btn" type="button" onClick={toggleMap}>
          Measure on map
        </button>
      </div>

      {/* Map */}
      <div id="mapWrap" className={`map-wrap ${mapVisible ? 'open' : ''}`}>
        <MapComponent 
          isVisible={mapVisible} 
          onAreaCalculated={onAreaCalculated}
          addressCoords={addressCoords}
        />
        
        <div className="map-results">
          <div className="measured-value"><span id="areaOut">{currentSqFt.toLocaleString()}</span> sq ft</div>
          <button id="saveBtn" className="btn-save" type="button" disabled={currentSqFt === 0} onClick={saveMapArea}>
            Save to area field
          </button>
        </div>
      </div>

      <div className="hint">
        <a href="#" className="underline" id="estimateLink" onClick={handleEstimateLink}>
          How to estimate property size
        </a>
      </div>

      <div className="actions">
        <button className="btn btn-primary" data-next="schedule">Next</button>
      </div>
    </section>
  );
}