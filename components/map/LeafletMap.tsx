"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    L: any;
  }
}

interface LeafletMapProps {
  onAreaMeasured: (area: number) => void;
  address?: string;
}

export default function LeafletMap({
  onAreaMeasured,
  address,
}: LeafletMapProps) {
  const mapRef = useRef<any>(null);
  const drawnItemsRef = useRef<any>(null);
  const pinRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Wait for Leaflet to be loaded
    const checkAndInit = () => {
      if (window.L && !mapInitialized.current) {
        initMap();
      } else if (!window.L) {
        setTimeout(checkAndInit, 100);
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current || mapInitialized.current) return;

      const L = window.L;
      const isTouch = window.matchMedia("(pointer:coarse)").matches;

      mapInitialized.current = true;

      // Initialize map
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: !isTouch,
        attributionControl: false,
        preferCanvas: true,
        zoomAnimation: !isTouch,
        fadeAnimation: false,
        markerZoomAnimation: !isTouch,
      }).setView([38.5816, -121.4944], 12); // Sacramento, CA

      // Add tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 2,
      }).addTo(mapRef.current);

      // Add parcel overlay if esri-leaflet is loaded
      if (window.L.esri) {
        L.esri
          .dynamicMapLayer({
            url: "https://mapservices.gis.saccounty.net/arcgis/rest/services/PARCELS/MapServer",
            opacity: 0.6,
            attribution: "",
          })
          .addTo(mapRef.current);
      }

      // Initialize draw items layer
      drawnItemsRef.current = new L.FeatureGroup();
      mapRef.current.addLayer(drawnItemsRef.current);

      // Initialize draw controls
      const drawControl = new L.Control.Draw({
        position: "topleft",
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: "#db0f83",
              weight: 2,
              opacity: 0.8,
            },
          },
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
          edit: true,
          remove: true,
        },
      });
      mapRef.current.addControl(drawControl);

      // Add GeometryUtil if not present
      if (!L.GeometryUtil) L.GeometryUtil = {};
      L.GeometryUtil.geodesicArea = function (latLngs: any[]) {
        let area = 0;
        const len = latLngs.length;
        const d2r = Math.PI / 180;
        const R = 6378137;
        if (len > 2) {
          for (let i = 0; i < len; i++) {
            const p1 = latLngs[i];
            const p2 = latLngs[(i + 1) % len];
            area +=
              (p2.lng - p1.lng) *
              d2r *
              (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
          }
        }
        return Math.abs((area * R * R) / 2);
      };

      const m2ToSf = (m2: number) => m2 * 10.76391041671;

      // Handle area calculation
      const recompute = () => {
        let totalArea = 0;
        drawnItemsRef.current.eachLayer((layer: any) => {
          if (layer instanceof L.Polygon) {
            const ring = layer.getLatLngs()[0];
            if (ring && ring.length > 2) {
              totalArea += L.GeometryUtil.geodesicArea(ring);
            }
          }
        });
        const sqft = Math.max(0, Math.round(m2ToSf(totalArea)));
        onAreaMeasured(sqft);
      };

      // Event handlers
      mapRef.current.on(L.Draw.Event.CREATED, (e: any) => {
        drawnItemsRef.current?.clearLayers();
        drawnItemsRef.current?.addLayer(e.layer);
        recompute();
      });

      mapRef.current.on(L.Draw.Event.EDITED, recompute);
      mapRef.current.on(L.Draw.Event.DELETED, () => {
        onAreaMeasured(0);
      });

      // Handle window resize
      let resizeTimeout: number;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 100);
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleResize);
    };

    checkAndInit();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitialized.current = false;
      }
    };
  }, []);

  // Create custom marker icon
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
      className: "custom-map-marker",
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    });
  };

  // Update map when address changes
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.L ||
      !mapRef.current ||
      !address
    )
      return;

    const CA_VIEWBOX = "-124.48,32.53,-114.13,42.01";

    // Geocode address and center map
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1&viewbox=${CA_VIEWBOX}&q=${encodeURIComponent(address)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data[0] && mapRef.current) {
          const { lat, lon } = data[0];
          const center = window.L.latLng(parseFloat(lat), parseFloat(lon));
          mapRef.current.setView(center, 18);

          // Remove existing pin if any
          if (pinRef.current) {
            mapRef.current.removeLayer(pinRef.current);
          }

          // Add new pin
          const icon = createCustomIcon();
          if (icon) {
            pinRef.current = window.L.marker(center, { icon }).addTo(
              mapRef.current,
            );
          }
        }
      })
      .catch((error) => console.error("Error geocoding address:", error));
  }, [address]);

  return (
    <>
      <style jsx>{`
        .custom-map-marker {
          background: transparent !important;
          border: none !important;
          animation: dropIn 0.3s ease-out;
        }

        @keyframes dropIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", minHeight: "400px" }}
      />
    </>
  );
}
