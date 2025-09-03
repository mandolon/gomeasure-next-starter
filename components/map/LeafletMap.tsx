"use client";

import { useEffect, useRef, useState } from "react";

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
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let checkCount = 0;
    const maxChecks = 50; // 5 seconds max wait

    const checkAndInit = () => {
      checkCount++;

      // Check if all required libraries are loaded
      const leafletLoaded = typeof window.L !== "undefined";
      const drawLoaded =
        leafletLoaded && window.L.Control && window.L.Control.Draw;

      if (
        leafletLoaded &&
        drawLoaded &&
        !mapRef.current &&
        mapContainerRef.current
      ) {
        initMap();
      } else if (checkCount < maxChecks) {
        setTimeout(checkAndInit, 100);
      } else {
        console.error("Failed to load Leaflet libraries after 5 seconds");
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current || mapRef.current) return;

      try {
        const L = window.L;
        const isTouch = window.matchMedia("(pointer:coarse)").matches;

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
        setTimeout(() => {
          if (window.L && window.L.esri && mapRef.current) {
            L.esri
              .dynamicMapLayer({
                url: "https://mapservices.gis.saccounty.net/arcgis/rest/services/PARCELS/MapServer",
                opacity: 0.6,
                attribution: "",
              })
              .addTo(mapRef.current);
          }
        }, 500);

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
        if (!L.GeometryUtil) {
          L.GeometryUtil = {};
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
        }

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

        setMapReady(true);
        console.log("Map initialized successfully");
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    checkAndInit();

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error("Error removing map:", e);
        }
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  // Create custom marker icon
  const createCustomIcon = () => {
    if (!window.L) return null;

    try {
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
    } catch (error) {
      console.error("Error creating custom icon:", error);
      return null;
    }
  };

  // Update map when address changes
  useEffect(() => {
    if (!mapReady || !address || !mapRef.current) return;

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
            try {
              mapRef.current.removeLayer(pinRef.current);
            } catch (e) {
              console.error("Error removing pin:", e);
            }
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
  }, [address, mapReady]);

  return (
    <>
      <style jsx>{`
        :global(.custom-map-marker) {
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

        :global(.leaflet-container) {
          width: 100%;
          height: 100%;
          min-height: 400px;
          border-radius: 10px;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", minHeight: "400px" }}
      />
    </>
  );
}
