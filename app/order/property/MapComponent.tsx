'use client';
import { useEffect, useRef, useState } from 'react';
import { useOrder } from '../context';

declare global {
  interface Window {
    L: any;
  }
}

interface MapComponentProps {
  isVisible: boolean;
  onAreaCalculated: (sqFt: number) => void;
  addressCoords?: { lat: number; lng: number };
}

export default function MapComponent({ isVisible, onAreaCalculated, addressCoords }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawControlRef = useRef<any>(null);
  const drawnLayersRef = useRef<any>(null);
  const addressPinRef = useRef<any>(null);
  const addressLayerRef = useRef<any>(null);
  const [currentSqFt, setCurrentSqFt] = useState(0);

  // Initialize map when visible
  useEffect(() => {
    if (!isVisible || !mapRef.current || mapInstanceRef.current) return;

    // Dynamically load Leaflet scripts and styles
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !window.L) {
        // Load Leaflet CSS
        const leafletCSS = document.createElement('link');
        leafletCSS.rel = 'stylesheet';
        leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(leafletCSS);

        // Load Leaflet Draw CSS
        const leafletDrawCSS = document.createElement('link');
        leafletDrawCSS.rel = 'stylesheet';
        leafletDrawCSS.href = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css';
        document.head.appendChild(leafletDrawCSS);

        // Load Leaflet JS
        await new Promise((resolve) => {
          const leafletJS = document.createElement('script');
          leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          leafletJS.onload = resolve;
          document.head.appendChild(leafletJS);
        });

        // Load Leaflet Draw JS
        await new Promise((resolve) => {
          const leafletDrawJS = document.createElement('script');
          leafletDrawJS.src = 'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js';
          leafletDrawJS.onload = resolve;
          document.head.appendChild(leafletDrawJS);
        });

        // Load Esri Leaflet
        await new Promise((resolve) => {
          const esriLeafletJS = document.createElement('script');
          esriLeafletJS.src = 'https://unpkg.com/esri-leaflet';
          esriLeafletJS.onload = resolve;
          document.head.appendChild(esriLeafletJS);
        });
      }

      initMap();
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isVisible]);

  // Update map view when address coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && addressCoords) {
      const { L } = window;
      const center = L.latLng(addressCoords.lat, addressCoords.lng);
      mapInstanceRef.current.setView(center, 18);
      
      // Remove existing pin and add new one
      if (addressPinRef.current) {
        mapInstanceRef.current.removeLayer(addressPinRef.current);
      }
      
      addressPinRef.current = L.marker(center, { 
        icon: createCustomIcon() 
      }).addTo(mapInstanceRef.current);
    }
  }, [addressCoords]);

  const createCustomIcon = () => {
    const { L } = window;
    return L.divIcon({
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
  };

  const initMap = () => {
    if (!window.L || !mapRef.current) return;

    const { L } = window;
    const isTouch = window.matchMedia('(pointer:coarse)').matches;
    
    // Initialize map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: !isTouch,
      attributionControl: false,
      preferCanvas: true,
      zoomAnimation: !isTouch,
      fadeAnimation: false,
      markerZoomAnimation: !isTouch
    }).setView([38.5816, -121.4944], 12);

    mapInstanceRef.current = map;

    // Add base tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2
    }).addTo(map);

    // Add parcels overlay using Esri Leaflet
    try {
      L.esri.dynamicMapLayer({
        url: 'https://mapservices.gis.saccounty.net/arcgis/rest/services/PARCELS/MapServer',
        opacity: 0.6,
        attribution: '',
        updateInterval: 200
      }).addTo(map);
    } catch (e) {
      console.log('Parcels layer not available');
    }

    // Address labels layer management
    let updateTimeout: NodeJS.Timeout | null = null;

    const loadAddressLabels = () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      if (map.getZoom() >= 18) {
        updateTimeout = setTimeout(() => {
          if (!addressLayerRef.current) {
            try {
              addressLayerRef.current = L.esri.featureLayer({
                url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/ArcGIS/rest/services/Address_Points_from_National_Address_Database_view/FeatureServer/0',
                where: "State = 'CA'",
                maxFeatures: 1000,
                precision: 5,
                simplifyFactor: 0.5,
                attribution: '',
                pointToLayer: function(geojson: any, latlng: any) {
                  const addNum = geojson.properties.Add_Number || geojson.properties.AddNo_Full;
                  if (!addNum) return null;
                  
                  const marker = L.circleMarker(latlng, {
                    radius: 0,
                    opacity: 0,
                    fillOpacity: 0
                  });
                  
                  marker.bindTooltip(String(addNum), {
                    permanent: true,
                    direction: 'center',
                    className: 'hn-label',
                    offset: [0, 0]
                  }).openTooltip();
                  
                  return marker;
                }
              });
              
              addressLayerRef.current.addTo(map);
            } catch (e) {
              console.log('Address labels not available');
            }
          }
        }, 300);
      } else {
        if (addressLayerRef.current) {
          map.removeLayer(addressLayerRef.current);
          addressLayerRef.current = null;
        }
      }
    };

    map.on('zoomend', loadAddressLabels);
    map.on('movestart', () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    });
    map.on('moveend', () => {
      if (map.getZoom() >= 18) {
        loadAddressLabels();
      }
    });

    // Initialize drawing layers
    drawnLayersRef.current = new L.FeatureGroup().addTo(map);

    // Add draw controls
    drawControlRef.current = new L.Control.Draw({
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
        featureGroup: drawnLayersRef.current,
        edit: true,
        remove: true
      }
    });
    map.addControl(drawControlRef.current);

    // Area calculation utility
    const geodesicArea = (latLngs: any[]) => {
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

    const m2ToSf = (m2: number) => m2 * 10.76391041671;

    const recompute = () => {
      let m2 = 0;
      drawnLayersRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Polygon) {
          const ring = layer.getLatLngs()[0];
          if (ring && ring.length > 2) {
            m2 += geodesicArea(ring);
          }
        }
      });
      const sqFt = Math.max(0, Math.round(m2ToSf(m2)));
      setCurrentSqFt(sqFt);
      onAreaCalculated(sqFt);
    };

    // Drawing event handlers
    map.on(L.Draw.Event.CREATED, (e: any) => {
      drawnLayersRef.current.clearLayers();
      drawnLayersRef.current.addLayer(e.layer);
      recompute();
    });

    map.on(L.Draw.Event.EDITED, recompute);
    map.on(L.Draw.Event.DELETED, recompute);

    // Handle window resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial load of address labels
    loadAddressLabels();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  };

  // Trigger map resize when visibility changes
  useEffect(() => {
    if (isVisible && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, [isVisible]);

  return (
    <div className="map-instructions">
      Draw a polygon around your property
      <div ref={mapRef} id="map" style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
}