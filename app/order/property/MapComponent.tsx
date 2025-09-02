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

  // Initialize map when visible using EXACT code from working HTML
  useEffect(() => {
    if (!mounted || !isVisible || !mapRef.current || mapInstanceRef.current) return;

    const initMap = () => {
      if (typeof window === 'undefined' || !window.L) return;

      // EXACT CODE FROM WORKING HTML
      const isTouch = window.matchMedia('(pointer:coarse)').matches;
      
      const map = window.L.map(mapRef.current, { 
        zoomControl: true, 
        scrollWheelZoom: !isTouch,
        attributionControl: false, // Completely remove attribution control
        // Performance optimizations
        preferCanvas: true, // Use canvas renderer for better performance
        zoomAnimation: !isTouch, // Disable zoom animations on mobile
        fadeAnimation: false, // Disable tile fade for faster rendering
        markerZoomAnimation: !isTouch // Disable marker animations on mobile
      }).setView([38.5816, -121.4944], 12);
      
      mapInstanceRef.current = map;
      
      // Add tiles without attribution
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        maxZoom: 20, 
        updateWhenIdle: true, // Update tiles only when map stops moving
        updateWhenZooming: false, // Don't update while zooming
        keepBuffer: 2 // Reduce tile buffer for mobile
      }).addTo(map);

      // Parcels overlay - with performance settings
      if (window.L.esri) {
        window.L.esri.dynamicMapLayer({
          url: 'https://mapservices.gis.saccounty.net/arcgis/rest/services/PARCELS/MapServer',
          opacity: 0.6,
          attribution: '', // Remove parcel attribution
          updateInterval: 200 // Throttle updates
        }).addTo(map);
      }

      // House number labels from National Address Database
      // Only render at zoom >= 18 for performance
      let addressLayer: any = null;
      let updateTimeout: any = null;
      
      function loadAddressLabels() {
        // Clear any pending updates
        if (updateTimeout) {
          clearTimeout(updateTimeout);
        }
        
        if (map.getZoom() >= 18) {
          // Throttle address loading
          updateTimeout = setTimeout(() => {
            if (!addressLayer && window.L.esri) {
              // Create the feature layer with California filter
              addressLayer = window.L.esri.featureLayer({
                url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/ArcGIS/rest/services/Address_Points_from_National_Address_Database_view/FeatureServer/0',
                where: "State = 'CA'",
                // Performance limits
                maxFeatures: 1000, // Reduced from 2000
                precision: 5, // Reduce coordinate precision
                simplifyFactor: 0.5, // Simplify geometries
                attribution: '', // No attribution for this layer
                // Custom rendering for house numbers
                pointToLayer: function(geojson: any, latlng: any) {
                  // Skip if no address number
                  const addNum = geojson.properties.Add_Number || geojson.properties.AddNo_Full;
                  if (!addNum) return null;
                  
                  // Create invisible marker with permanent tooltip
                  const marker = window.L.circleMarker(latlng, {
                    radius: 0,
                    opacity: 0,
                    fillOpacity: 0
                  });
                  
                  // Attach house number as tooltip
                  marker.bindTooltip(String(addNum), {
                    permanent: true,
                    direction: 'center',
                    className: 'hn-label',
                    offset: [0, 0]
                  }).openTooltip();
                  
                  return marker;
                }
              });
              
              addressLayer.addTo(map);
            }
          }, 300); // 300ms delay to prevent rapid loading
        } else {
          // Remove layer when zoomed out
          if (addressLayer) {
            map.removeLayer(addressLayer);
            addressLayer = null;
          }
        }
      }
      
      // Monitor zoom changes with debouncing
      map.on('zoomend', loadAddressLabels);
      
      // Don't load addresses while moving at high zoom (performance)
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
      
      // Initial check
      loadAddressLabels();

      // Draw tools
      const drawn = new window.L.FeatureGroup().addTo(map);
      drawnLayersRef.current = drawn;
      
      const drawCtl = new window.L.Control.Draw({
        position: 'topleft',
        draw: {
          polygon: { 
            allowIntersection: false, 
            showArea: true, 
            shapeOptions: { 
              color: '#db0f83', 
              weight: 2,
              opacity: 0.8 // Slightly transparent for performance
            } 
          },
          polyline: false, 
          rectangle: false, 
          circle: false, 
          marker: false, 
          circlemarker: false
        },
        edit: { 
          featureGroup: drawn, 
          edit: true, 
          remove: true 
        }
      });
      map.addControl(drawCtl);
      drawControlRef.current = drawCtl;

      // Area calculation - EXACT CODE FROM HTML
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
        drawn.eachLayer((layer: any) => {
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
        drawn.clearLayers(); 
        drawn.addLayer(e.layer); 
        recompute(); 
      });
      map.on(window.L.Draw.Event.EDITED, recompute);
      map.on(window.L.Draw.Event.DELETED, recompute);

      // Debounced resize handler for performance
      let resizeTimeout: any;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          map.invalidateSize();
        }, 100);
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
    };

    // Wait for Leaflet to load
    const checkAndInit = () => {
      if (window.L && window.L.esri) {
        initMap();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };
    
    checkAndInit();
  }, [mounted, isVisible, onAreaCalculated]);

  // Handle address coordinates - EXACT MARKER CODE FROM HTML
  useEffect(() => {
    if (addressCoords && mapInstanceRef.current && window.L) {
      const map = mapInstanceRef.current;
      const center = window.L.latLng(addressCoords.lat, addressCoords.lng);
      map.setView(center, 18);
      
      // Remove old pin
      if (addressPinRef.current) {
        map.removeLayer(addressPinRef.current);
      }
      
      // Custom marker icon - EXACT CODE FROM HTML
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