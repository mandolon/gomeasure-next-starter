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
          dr