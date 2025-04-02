const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxClient = mbxGeocoding({ accessToken: "pk.eyJ1Ijoiam9lbDIwMDMiLCJhIjoiY20yN2Y4bXcxMDVrYTJrc2RvZDlwcWdrbSJ9.2TigO9-XJtXn_B76p56ejg"});

async function getCoordinates(address) {
  const response = await mapboxClient.forwardGeocode({
    query: address,
    limit: 1
  }).send();
  
  return response.body.features[0].geometry.coordinates; // [longitude, latitude]
}

module.exports = getCoordinates;
