const Listing = require("../models/listing"); // Importing the Listing model to interact with the database.
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); // Importing the Mapbox geocoding service for location-related operations.
const mapToken = process.env.MAP_TOKEN; // Getting the Mapbox API token from environment variables for secure API access.
const geocodingClient = mbxGeocoding({ accessToken: mapToken }); // Creating a new Mapbox geocoding client using the provided token.

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({}); // Fetching all listings from the database.
  res.render("listings/index", { allListings }); // Rendering the 'index' template, passing all listings as data.
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new"); // Rendering the form to create a new listing.
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params; // Extracting the 'id' parameter from the request URL.
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } }) // Populating reviews and their authors for the listing.
    .populate("owner"); // Populating the owner data for the listing.
  if (!listing) {
    // If the listing does not exist:
    req.flash("error", "Cannot find listing"); // Show an error message to the user.
    res.redirect("/listings"); // Redirect the user to the listings page.
  }
  res.render("listings/show", { listing }); // Rendering the 'show' template, passing the listing data.
};

module.exports.createListings = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location, // Using the location provided by the user to perform forward geocoding.
      limit: 2, // Limiting the response to two results.
    })
    .send(); // Sending the geocoding request.

  let url = req.file.path; // Getting the file path of the uploaded image.
  let filename = req.file.filename; // Getting the filename of the uploaded image.
  const newListing = new Listing(req.body.listing); // Creating a new listing with data from the form.
  newListing.owner = req.user._id; // Setting the owner of the listing to the current user.
  newListing.image = { url, filename }; // Adding the image data to the listing.
  newListing.geometry = response.body.features[0].geometry; // Adding the geocoded location data to the listing.
  await newListing.save(); // Saving the new listing to the database.
  req.flash("success", "Successfully created a new listing"); // Show a success message to the user.
  res.redirect("/listings"); // Redirect the user to the listings page.
};

module.exports.editListings = async (req, res) => {
  const { id } = req.params; // Extracting the 'id' parameter from the request URL.
  const listing = await Listing.findById(id); // Fetching the listing to edit from the database.
  if (!listing) {
    // If the listing does not exist:
    req.flash("error", "Cannot find listing"); // Show an error message to the user.
    return res.redirect("/listings"); // Redirect the user to the listings page.
  }

  // Check if category is missing and set a default value
  if (!listing.category) {
    listing.category = "General"; // Set the default category
  }

  res.render("listings/edit", { listing }); // Rendering the 'edit' template, passing the listing data.
};

module.exports.updateListings = async (req, res) => {
  const { id } = req.params; // Extracting the 'id' parameter from the request URL.
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // Updating the listing in the database with new data.
  let url = req.file.path; // Getting the file path of the uploaded image.
  let filename = req.file.filename; // Getting the filename of the uploaded image.
  if (typeof req.file !== "undefined") {
    // If there is a new image file:
    listing.image = { url, filename }; // Update the image data for the listing.
    await listing.save(); // Save the updated listing.
  }

  req.flash("success", "Successfully updated listing"); // Show a success message to the user.
  res.redirect(`/listings/${id}`); // Redirect the user to the updated listing's page.
};

module.exports.destroyListings = async (req, res) => {
  const { id } = req.params; // Extracting the 'id' parameter from the request URL.
  await Listing.findByIdAndDelete(id); // Deleting the listing from the database.
  req.flash("success", "Successfully deleted listing"); // Show a success message to the user.
  res.redirect("/listings"); // Redirect the user to the listings page.
};