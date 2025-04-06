export const locationCoordinates = {
    // Indian Cities
    delhi: [77.1025, 28.7041],
    "new delhi": [77.209, 28.6139],
    mumbai: [72.8777, 19.076],

    bangalore: [77.5946, 12.9716],
    bengaluru: [77.5946, 12.9716], // Alternative spelling
    hyderabad: [78.4867, 17.385],
    chennai: [80.2707, 13.0827],
    kolkata: [88.3639, 22.5726],
    pune: [73.8567, 18.5204],
    jaipur: [75.7873, 26.9124],
    ahmedabad: [72.5714, 23.0225],
    "ahmedabad city": [72.5714, 23.0225],
    surat: [72.8311, 21.1702],
    "surat city": [72.8311, 21.1702],
    "surat gujarat": [72.8311, 21.1702],
    
    
    
    // International Cities
    "new york": [-74.006, 40.7128],
    london: [-0.1276, 51.5072],
    paris: [2.3522, 48.8566],
    tokyo: [139.6917, 35.6895],
    dubai: [55.2708, 25.2048],
    singapore: [103.8198, 1.3521],
    sydney: [151.2093, -33.8688],
    Australia: [133.7751, -25.2744],
    
    // Tourist Destinations
    positano: [14.4844, 40.6281], // Corrected Italy coordinates
    santorini: [25.4615, 36.3932],
    bali: [115.1889, -8.4095],
    
    // Default fallback (center of the world)
    default: [0, 0]
  };
  
  export const getCoordinates = (location) => {
    const normalizedLocation = location?.toLowerCase().trim() || "";
    
    // Check for exact matches first
    if (locationCoordinates[normalizedLocation]) {
      return locationCoordinates[normalizedLocation];
    }
    
    // Check for partial matches
    for (const [key, coords] of Object.entries(locationCoordinates)) {
      if (normalizedLocation.includes(key)) {
        return coords;
      }
    }
    
    // Return default if no match found
    return locationCoordinates.default;
  };