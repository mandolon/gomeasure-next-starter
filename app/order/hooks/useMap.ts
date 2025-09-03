'use client';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

export function useMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [drawControl, setDrawControl] = useState<any>(null);
  const [drawnItems, setDrawnItems] = useState<any>(null);
  const [currentSqFt, setCurrentSqFt] = useState(0);
  const [pin, setPin] = useState<any>(null);

  const initMap = () => {
    if (!mapRef.current || !window.L || map) return;

    const isTouch = window.matchMedia('(pointer:coarse)').matches;
    
    const mapInstance = window.L.map(mapRef.current, { 
      zoomControl: true, 
      scrollWheelZoom: !isTouch,
      attributionControl: false,
      preferCanvas: true,
      zoomAnimation: !isTouch,
      fadeAnimation: false,
      markerZoomAnimation: !isTouch
    }).setView([38.5816, -121.4944], 12);
    
    // Add tiles without attribution
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      maxZoom: 20, 
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2
    }).addTo(mapInstance);

    // Parcels overlay
    if (window.L.esri) {
      window.L.esri.dynamicMapLayer({
        url: 'https://mapservices.gis.saccounty.net/arcgis/rest/services/PARCELS/MapServer',
        opacity: 0.6,
        attribution: '',
        updateInterval: 200
      }).addTo(mapInstance);
    }

    // House number labels
    let addressLayer: any = null;
    let updateTimeout: any = null;
    
    function loadAddressLabels() {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      
      if (mapInstance.getZoom() >= 18) {
        updateTimeout = setTimeout(() => {
          if (!addressLayer && window.L.esri) {
            addressLayer = window.L.esri.featureLayer({
              url: 'https://services.arcgis.com/xOi1kZaI0eWDREZv/ArcGIS/rest/services/Address_Points_from_National_Address_Database_view/FeatureServer/0',
              where: "State = 'CA'",
              maxFeatures: 1000,
              precision: 5,
              simplifyFactor: 0.5,
              attribution: '',
              pointToLayer: function(geojson: any, latlng: any) {
                const addNum = geojson.properties.Add_Number || geojson.properties.AddNo_Full;
                if (!addNum) return null;
                
                const marker = window.L.circleMarker(latlng, {
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
            
            addressLayer.addTo(mapInstance);
          }
        }, 300);
      } else {
        if (addressLayer) {
          mapInstance.removeLayer(addressLayer);
          addressLayer = null;
        }
      }
    }
    
    mapInstance.on('zoomend', loadAddressLabels);
    mapInstance.on('movestart', () => {
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
    });
    mapInstance.on('moveend', () => {
      if (mapInstance.getZoom() >= 18) {
        loadAddressLabels();
      }
    });
    
    loadAddressLabels();

    // Draw tools
    const drawn = new window.L.FeatureGroup().addTo(mapInstance);
    const drawCtl = new window.L.Control.Draw({
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
        featureGroup: drawn, 
        edit: true, 
        remove: true 
      }
    });
    mapInstance.addControl(drawCtl);

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
    }

    mapInstance.on(window.L.Draw.Event.CREATED, (e: any) => { 
      drawn.clearLayers(); 
      drawn.addLayer(e.layer); 
      recompute(); 
    });
    mapInstance.on(window.L.Draw.Event.EDITED, recompute);
    mapInstance.on(window.L.Draw.Event.DELETED, recompute);

    setMap(mapInstance);
    setDrawControl(drawCtl);
    setDrawnItems(drawn);
  };

  const createCustomIcon = () => {
    if (!window.L) return null;
    return window.L.divIcon({
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

  const centerOnAddress = (lat: number, lon: number) => {
    if (!map || !window.L) return;
    
    const center = window.L.latLng(lat, lon);
    map.setView(center, 18);
    
    if (pin) {
      map.removeLayer(pin);
    }
    
    const newPin = window.L.marker(center, { icon: createCustomIcon() }).addTo(map);
    setPin(newPin);
  };

  useEffect(() => {
    // Wait for Leaflet to load
    const checkLeaflet = () => {
      if (window.L) {
        initMap();
      } else {
        setTimeout(checkLeaflet, 100);
      }
    };
    checkLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  const invalidateSize = () => {
    if (map) {
      setTimeout(() => map.invalidateSize(), 100);
    }
  };

  return {
    mapRef,
    map,
    currentSqFt,
    centerOnAddress,
    invalidateSize
  };
}