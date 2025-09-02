'use client';
import StepNav from '../components/StepNav';
import { useOrder } from '../context';
import { useState, useEffect } from 'react';

export default function PropertyPage() {
  const { state, updateState } = useOrder();
  const [mapVisible, setMapVisible] = useState(false);
  const [currentSqFt, setCurrentSqFt] = useState(0);
  const [autocompleteItems, setAutocompleteItems] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Address autocomplete
  const handleAddressChange = async (value: string) => {
    updateState({ address: value });
    
    if (value.length > 3) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=us&limit=8&q=${encodeURIComponent(value + ', California')}`);
        const results = await response.json();
        setAutocompleteItems(results.slice(0, 5));
        setShowAutocomplete(true);
      } catch (e) {
        setAutocompleteItems([]);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  const selectAddress = (item: any) => {
    const displayName = item.display_name.replace(', United States', '');
    updateState({ address: displayName });
    setShowAutocomplete(false);
    setAutocompleteItems([]);
  };

  // Map functionality would be implemented here using useEffect and Leaflet
  useEffect(() => {
    if (mapVisible && typeof window !== 'undefined') {
      // Initialize Leaflet map here
      // This would match the original map implementation
    }
  }, [mapVisible]);

  const toggleMap = () => {
    setMapVisible(!mapVisible);
  };

  const saveMapArea = () => {
    if (!currentSqFt) return;
    
    const scope = state.capScope;
    if (scope === 'interior-exterior') {
      if (!state.areaBothInt) {
        updateState({ areaBothInt: currentSqFt });
      } else if (!state.areaBothExt) {
        updateState({ areaBothExt: currentSqFt });
      } else {
        updateState({ areaBothExt: currentSqFt });
      }
    } else {
      if (scope === 'interior') {
        updateState({ areaInt: currentSqFt });
      } else if (scope === 'exterior') {
        updateState({ areaExt: currentSqFt });
      }
    }
    setCurrentSqFt(0);
  };

  return (
    <section className="card">
      <StepNav />
      
      <h2 tabIndex={-1}>Property details</h2>
      <p className="muted">Tell us about the property we&apos;ll be scanning.</p>

      {/* Address */}
      <div className="field">
        <label className="label">Property address</label>
        <div className="ac-wrap">
          <input
            className={`input ${!state.address.trim() ? 'error' : ''}`}
            type="text"
            value={state.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Enter the property address"
          />
          
          {showAutocomplete && autocompleteItems.length > 0 && (
            <div className="ac-panel" style={{ display: 'block' }}>
              {autocompleteItems.map((item, idx) => (
                <div
                  key={idx}
                  className="ac-item"
                  onClick={() => selectAddress(item)}
                >
                  <svg className="ac-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div className="ac-text">
                    <div className="ac-title">
                      {item.display_name.split(',')[0]}
                    </div>
                    <div className="ac-sub">
                      {item.display_name.replace(', United States', '')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Property Type */}
      <div className="section-header">
        <div className="section-number">1</div>
        <div className="section-title">Property type</div>
      </div>
      
      <div className="choices choices--2x">
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            id="residential"
            name="propType"
            value="residential"
            checked={state.propType === 'residential'}
            onChange={(e) => updateState({ propType: e.target.value as any })}
          />
          <label className="choice" htmlFor="residential">
            <div className="dot-sel"></div>
            <div>
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
              </svg>
              <div className="title">Residential</div>
              <div className="desc">Single-family homes, condos, apartments</div>
            </div>
          </label>
        </div>
        
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            id="commercial"
            name="propType"
            value="commercial"
            checked={state.propType === 'commercial'}
            onChange={(e) => updateState({ propType: e.target.value as any })}
          />
          <label className="choice" htmlFor="commercial">
            <div className="dot-sel"></div>
            <div>
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 21h18"/>
                <path d="M4 21V10a2 2 0 012-2h12a2 2 0 012 2v11"/>
                <path d="M9 9v1"/>
                <path d="M15 9v1"/>
                <path d="M9 15v1"/>
                <path d="M15 15v1"/>
              </svg>
              <div className="title">Commercial</div>
              <div className="desc">Office buildings, retail spaces, warehouses</div>
            </div>
          </label>
        </div>
      </div>

      {/* Capture Scope */}
      <div className="section-header">
        <div className="section-number">2</div>
        <div className="section-title">Capture scope</div>
      </div>
      
      <div className="choices">
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            id="interior"
            name="capScope"
            value="interior"
            checked={state.capScope === 'interior'}
            onChange={(e) => updateState({ capScope: e.target.value as any })}
          />
          <label className="choice" htmlFor="interior">
            <div className="dot-sel"></div>
            <div>
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2"/>
                <path d="M3 11h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z"/>
                <path d="M12 11v8"/>
              </svg>
              <div className="title">Interior only</div>
              <div className="desc">Indoor spaces, rooms, floor plans</div>
              <div className="area-row">
                <input
                  className={`input mini ${state.capScope === 'interior' && !(state.areaInt > 0) ? 'error' : ''}`}
                  type="number"
                  value={state.areaInt || ''}
                  onChange={(e) => updateState({ areaInt: Number(e.target.value) })}
                  placeholder="0"
                />
                <span className="unit">sq ft</span>
              </div>
            </div>
          </label>
        </div>
        
        <div className="choice-wrap">
          <input
            className="choice-input"
            type="radio"
            id="exterior"
            name="capScope"
            value="exterior"
            checked={state.capScope === 'exterior'}
            onChange={(e) => updateState({ capScope: e.target.value as any })}
          />
          <label className="choice" htmlFor="exterior">
            <div className="dot-sel"></div>
            <div>
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
              </svg>
              <div className="title">Exterior only</div>
              <div className="desc">Building facades, landscapes, site plans</div>
              <div className="area-row">
                <input
                  className={`input mini ${state.capScope === 'exterior' && !(state.areaExt > 0) ? 'error' : ''}`}
                  type="number"
                  value={state.areaExt || ''}
                  onChange={(e) => updateState({ areaExt: Number(e.target.value) })}
                  placeholder="0"
                />
                <span className="unit">sq ft</span>
              </div>
            </div>
          </label>
        </div>
        
        <div className="choice-wrap span-2">
          <input
            className="choice-input"
            type="radio"
            id="interior-exterior"
            name="capScope"
            value="interior-exterior"
            checked={state.capScope === 'interior-exterior'}
            onChange={(e) => updateState({ capScope: e.target.value as any })}
          />
          <label className="choice" htmlFor="interior-exterior">
            <div className="dot-sel"></div>
            <div>
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2"/>
                <path d="M3 11h18v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z"/>
                <path d="M12 11v8"/>
                <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3"/>
              </svg>
              <div className="title">Interior &amp; exterior</div>
              <div className="desc">Complete property documentation inside and out</div>
              <div className="area-row--split">
                <div className="mini-field">
                  <span className="labelline">
                    Interior <em className="unit-top">sq ft</em>
                  </span>
                  <input
                    className={`input mini ${state.capScope === 'interior-exterior' && !(state.areaBothInt > 0) ? 'error' : ''}`}
                    type="number"
                    value={state.areaBothInt || ''}
                    onChange={(e) => updateState({ areaBothInt: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div className="mini-field">
                  <span className="labelline">
                    Exterior <em className="unit-top">sq ft</em>
                  </span>
                  <input
                    className={`input mini ${state.capScope === 'interior-exterior' && !(state.areaBothExt > 0) ? 'error' : ''}`}
                    type="number"
                    value={state.areaBothExt || ''}
                    onChange={(e) => updateState({ areaBothExt: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Map Estimator */}
      <div className="section-header">
        <div className="section-number">3</div>
        <div className="section-title">Area estimator (optional)</div>
      </div>
      
      <div className="map-toggle">
        <button className="map-toggle-btn" onClick={toggleMap}>
          📐 Use interactive map to measure area
        </button>
      </div>
      
      <div className={`map-wrap ${mapVisible ? 'open' : ''}`}>
        <div className="map-instructions">
          Use the polygon tool to trace the area you want to scan. The measurement will automatically calculate.
        </div>
        <div id="map"></div>
        <div className="map-results">
          <div>
            <strong>Measured area: </strong>
            <span className="measured-value">{currentSqFt.toLocaleString()} sq ft</span>
          </div>
          <button 
            className="btn-save" 
            disabled={currentSqFt === 0}
            onClick={saveMapArea}
          >
            Save to form
          </button>
        </div>
      </div>

      <div className="hint">
        <p className="muted">
          <strong>Need help with measurements?</strong> Use our interactive map tool above or refer to your property records. 
          <a href="#" className="underline">Learn more about area estimation</a>
        </p>
      </div>
    </section>
  );
}