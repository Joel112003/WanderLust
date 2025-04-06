import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../../utilis/css/Map.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = React.forwardRef((
  { 
    listings = [], 
    height = "500px",
    onMarkerClick = null,
    defaultZoom = 11,
    mapStyle = "mapbox://styles/mapbox/streets-v12"
  },
  ref
) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);

  // Filter valid listings with coordinates
  const validListings = useMemo(() => listings.filter((listing) => {
    return (
      listing.geometry?.coordinates?.length === 2 &&
      !isNaN(listing.geometry.coordinates[0]) && 
      !isNaN(listing.geometry.coordinates[1])
    );
  }), [listings]);

  // Calculate center coordinates
  const getCenterCoordinates = useCallback(() => {
    if (validListings.length === 0) return [78.9629, 20.5937]; // Default to India center
    
    if (validListings.length === 1) {
      return validListings[0].geometry.coordinates;
    }

    const coordinates = validListings.map(l => l.geometry.coordinates);
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    return bounds.getCenter();
  }, [validListings]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: getCenterCoordinates(),
      zoom: validListings.length === 1 ? 14 : defaultZoom,
      antialias: true
    });

    // Add navigation controls
    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapInstance.on("load", () => {
      setMapLoaded(true);
      mapRef.current = mapInstance;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [validListings, defaultZoom, mapStyle]);

  // Add/update markers when listings change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear existing markers
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

    // Add new markers
    validListings.forEach(listing => {
      const coordinates = listing.geometry.coordinates;
      
      const el = document.createElement('div');
      el.className = 'custom-marker';
      if (listing._id === selectedMarkerId) {
        el.classList.add('selected');
      }

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(coordinates)
        .addTo(mapRef.current);

      // Add click event
      marker.getElement().addEventListener('click', () => {
        if (onMarkerClick) {
          onMarkerClick(listing._id);
        }
        setSelectedMarkerId(listing._id);
        
        // Fly to the marker location
        mapRef.current.flyTo({
          center: coordinates,
          zoom: 14,
          essential: true
        });
      });

      // Add tooltip on hover
      marker.getElement().addEventListener('mouseenter', () => {
        new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          anchor: 'top',
          offset: [0, -10],
          className: 'marker-tooltip'
        })
          .setLngLat(coordinates)
          .setHTML(`
            <div class="custom-tooltip">
              <h4>${listing.title || 'Unnamed Listing'}</h4>
              <div class="tooltip-location">
                <strong>Location:</strong> ${listing.location || 'Unknown location'}
              </div>
              <div class="tooltip-country">
                <strong>Country:</strong> ${listing.country || 'Unknown country'}
              </div>
            </div>
          `)
          .addTo(mapRef.current);
      });
    });

    // Fit bounds if multiple listings
    if (validListings.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validListings.forEach(listing => {
        bounds.extend(listing.geometry.coordinates);
      });
      mapRef.current.fitBounds(bounds, {
        padding: 100,
        duration: 1000
      });
    }
  }, [validListings, mapLoaded, selectedMarkerId, onMarkerClick]);

  // Geocode function to add marker from address
  const geocodeAndAddMarker = useCallback(async (address) => {
    if (!mapRef.current) return null;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].center;
        
        // Add marker
        new mapboxgl.Marker()
          .setLngLat(coordinates)
          .addTo(mapRef.current);
        
        // Fly to the location
        mapRef.current.flyTo({
          center: coordinates,
          zoom: 14
        });

        return coordinates;
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }, []);

  // Expose map functions via ref
  React.useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    geocodeAndAddMarker,
    flyTo: (coordinates, zoom = 14) => {
      if (!mapRef.current) return;
      mapRef.current.flyTo({
        center: coordinates,
        zoom: zoom,
        essential: true
      });
    }
  }));

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: "100%", 
        height: height,
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative"
      }} 
      className="map-container"
    />
  );
});

export default Map;