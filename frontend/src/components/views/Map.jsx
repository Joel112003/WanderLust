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
      ? `<img src="${props.image}" alt="${props.title}" class="block h-[140px] w-full object-cover" />`
      : `<div class="flex h-[100px] w-full items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-[32px]">🏠</div>`;

    const city = props.city || "";
    const state = props.state || "";
    const country = props.country || "";

    const primaryLocation = city && state ? `${city}, ${state}` : city || state || props.location || "Unknown location";
    const fullLocation = [city, state, country].filter(Boolean).join(", ") || props.location || "Unknown location";
    const showFullLocation = fullLocation !== primaryLocation;

    const beds  = props.bedrooms  ? `<span class="flex items-center gap-1"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 7v10M21 7v10M3 12h18M3 7a2 2 0 012-2h14a2 2 0 012 2"/></svg>${props.bedrooms} bd</span>` : "";
    const baths = props.bathrooms ? `<span class="flex items-center gap-1"><svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 12h16M4 12a2 2 0 01-2-2V6a2 2 0 012-2h4M20 12v4a4 4 0 01-8 0"/></svg>${props.bathrooms} ba</span>` : "";

    return `
      <div class="w-[260px] font-sans">
        <div class="relative">
          ${img}
          <div class="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-blue-500/95 px-3 py-1 text-[11.5px] font-bold text-white shadow-[0_2px_8px_rgba(59,130,246,0.3)] backdrop-blur">
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${primaryLocation}
          </div>
        </div>
        <div class="px-4 pb-4 pt-3.5">
          <div class="${showFullLocation ? "mb-1" : "mb-2"} line-clamp-2 text-sm font-bold leading-snug text-slate-900">${props.title ?? "Unnamed Property"}</div>
          ${showFullLocation ? `<div class="mb-2.5 flex items-center gap-1 text-[11.5px] text-slate-500"><svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24" class="opacity-60"><circle cx="12" cy="12" r="10"/></svg>${fullLocation}</div>` : ''}
          <div class="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-3">
            <span class="text-base font-extrabold tracking-[-0.3px] text-blue-600">${formatPrice(props.price)}<span class="ml-1 text-[11px] font-semibold text-slate-400">/night</span></span>
            ${beds || baths ? `<div class="flex gap-2.5 text-[11px] font-semibold text-slate-500">${beds}${baths}</div>` : ''}
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
      wrap.className = "group relative flex cursor-pointer flex-col items-center font-sans";

      if (label) {
        const labelEl = document.createElement("div");
        labelEl.className = `mb-[5px] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all duration-150 ${
          isSelected
            ? "border-blue-700 bg-blue-700 text-white"
            : "border-slate-200 bg-white text-slate-800 group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
        }`;
        labelEl.textContent = label;
        wrap.appendChild(labelEl);
      }

      const dot = document.createElement("div");
      dot.className = `h-3.5 w-3.5 rounded-full border-[3px] border-white shadow-[0_2px_8px_rgba(59,130,246,0.4)] transition-all duration-150 ${
        isSelected
          ? "bg-blue-700 ring-4 ring-blue-700/25"
          : "bg-blue-500 group-hover:scale-110 group-hover:bg-blue-700"
      }`;

      const tail = document.createElement("div");
      tail.className = `-mt-px h-0 w-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent ${
        isSelected ? "border-t-blue-700" : "border-t-blue-500 group-hover:border-t-blue-700"
      }`;

      wrap.appendChild(dot);
      wrap.appendChild(tail);

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
    <div className="relative w-full overflow-hidden rounded-[18px] shadow-[0_4px_32px_rgba(0,0,0,0.12)]" style={{ height }}>
      <div ref={containerRef} className="h-full w-full" />
{isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-500" />
          <span className="text-[13px] font-semibold tracking-[0.02em] text-slate-500">
            Loading map…
          </span>
        </div>
      )}
{loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-gradient-to-br from-slate-50 to-rose-50">
          <span className="text-4xl">🗺️</span>
          <p className="m-0 text-[15px] font-bold text-slate-800">Map failed to load</p>
          <p className="m-0 text-[13px] text-slate-400">Check your Mapbox token or network.</p>
        </div>
      )}
{!isLoading && !loadError && validListings.length > 0 && (
        <div className="pointer-events-none absolute bottom-10 right-3.5 flex items-center gap-1 rounded-full border border-black/5 bg-white/95 px-3 py-1 text-xs font-bold text-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.1)] backdrop-blur">
          <span className="text-blue-500">●</span>
          {validListings.length} {validListings.length === 1 ? "listing" : "listings"}
        </div>
      )}
    </div>
  );
});

Map.displayName = "Map";
export default Map;
