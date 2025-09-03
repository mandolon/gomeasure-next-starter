'use client';
import StepNav from '../components/StepNav';
import { useOrder } from '../context';
import { useState, useEffect, useRef } from 'react';
import { useMap } from '../hooks/useMap';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';

export default function PropertyPage() {
  const { state, updateState } = useOrder();
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  
  const { mapRef, currentSqFt, centerOnAddress, invalidateSize } = useMap();
  const { 
    results, 
    isVisible, 
    activeIndex, 
    search, 
    hide, 
    show, 
    highlight, 
    selectByIndex, 
    handleKeyDown 
  } = useAddressAutocomplete();

  // Handle address input changes with debounce
  const handleAddressChange = (value: string) => {
    updateState({ address: value });
    
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(() => {
      search(value);
    }, 300);
    
    setDebounceTimeout(timeout);
  };

  // Handle address selection
  const handleAddressSelect = (index: number) => {
    const result = selectByIndex(index);
    if (result) {
      updateState({ address: result.formattedAddress });
      
      // Auto-open map and center on address
      const mapWrap = document.getElementById('mapWrap');
      if (mapWrap && !mapWrap.classList.contains('open')) {
        mapWrap.classList.add('open');
        invalidateSize();
      }
      
      // Center map on selected address after a short delay
      setTimeout(() => {
        centerOnAddress(parseFloat(result.lat), parseFloat(result.lon));
      }, 200);
    }
  };

  const toggleMap = () => {
    const mapWrap = document.getElementById('mapWrap');
    if (mapWrap) {
      const isOpen = !mapWrap.classList.contains('open');
      mapWrap.classList.toggle('open', isOpen);
      if (isOpen) {
        invalidateSize();
      }
    }
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
    
    // Close map
    const mapWrap = document.getElementById('mapWrap');
    if (mapWrap) mapWrap.classList.remove('open');
  };

  // Handle keyboard navigation for autocomplete
  const handleAddressKeyDown = (e: React.KeyboardEvent) => {
    const result = handleKeyDown(e);
    if (result) {
      handleAddressSelect(results.indexOf(result));
    }
  };

  // Update area display
  useEffect(() => {
    const areaOut = document.getElementById('areaOut');
    if (areaOut) {
      const fmt = (n: number) => (Math.round(n*10)/10).toLocaleString();
      areaOut.textContent = fmt(currentSqFt);
    }
  }, [currentSqFt]);

  // Handle clicks outside autocomplete
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const ac = document.getElementById('ac');
      if (ac && !ac.contains(e.target as Node)) {
        hide();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [hide]);

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
          ref={addressInputRef}
          id="address"
          className="input"
          type="text"
          value={state.address}
          onChange={(e) => handleAddressChange(e.target.value)}
          onKeyDown={handleAddressKeyDown}
          onFocus={show}
          placeholder="Start typing your address..."
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isVisible}
          aria-activedescendant={activeIndex >= 0 ? `addr-opt-${activeIndex}` : undefined}
          role="combobox"
          required
        />
        
        <div 
          id="addr-list" 
          className="ac-panel" 
          role="listbox" 
          aria-label="Address suggestions" 
          style={{ display: isVisible ? 'block' : 'none' }}
        >
          {results.length === 0 && isVisible ? (
            <div className="ac-item" style={{ cursor: 'default' }}>
              <div className="ac-text">
                <div className="ac-sub">No results found</div>
              </div>
            </div>
          ) : (
            results.map((result, idx) => (
              <div
                key={idx}
                className={`ac-item ${activeIndex === idx ? 'is-active' : ''}`}
                role="option"
                id={`addr-opt-${idx}`}
                onMouseEnter={() => highlight(idx)}
                onMouseLeave={() => highlight(-1)}
                onClick={() => handleAddressSelect(idx)}
              >
                <svg className="ac-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div className="ac-text">
                  <div className="ac-title">{result.primary}</div>
                  <div className="ac-sub">{result.city}, CA{result.zip ? ' ' + result.zip : ''}</div>
                </div>
              </div>
            ))
          )}
        </div>
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
      <div id="mapWrap" className="map-wrap">
        <div className="map-instructions">Draw a polygon around your property</div>
        <div ref={mapRef} id="map"></div>
        
        <div className="map-results">
          <div className="measured-value"><span id="areaOut">{currentSqFt}</span> sq ft</div>
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