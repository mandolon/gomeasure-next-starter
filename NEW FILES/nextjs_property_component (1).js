import { useState, useEffect, useRef } from 'react';
import StepNavigation from './StepNavigation';
import MapEstimator from './MapEstimator';
import AddressAutocomplete from './AddressAutocomplete';
import styles from '../styles/PropertyDetails.module.css';

export default function PropertyDetails({ state, updateState, routes, currentStep }) {
  const [showMap, setShowMap] = useState(false);

  const handleScopeChange = (value) => {
    updateState({ capScope: value });
  };

  const handlePropertyTypeChange = (value) => {
    updateState({ propType: value });
  };

  const handleAreaChange = (field, value) => {
    updateState({ [field]: value });
  };

  const handleEstimateLinkClick = (e) => {
    e.preventDefault();
    alert('Demo: open article on estimating property size.');
  };

  const handleMapToggle = () => {
    setShowMap(!showMap);
  };

  const handleMapSave = (area) => {
    const scope = state.capScope;
    
    if (scope === 'interior-exterior') {
      // For Interior & Exterior: save to first empty field, or exterior if both full
      if (!state.areaBothInt) {
        updateState({ areaBothInt: area.toString() });
      } else if (!state.areaBothExt) {
        updateState({ areaBothExt: area.toString() });
      } else {
        updateState({ areaBothExt: area.toString() });
      }
    } else {
      // For single scopes, save to their input
      const field = scope === 'interior' ? 'areaInt' : 'areaExt';
      updateState({ [field]: area.toString() });
    }
  };

  return (
    <section className={styles.card}>
      <StepNavigation routes={routes} currentStep={currentStep} />

      {/* Section 1: Address */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionNumber}>1</div>
        <div className={styles.sectionTitle}>Property Address</div>
      </div>
      
      <AddressAutocomplete 
        value={state.address}
        onChange={(value) => updateState({ address: value })}
        error={!state.address}
      />

      {/* Section 2: Property Type */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionNumber}>2</div>
        <div className={styles.sectionTitle}>Property Type</div>
      </div>
      
      <div className={styles.choices2x}>
        <div className={styles.choiceWrap}>
          <input 
            className={styles.choiceInput}
            type="radio" 
            name="propType" 
            id="prop-res" 
            value="residential" 
            checked={state.propType === 'residential'}
            onChange={(e) => handlePropertyTypeChange(e.target.value)}
          />
          <label className={styles.choice} htmlFor="prop-res">
            <span className={styles.dotSel}></span>
            <span className={styles.title}>Residential</span>
          </label>
        </div>
        
        <div className={styles.choiceWrap}>
          <input 
            className={styles.choiceInput}
            type="radio" 
            name="propType" 
            id="prop-com" 
            value="commercial"
            checked={state.propType === 'commercial'}
            onChange={(e) => handlePropertyTypeChange(e.target.value)}
          />
          <label className={styles.choice} htmlFor="prop-com">
            <span className={styles.dotSel}></span>
            <span className={styles.title}>Commercial</span>
          </label>
        </div>
      </div>

      {/* Section 3: Capture Scope */}
      <div className={styles.sectionHeader}>
        <div className={styles.sectionNumber}>3</div>
        <div className={styles.sectionTitle}>What would you like captured?</div>
      </div>

      <div className={styles.choices2x}>
        {/* Interior */}
        <div className={styles.choiceWrap}>
          <input 
            className={styles.choiceInput}
            type="radio" 
            name="capScope" 
            id="cap-int" 
            value="interior"
            checked={state.capScope === 'interior'}
            onChange={(e) => handleScopeChange(e.target.value)}
          />
          <label className={styles.choice} htmlFor="cap-int">
            <span className={styles.dotSel}></span>
            <svg className={styles.icon} viewBox="0 0 64 64">
              <path d="M8 50 V18 l24-10 24 10 v32 H8z M8 26 h48" strokeWidth="2"/>
              <path d="M20 34 h12 v12 H20z" strokeWidth="2"/>
            </svg>
            <div>
              <div className={styles.title}>Interior Only</div>
              <div className={styles.desc}>3D capture of interior rooms and circulation. Fast and precise for planning + measurements.</div>

              {state.capScope === 'interior' && (
                <div className={styles.areaRow}>
                  <input 
                    id="area-int"
                    className={`${styles.input} ${styles.mini}`}
                    type="number" 
                    placeholder="Enter area" 
                    min="0"
                    value={state.areaInt}
                    onChange={(e) => handleAreaChange('areaInt', e.target.value)}
                  />
                  <span className={styles.unit}>sq&nbsp;ft</span>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Exterior */}
        <div className={styles.choiceWrap}>
          <input 
            className={styles.choiceInput}
            type="radio" 
            name="capScope" 
            id="cap-ext" 
            value="exterior"
            checked={state.capScope === 'exterior'}
            onChange={(e) => handleScopeChange(e.target.value)}
          />
          <label className={styles.choice} htmlFor="cap-ext">
            <span className={styles.dotSel}></span>
            <svg className={styles.icon} viewBox="0 0 64 64">
              <path d="M8 44 V28 l12-8 12 8 v16z M40 40 l10-6 8 6 v6 H40z" strokeWidth="2"/>
            </svg>
            <div>
              <div className={styles.title}>Exterior Only</div>
              <div className={styles.desc}>3D capture of facades and site context—ideal for elevations, setbacks, and envelope checks.</div>

              {state.capScope === 'exterior' && (
                <div className={styles.areaRow}>
                  <input 
                    id="area-ext"
                    className={`${styles.input} ${styles.mini}`}
                    type="number" 
                    placeholder="Enter area" 
                    min="0"
                    value={state.areaExt}
                    onChange={(e) => handleAreaChange('areaExt', e.target.value)}
                  />
                  <span className={styles.unit}>sq&nbsp;ft</span>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Interior & Exterior */}
        <div className={`${styles.choiceWrap} ${styles.span2}`}>
          <input 
            className={styles.choiceInput}
            type="radio" 
            name="capScope" 
            id="cap-both" 
            value="interior-exterior"
            checked={state.capScope === 'interior-exterior'}
            onChange={(e) => handleScopeChange(e.target.value)}
          />
          <label className={styles.choice} htmlFor="cap-both">
            <span className={styles.dotSel}></span>
            <svg className={styles.icon} viewBox="0 0 64 64">
              <path d="M6 50 V26 l14-10 14 10 v24z M34 42 l10-8 14 8 v8 H34z M6 50 h52" strokeWidth="2"/>
            </svg>
            <div>
              <div className={styles.title}>Interior &amp; Exterior</div>
              <div className={styles.desc}>Complete capture—interior spaces plus walkable exterior for coordination and BIM-ready context.</div>

              {state.capScope === 'interior-exterior' && (
                <div className={styles.areaRowSplit}>
                  <label className={styles.miniField}>
                    <span className={styles.labelline}>
                      <strong>Interior</strong>
                      <em className={styles.unitTop}>(sq ft)</em>
                    </span>
                    <input 
                      id="area-both-int"
                      className={`${styles.input} ${styles.mini}`}
                      type="number" 
                      placeholder="Enter area" 
                      min="0"
                      value={state.areaBothInt}
                      onChange={(e) => handleAreaChange('areaBothInt', e.target.value)}
                    />
                  </label>

                  <label className={styles.miniField}>
                    <span className={styles.labelline}>
                      <strong>Exterior</strong>
                      <em className={styles.unitTop}>(sq ft)</em>
                    </span>
                    <input 
                      id="area-both-ext"
                      className={`${styles.input} ${styles.mini}`}
                      type="number" 
                      placeholder="Enter area" 
                      min="0"
                      value={state.areaBothExt}
                      onChange={(e) => handleAreaChange('areaBothExt', e.target.value)}
                    />
                  </label>
                </div>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Map Toggle */}
      <div className={styles.mapToggle}>
        <button 
          className={styles.mapToggleBtn} 
          type="button"
          onClick={handleMapToggle}
        >
          Measure on map
        </button>
      </div>

      {/* Map */}
      {showMap && (
        <MapEstimator 
          address={state.address}
          onSave={handleMapSave}
        />
      )}

      <div className={styles.hint}>
        <a href="#" className={styles.underline} onClick={handleEstimateLinkClick}>
          How to estimate property size
        </a>
      </div>
    </section>
  );
}