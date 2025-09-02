import { useEffect, useRef, useState } from 'react';
import styles from '../styles/MapEstimator.module.css';

export default function MapEstimator({ address, onSave }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [currentArea, setCurrentArea] = useState(0);
  const [drawnLayers, setDrawnLayers] = useState(null);
  const [drawControl, setDrawControl] = useState(null);
  
  useEffect(() => {
    // Only initialize if running in browser
    if (typeof window === 'undefined') return;
    
    const initMap = async () => {
      try {
        // Dynamic imports for client-side only
        const L = (await import('leaflet')).default;
        await import('leaflet-draw');
        await import('esri-leaflet');
        
        // Create map
        const mapInstance = L.map(mapRef.current, {
          zoomControl: true,
          scrollWheelZoom: !window.matchMedia('(pointer:coarse)').matches,
          attributionControl: false,
          preferCanvas: true,
          zoomAnimation: !window.matchMedia('(pointer:coarse)').matches,
          fadeAnimation: false,
          markerZoomAnimation: !window.matchMedia('(pointer:coarse)').matches
        }).setView([38.5816, -121.4944], 12);

        // Add base tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
          updateWhenIdle: true,
          updateWhenZooming: false,
          keepBuffer: 2
        }).addTo(mapInstance);

        // Add parcels overlay if available
        if (window.L && window.L.esri) {
          L.esri.dynamicMapLayer({
            url: 'https://mapservices.gis.saccounty.net/arcgis/rest/services/PARCELS/MapServer',
            opacity: 0.6,
            attribution: '',
            updateInterval: 200
          }).addTo(mapInstance);
        }

        // Initialize drawing
        const drawnGroup = new L.FeatureGroup().addTo(mapInstance);
        setDrawnLayers(drawnGroup);

        const drawControlInstance = new L.Control.Draw({
          position: 'topleft',
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true,
              shapeOptions: {
                color: '#db0f83',
                weight: 2,
                opacity: 0.8
              }
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
          },
          edit: {
            featureGroup: drawnGroup,
            edit: true,
            remove: true
          }
        });

        mapInstance.addControl(drawControlInstance);
        setDrawControl(drawControlInstance);

        // Area calculation helper
        const calculateGeodesicArea = (latLngs) => {
          let area = 0;
          const len = latLngs.length;
          const d2r = Math.PI / 180;
          const R = 6378137;
          
          if (len > 2) {
            for (let i = 0; i < len; i++) {
              const p1 = latLngs[i];
              const p2 = latLngs[(i + 1) % len];
              area += ((p2.lng - p1.lng) * d2r) * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
            }
          }
          return Math.abs(area * R * R / 2);
        };

        const m2ToSqFt = (m2) => m2 * 10.76391041671;

        const recompute = () => {
          let totalM2 = 0;
          drawnGroup.eachLayer(layer => {
            if (layer instanceof L.Polygon) {
              const ring = layer.getLatLngs()[0];
              if (ring && ring.length > 2) {
                totalM2 += calculateGeodesicArea(ring);
              }
            }
          });
          const sqFt = Math.max(0, Math.round(m2ToSqFt(totalM2)));
          setCurrentArea(sqFt);
        };

        // Map events
        mapInstance.on(L.Draw.Event.CREATED, (e) => {
          drawnGroup.clearLayers();
          drawnGroup.addLayer(e.layer);
          recompute();
        });

        mapInstance.on(L.Draw.Event.EDITED, recompute);
        mapInstance.on(L.Draw.Event.DELETED, recompute);

        setMap(mapInstance);

        // Center on address if provided
        if (address) {
          try {
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
            );
            const geocodeData = await geocodeResponse.json();
            if (geocodeData.length > 0) {
              const { lat, lon } = geocodeData[0];
              mapInstance.setView([parseFloat(lat), parseFloat(lon)], 18);
              
              // Add marker
              const customIcon = L.divIcon({
                html: `
                  <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="#db0f83"/>
                    <circle cx="16" cy="16" r="6" fill="white"/>
                    <circle cx="16" cy="16" r="3" fill="#db0f83"/>
                  </svg>
                `,
                className: 'custom-map-marker',
                iconSize: [32, 40],
                iconAnchor: [16, 40],
                popupAnchor: [0, -40]
              });
              
              L.marker([parseFloat(lat), parseFloat(lon)], { icon: customIcon }).addTo(mapInstance);
            }
          } catch (error) {
            console.warn('Geocoding failed:', error);
          }
        }

      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [address]);

  const handleSave = () => {
    if (currentArea > 0 && onSave) {
      onSave(currentArea);
    }
  };

  const formatNumber = (num) => {
    return Math.round(num * 10) / 10;
  };

  return (
    <div className={styles.mapWrap}>
      <div className={styles.mapInstructions}>
        Draw a polygon around your property
      </div>
      
      <div ref={mapRef} className={styles.map}></div>
      
      <div className={styles.mapResults}>
        <div className={styles.measuredValue}>
          {formatNumber(currentArea).toLocaleString()} sq ft
        </div>
        <button 
          className={styles.btnSave}
          onClick={handleSave}
          disabled={currentArea === 0}
        >
          Save to area field
        </button>
      </div>
    </div>
  );
}