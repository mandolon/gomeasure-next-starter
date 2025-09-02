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
  const [currentSqFt, setCurrentSqFt] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize map when visible
  useEffect(() => {
    if (!mounted || !isVisible || !mapRef.current || mapInstanceRef.current) return;

    const initMap = () => {
      if (typeof window === 'undefined' || !window.L) return;

      const isTouch = window.matchMedia('(pointer:coarse)').matches;
      
      const map = window.L.map(mapRef.current, { 
        zoomControl: true, 
        scrollWheelZoom: !isTouch,
        attributionControl: false,
        preferCanvas: true,
        zoomAnimation: !isTouch,
        fadeAnimation: false,
        markerZoomAnimation: !isTouch
      }).setView([38.5816, -121.4944], 12);
      
      mapInstanceRef.current = map;
      
      // Add tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 20, 
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2
      }).addTo(map);

      // Parcels overlay
      if (window.L.esri) {
        window.L.esri.dynamicMapLayer({
          url: 'https://mapservices.gis.saccounty.net/arcgis/rest/services/PARCELS/MapServer',
          opacity: 0.6,
          attribution: '',
          updateInterval: 200
        }).addTo(map);
      }

      // Draw tools
      const drawnItems = new window.L.FeatureGroup().addTo(map);
      drawnLayersRef.current = drawnItems;
      
      const drawControl = new window.L.Control.Draw({
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
          featureGroup: drawnItems, 
          edit: true, 
          remove: true 
        }
      });
      map.addControl(drawControl);
      drawControlRef.current = drawControl;

      // Area calculation
      if (!window.L.GeometryUtil) window.L.GeometryUtil = {};
      window.L.GeometryUtil.geodesicArea = function (latLngs: any[]) {
        let area = 0, len = latLngs.length, d2r = Math.PI/180, R = 6378137;
        if (len > 2) {
          for (let i = 0; i < len; i++) {
            const p1 = latLngs[i], p2 = latLngs[(i + 1) % len];
            area += ((p2.lng - p1.lng) * d2r) * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
          }
        }
        return Math.abs(area * R * R / 2);
      };
      
      const m2ToSf = (m2: number) => m2 * 10.76391041671;

      function recompute() {
        let m2 = 0;
        drawnItems.eachLayer((layer: any) => {
          if (layer instanceof window.L.Polygon) {
            const ring = layer.getLatLngs()[0];
            if (ring && ring.length > 2) {
              m2 += window.L.GeometryUtil.geodesicArea(ring);
            }
          }
        });
        const sqFt = Math.max(0, Math.round(m2ToSf(m2)));
        setCurrentSqFt(sqFt);
        onAreaCalculated(sqFt);
      }

      map.on(window.L.Draw.Event.CREATED, (e: any) => { 
        drawnItems.clearLayers(); 
        drawnItems.addLayer(e.layer); 
        recompute(); 
      });
      map.on(window.L.Draw.Event.EDITED, recompute);
      map.on(window.L.Draw.Event.DELETED, recompute);

      // Handle resize
      const handleResize = () => {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
    };

    // Initialize map after a short delay to ensure Leaflet is loaded
    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);
  }, [mounted, isVisible, onAreaCalculated]);

  // Handle address coordinates
  useEffect(() => {
    if (addressCoords && mapInstanceRef.current && window.L) {
      const map = mapInstanceRef.current;
      const center = window.L.latLng(addressCoords.lat, addressCoords.lng);
      map.setView(center, 18);
      
      // Remove old pin
      if (addressPinRef.current) {
        map.removeLayer(addressPinRef.current);
      }
      
      // Create custom marker
      const customIcon = window.L.divIcon({
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
      
      // Add new pin
      const pin = window.L.marker(center, { icon: customIcon }).addTo(map);
      addressPinRef.current = pin;
    }
  }, [addressCoords]);

  // Invalidate size when visibility changes
  useEffect(() => {
    if (mapInstanceRef.current && isVisible) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, [isVisible]);

  if (!mounted) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="map-instructions">
      Draw a polygon around your property
      <div ref={mapRef} id="map" style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
}