mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

console.log(coordinates);

const marker = new mapboxgl.Marker({ color: "red" }) // Removed extra space in color
  .setLngLat(coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<p>Exact Location Provided After Booking!</p>"))
  .addTo(map);

map.on("load", () => {
  // Add an image to use as a custom marker
  map.loadImage("/img/mapbox-icon.png", (error, image) => {
    if (error) {
      console.error("Error loading image:", error); // Improved error handling
      return;
    }
    // Add the image to the map style
    map.addImage("custom-marker", image);
    // Add a data source containing one point feature
    map.addSource("point", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [-74.5, 40], // Ensure these coordinates are correct
            },
          },
        ],
      },
    });
    // Add a layer to use the image to represent the data
    map.addLayer({
      id: "points",
      type: "symbol",
      source: "point",
      layout: {
        "icon-image": "custom-marker",
        "text-field": ["get", "title"],
        "text-offset": [0, 1.8],
        "text-anchor": "top",
      },
    });
  });

  // Add geolocate control to the map.
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    })
  );

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());

  // Add fullscreen control to the map.
  map.addControl(new mapboxgl.FullscreenControl());
});
