import React, {
  useEffect, useRef, useState, useCallback, useMemo, useImperativeHandle,
} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_APP_MAPBOX_TOKEN;

const DEFAULT_CENTER = [78.9629, 20.5937];
const CLUSTER_LAYERS = ["clusters", "unclustered-point"];
const MAP_STYLE      = "mapbox://styles/mapbox/streets-v12";
const DEM_SOURCE_URL = "mapbox://mapbox.mapbox-terrain-dem-v1";

const getCoords = (listing) =>
  listing.geometry?.coordinates ?? [listing.longitude, listing.latitude];

const formatPrice = (price) => {
  if (!price) return "Price on request";
  const inr = typeof price === "number" ? Math.round(price * 75) : parseInt(price, 10);
  return `₹${inr.toLocaleString()}`;
};

const getLocationLabel = (listing) => {
  const city = listing.city || "";
  const state = listing.state || "";

  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  return listing.location || listing.country || "";
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .mapbox-marker-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }

  /* Label pill above the pin */
  .mapbox-marker-label {
    background: #fff;
    color: #1e293b;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    white-space: nowrap;
    box-shadow: 0 2px 10px rgba(0,0,0,0.12);
    margin-bottom: 5px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    pointer-events: none;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1.5px solid #e2e8f0;
  }

  /* Pin dot */
  .mapbox-marker-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #3b82f6;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(59,130,246,0.4);
    transition: transform 0.15s ease, background 0.15s ease;
    position: relative;
  }

  /* Pin tail */
  .mapbox-marker-dot::after {
    content: '';
    position: absolute;
    bottom: -7px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 7px solid #3b82f6;
  }

  .mapbox-marker-wrap:hover .mapbox-marker-dot {
    transform: scale(1.2);
    background: #1d4ed8;
  }

  .mapbox-marker-wrap:hover .mapbox-marker-dot::after {
    border-top-color: #1d4ed8;
  }

  .mapbox-marker-wrap:hover .mapbox-marker-label {
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.18);
  }

  .mapbox-marker-wrap.selected .mapbox-marker-dot {
    background: #1d4ed8;
    box-shadow: 0 0 0 4px rgba(29,78,216,0.25), 0 4px 12px rgba(0,0,0,0.2);
  }

  .mapbox-marker-wrap.selected .mapbox-marker-dot::after {
    border-top-color: #1d4ed8;
  }

  .mapbox-marker-wrap.selected .mapbox-marker-label {
    background: #1d4ed8;
    color: #fff;
    border-color: #1d4ed8;
  }

  /* Popup overrides */
  .mapboxgl-popup-content {
    padding: 0 !important;
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 12px 48px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.1) !important;
    font-family: 'DM Sans', sans-serif !important;
    border: 1px solid rgba(0,0,0,0.08);
  }

  .mapboxgl-popup-tip { display: none !important; }

  .mapboxgl-popup-close-button {
    top: 8px !important;
    right: 8px !important;
    width: 24px !important;
    height: 24px !important;
    border-radius: 50% !important;
    background: rgba(255,255,255,0.85) !important;
    backdrop-filter: blur(4px);
    font-size: 14px !important;
    line-height: 24px !important;
    text-align: center !important;
    color: #1e293b !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.12) !important;
    z-index: 10;
  }

  .mapboxgl-popup-close-button:hover {
    background: #fff !important;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
`;

const Map = React.forwardRef((
  {
    listings          = [],
    height            = "500px",
    singleListing     = false,
    onMarkerClick     = null,
    defaultZoom       = 11,
    mapStyle          = MAP_STYLE,
    enableClustering  = true,
    enable3DBuildings = true,
    enableTerrain     = true,
    showMarkers       = true,
  },
  ref
) => {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);
  const popupsRef    = useRef([]);

  const [mapLoaded,  setMapLoaded]  = useState(false);
  const [isLoading,  setIsLoading]  = useState(true);
  const [loadError,  setLoadError]  = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const id = "map-global-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
  }, []);

  const validListings = useMemo(() =>
    listings.filter((l) => {
      const [lng, lat] = getCoords(l);
      return !isNaN(lng) && !isNaN(lat);
    }),
  [listings]);

  const centerCoords = useMemo(() => {
    if (!validListings.length) return DEFAULT_CENTER;
    if (validListings.length === 1) return getCoords(validListings[0]);
    const all = validListings.map(getCoords);
    const bounds = all.reduce(
      (b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(all[0], all[0])
    );
    return [bounds.getCenter().lng, bounds.getCenter().lat];
  }, [validListings]);

  const geojson = useMemo(() => ({
    type: "FeatureCollection",
    features: validListings.map((l) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: getCoords(l) },
      properties: {
        id:        l._id,
        title:     l.title,
        price:     l.price,
        image:     l.images?.[0] ?? l.image?.url ?? "",
        location:  l.location  ?? "",
        city:      l.city      ?? "",
        state:     l.state     ?? "",
        country:   l.country   ?? "",
        bedrooms:  l.bedrooms,
        bathrooms: l.bathrooms,
      },
    })),
  }), [validListings]);

  const clearPopups  = useCallback(() => { popupsRef.current.forEach(p => p.remove()); popupsRef.current = []; }, []);
  const clearMarkers = useCallback(() => { markersRef.current.forEach(m => m.remove()); markersRef.current = []; }, []);

  const flyTo = useCallback((coords, zoom = 14) => {
    mapRef.current?.flyTo({ center: coords, zoom, essential: true, duration: 800 });
  }, []);

  const handleMarkerClick = useCallback((id, coords) => {
    onMarkerClick?.(id);
    setSelectedId(id);
    flyTo(coords);
  }, [onMarkerClick, flyTo]);

  const buildPopupHTML = useCallback((props) => {
    const img = props.image
      ? `<img src="${props.image}" alt="${props.title}" style="width:100%;height:140px;object-fit:cover;display:block;" />`
      : `<div style="width:100%;height:100px;background:linear-gradient(135deg,#eff6ff,#dbeafe);display:flex;align-items:center;justify-content:center;font-size:32px;">🏠</div>`;

    const city = props.city || "";
    const state = props.state || "";
    const country = props.country || "";

    const primaryLocation = city && state ? `${city}, ${state}` : city || state || props.location || "Unknown location";
    const fullLocation = [city, state, country].filter(Boolean).join(", ") || props.location || "Unknown location";
    const showFullLocation = fullLocation !== primaryLocation;

    const beds  = props.bedrooms  ? `<span style="display:flex;align-items:center;gap:3px;"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 7v10M21 7v10M3 12h18M3 7a2 2 0 012-2h14a2 2 0 012 2"/></svg>${props.bedrooms} bd</span>` : "";
    const baths = props.bathrooms ? `<span style="display:flex;align-items:center;gap:3px;"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12h16M4 12a2 2 0 01-2-2V6a2 2 0 012-2h4M20 12v4a4 4 0 01-8 0"/></svg>${props.bathrooms} ba</span>` : "";

    return `
      <div style="width:260px;font-family:'DM Sans',system-ui,sans-serif;animation:fadeIn 0.2s ease;">
        <div style="position:relative;">
          ${img}
          <div style="position:absolute;top:10px;left:10px;background:rgba(59,130,246,0.95);backdrop-filter:blur(8px);padding:5px 12px;border-radius:20px;font-size:11.5px;font-weight:700;color:#fff;box-shadow:0 2px 8px rgba(59,130,246,0.3);display:flex;align-items:center;gap:5px;">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${primaryLocation}
          </div>
        </div>
        <div style="padding:14px 16px 16px;">
          <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:${showFullLocation ? '4px' : '8px'};line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${props.title ?? "Unnamed Property"}</div>
          ${showFullLocation ? `<div style="font-size:11.5px;color:#64748b;margin-bottom:10px;display:flex;align-items:center;gap:4px;"><svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24" style="opacity:0.6;"><circle cx="12" cy="12" r="10"/></svg>${fullLocation}</div>` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:12px;border-top:1px solid #f1f5f9;">
            <span style="font-size:16px;font-weight:800;color:#2563eb;letter-spacing:-0.3px;">${formatPrice(props.price)}<span style="font-size:11px;font-weight:600;color:#94a3b8;margin-left:3px;">/night</span></span>
            ${beds || baths ? `<div style="display:flex;gap:10px;font-size:11px;color:#64748b;font-weight:600;">${beds}${baths}</div>` : ''}
          </div>
        </div>
      </div>`;
  }, []);

  const setupClustering = useCallback((map) => {
    if (map.getSource("listings")) return;

    map.addSource("listings", {
      type: "geojson",
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "listings",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": ["step", ["get", "point_count"], "#3b82f6", 10, "#8b5cf6", 30, "#ec4899"],
        "circle-radius": ["step", ["get", "point_count"], 22, 10, 28, 30, 34],
        "circle-stroke-width": 3,
        "circle-stroke-color": "#fff",
        "circle-opacity": 0.92,
      },
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "listings",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 13,
      },
      paint: { "text-color": "#fff" },
    });

    map.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "listings",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#3b82f6",
        "circle-radius": 9,
        "circle-stroke-width": 3,
        "circle-stroke-color": "#fff",
        "circle-opacity": 0.95,
      },
    });

    map.on("click", "clusters", (e) => {
      const [feature] = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
      map.getSource("listings").getClusterExpansionZoom(
        feature.properties.cluster_id,
        (err, zoom) => {
          if (!err) map.easeTo({ center: feature.geometry.coordinates, zoom, duration: 500 });
        }
      );
    });

    map.on("click", "unclustered-point", (e) => {
      const { properties, geometry } = e.features[0];
      clearPopups();
      const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: false, maxWidth: "none", offset: 12 })
        .setLngLat(geometry.coordinates)
        .setHTML(buildPopupHTML(properties))
        .addTo(map);
      popupsRef.current.push(popup);
      handleMarkerClick(properties.id, geometry.coordinates);
    });

    CLUSTER_LAYERS.forEach((layer) => {
      map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
    });
  }, [geojson, buildPopupHTML, handleMarkerClick, clearPopups]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let map;
    try {
      map = new mapboxgl.Map({
        container: containerRef.current,
        style:     mapStyle,
        center:    centerCoords,
        zoom:      validListings.length === 1 ? 14 : defaultZoom,
        pitch:     singleListing ? 45 : 0,
        antialias: true,
      });
    } catch {
      setLoadError(true);
      setIsLoading(false);
      return;
    }

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true, showUserHeading: true, showAccuracyCircle: false }),
      "top-right"
    );
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");
    map.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    map.on("load", () => {
      if (enableTerrain) {
        map.addSource("mapbox-dem", { type: "raster-dem", url: DEM_SOURCE_URL, tileSize: 512, maxzoom: 14 });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
      }

      if (enable3DBuildings) {
        map.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#e2e8f0",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base":   ["get", "min_height"],
            "fill-extrusion-opacity": 0.65,
          },
        });
      }

      if (enableClustering && validListings.length > 1) setupClustering(map);

      mapRef.current = map;
      setMapLoaded(true);
      setIsLoading(false);
    });

    map.on("error", () => { setLoadError(true); setIsLoading(false); });

    return () => {
      clearMarkers();
      clearPopups();
      map.remove();
      mapRef.current = null;
    };

  }, []);

  useEffect(() => {
    if (!mapRef.current || !mapLoaded || enableClustering || !showMarkers) return;

    clearMarkers();
    clearPopups();

    validListings.forEach((listing) => {
      const coords     = getCoords(listing);
      const isSelected = listing._id === selectedId;
      const label      = getLocationLabel(listing);

      const wrap = document.createElement("div");
      wrap.className = `mapbox-marker-wrap${isSelected ? " selected" : ""}`;

      if (label) {
        const labelEl = document.createElement("div");
        labelEl.className = "mapbox-marker-label";
        labelEl.textContent = label;
        wrap.appendChild(labelEl);
      }

      const dot = document.createElement("div");
      dot.className = "mapbox-marker-dot";
      wrap.appendChild(dot);

      const marker = new mapboxgl.Marker({ element: wrap, anchor: "bottom" })
        .setLngLat(coords)
        .addTo(mapRef.current);

      wrap.addEventListener("click", () => {
        clearPopups();
        const popup = new mapboxgl.Popup({ closeButton: true, closeOnClick: false, maxWidth: "none", offset: 22 })
          .setLngLat(coords)
          .setHTML(buildPopupHTML({
            title:    listing.title,
            price:    listing.price,
            image:    listing.images?.[0] ?? listing.image?.url,
            location: listing.location,
            city:     listing.city,
            state:    listing.state,
            country:  listing.country,
            bedrooms: listing.bedrooms,
            bathrooms:listing.bathrooms,
          }))
          .addTo(mapRef.current);
        popupsRef.current.push(popup);
        handleMarkerClick(listing._id, coords);
      });

      markersRef.current.push(marker);
    });

    if (validListings.length > 1) {
      const bounds = validListings.reduce(
        (b, l) => b.extend(getCoords(l)),
        new mapboxgl.LngLatBounds(getCoords(validListings[0]), getCoords(validListings[0]))
      );
      mapRef.current.fitBounds(bounds, { padding: 80, duration: 800 });
    }
  }, [validListings, mapLoaded, selectedId, enableClustering, showMarkers, buildPopupHTML, handleMarkerClick, clearMarkers, clearPopups]);

  useImperativeHandle(ref, () => ({
    getMap:      () => mapRef.current,
    flyTo,
    clearMarkers,
    clearPopups,
    fitToBounds: (coords, padding = 80) => {
      if (!mapRef.current || !coords.length) return;
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      mapRef.current.fitBounds(bounds, { padding, duration: 800 });
    },
  }));

  return (
    <div style={{
      position: "relative", width: "100%", height,
      borderRadius: "18px", overflow: "hidden",
      boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
    }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
{isLoading && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #f8fafc, #eff6ff)",
          gap: "14px",
        }}>
          <div style={{
            width: "40px", height: "40px",
            border: "3px solid #dbeafe",
            borderTop: "3px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b", letterSpacing: "0.02em" }}>
            Loading map…
          </span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
{loadError && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #f8fafc, #fff1f2)",
          gap: "10px",
        }}>
          <span style={{ fontSize: "36px" }}>🗺️</span>
          <p style={{ fontSize: "15px", fontWeight: 700, color: "#1e293b", margin: 0 }}>Map failed to load</p>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>Check your Mapbox token or network.</p>
        </div>
      )}
{!isLoading && !loadError && validListings.length > 0 && (
        <div style={{
          position: "absolute", bottom: "40px", right: "14px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: "999px",
          padding: "5px 13px",
          fontSize: "12px", fontWeight: 700, color: "#1e293b",
          boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          pointerEvents: "none",
          border: "1px solid rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", gap: "5px",
        }}>
          <span style={{ color: "#3b82f6" }}>●</span>
          {validListings.length} {validListings.length === 1 ? "listing" : "listings"}
        </div>
      )}
    </div>
  );
});

Map.displayName = "Map";
export default Map;
