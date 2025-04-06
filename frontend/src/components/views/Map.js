import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "../../utilis/css/Map.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = React.forwardRef((
  { 
    listings = [], 
    container = "map",
    height = "500px", 
    singleListing = false,
    onMarkerClick = null,
    defaultZoom = 11,
    mapStyle = "mapbox://styles/mapbox/streets-v12",
    enableClustering = true,
    enable3DBuildings = true,
    enableTerrain = true,
    showListingFeatures = true,
    showMarkers = true
  },
  ref
) => {
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);
  const tooltipsRef = useRef([]);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoized filtered listings
  const validListings = useMemo(() => listings.filter((listing) => {
    return (
      // Check for direct latitude/longitude properties
      (listing.latitude && listing.longitude && 
       !isNaN(listing.latitude) && !isNaN(listing.longitude)) ||
      // Check for geometry.coordinates
      (listing.geometry?.coordinates?.length === 2 &&
       !isNaN(listing.geometry.coordinates[0]) && 
       !isNaN(listing.geometry.coordinates[1])) ||
      // Check for geometry.type and coordinates
      (listing.geometry?.type === 'Point' && 
       listing.geometry?.coordinates?.length === 2 &&
       !isNaN(listing.geometry.coordinates[0]) && 
       !isNaN(listing.geometry.coordinates[1]))
    );
  }), [listings]);

  // Calculate center coordinates
  const getCenterCoordinates = useCallback(() => {
    if (validListings.length === 0) return [78.9629, 20.5937]; // Default to India center
    
    if (validListings.length === 1) {
      const listing = validListings[0];
      return listing.geometry?.coordinates || [listing.longitude, listing.latitude];
    }

    const coordinates = validListings.map((l) => 
      l.geometry?.coordinates || [l.longitude, l.latitude]
    );
    
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    return bounds.getCenter();
  }, [validListings]);

  // Format price with currency
  const formatPrice = useCallback((price) => {
    if (!price) return "Price on request";
    const numericPrice = typeof price === "number" ? Math.round(price * 75) : parseInt(price, 10);
    return `₹${numericPrice.toLocaleString()}`;
  }, []);

  // Create GeoJSON data for clustering
  const createGeoJSON = useCallback(() => ({
    type: "FeatureCollection",
    features: validListings.map((listing) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: listing.geometry?.coordinates || [listing.longitude, listing.latitude]
      },
      properties: {
        id: listing._id,
        title: listing.title,
        price: listing.price,
        image: listing.images?.[0] || listing.image?.url,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
      }
    }))
  }), [validListings]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;
    setIsLoading(true);

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: getCenterCoordinates(),
      zoom: validListings.length === 1 ? 14 : defaultZoom,
      pitch: singleListing ? 45 : 0,
      bearing: 0,
      antialias: true,
      terrain: enableTerrain ? { 
        source: 'mapbox-dem', 
        exaggeration: 1.5 
      } : undefined
    });

    // Add controls
    const navControl = new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: true
    });
    mapInstance.addControl(navControl, "top-right");

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: false
    });
    mapInstance.addControl(geolocateControl, "top-right");

    mapInstance.addControl(new mapboxgl.FullscreenControl(), "top-right");
    mapInstance.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    // Add terrain and 3D buildings on load
    mapInstance.on("load", () => {
      if (enableTerrain) {
        mapInstance.addSource('mapbox-dem', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
          tileSize: 512,
          maxzoom: 14
        });
      }

      if (enable3DBuildings) {
        mapInstance.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#ddd',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.7
          }
        });
      }

      if (enableClustering && validListings.length > 1) {
        setupClustering(mapInstance);
      }

      setMapLoaded(true);
      setIsLoading(false);
      mapRef.current = mapInstance;
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [validListings, singleListing, defaultZoom, mapStyle, enableClustering, enable3DBuildings, enableTerrain]);

  // Setup clustering
  const setupClustering = (mapInstance) => {
    mapInstance.addSource('listings', {
      type: 'geojson',
      data: createGeoJSON(),
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
      clusterProperties: {
        sum: ["+", ["get", "price"]]
      }
    });

    // Cluster circles
    mapInstance.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'listings',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          'rgba(255, 90, 95, 0.6)',
          10,
          'rgba(255, 154, 83, 0.6)',
          30,
          'rgba(255, 221, 87, 0.6)'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          25,
          30,
          30
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Cluster labels
    mapInstance.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'listings',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14
      },
      paint: {
        'text-color': '#fff'
      }
    });

    // Individual points
    mapInstance.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'listings',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': 'rgba(255, 90, 95, 0.8)',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Click handlers
    mapInstance.on('click', 'clusters', (e) => {
      const features = mapInstance.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      mapInstance.getSource('listings').getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;
          mapInstance.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
            duration: 500
          });
        }
      );
    });

    mapInstance.on('click', 'unclustered-point', (e) => {
      const { properties, geometry } = e.features[0];
      handleMarkerClick(properties.id, geometry.coordinates, properties);
    });

    // Cursor changes
    mapInstance.on('mouseenter', 'clusters', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'clusters', () => {
      mapInstance.getCanvas().style.cursor = '';
    });
    mapInstance.on('mouseenter', 'unclustered-point', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'unclustered-point', () => {
      mapInstance.getCanvas().style.cursor = '';
    });
  };

  // Handle marker click
  const handleMarkerClick = (id, coordinates, properties = null) => {
    if (onMarkerClick) {
      onMarkerClick(id);
    }
    setSelectedMarkerId(id);

    // Fly to the marker location
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: coordinates,
        zoom: 14,
        essential: true
      });
    }
  };

  // Function to remove all tooltips
  const removeAllTooltips = () => {
    tooltipsRef.current.forEach(tooltip => tooltip.remove());
    tooltipsRef.current = [];
  };

  // Function to remove all markers
  const removeAllMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Create tooltip content
  const createTooltipContent = (listing) => {
    return `
      <div class="custom-tooltip">
        <h4>${listing.title || 'Unnamed Listing'}</h4>
        <div class="tooltip-location">
          <strong>Location:</strong> ${listing.location || 'Unknown location'}
        </div>
        <div class="tooltip-country">
          <strong>Country:</strong> ${listing.country || 'Unknown country'}
        </div>
      </div>
    `;
  };

  // Update markers when listings change (non-clustered mode)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || enableClustering) return;

    // Clear existing markers and tooltips
    removeAllMarkers();
    removeAllTooltips();

    // Add new markers if showMarkers is true
    if (showMarkers) {
      validListings.forEach(listing => {
        const coordinates = listing.geometry?.coordinates || [listing.longitude, listing.latitude];
        
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
          handleMarkerClick(listing._id, coordinates, listing);
        });

        // Add hover events for tooltip
        marker.getElement().addEventListener('mouseenter', () => {
          const tooltip = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            anchor: 'top',
            offset: [0, -10],
            className: 'marker-tooltip'
          })
            .setLngLat(coordinates)
            .setHTML(createTooltipContent(listing))
            .addTo(mapRef.current);
          
          tooltipsRef.current.push(tooltip);
        });

        marker.getElement().addEventListener('mouseleave', () => {
          removeAllTooltips();
        });

        markersRef.current.push(marker);
      });
    }

    // Fit bounds if multiple listings
    if (validListings.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validListings.forEach(listing => {
        const coords = listing.geometry?.coordinates || [listing.longitude, listing.latitude];
        bounds.extend(coords);
      });
      mapRef.current.fitBounds(bounds, {
        padding: 100,
        duration: 1000
      });
    }
  }, [validListings, mapLoaded, selectedMarkerId, enableClustering, showMarkers]);

  // Expose map functions via ref
  React.useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    removeAllMarkers: removeAllMarkers,
    removeAllTooltips: removeAllTooltips,
    fitToBounds: (coordinates, padding = 100) => {
      if (!mapRef.current) return;
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      mapRef.current.fitBounds(bounds, { padding, duration: 1000 });
    },
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
    >
      {isLoading && (
        <div className="map-loading">
          <div className="map-loading-spinner"></div>
          <div>Loading map!!!</div>
        </div>
      )}
    </div>
  );
});

export default Map;