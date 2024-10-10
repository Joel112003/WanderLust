const Listing = require("../models/listing");
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Cannot find listing");
    res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

module.exports.createListings = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "Successfully created a new listing");
  res.redirect("/listings");
};

module.exports.editListings = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Cannot find listing");
    res.redirect("/listings");
  }
  res.render("listings/edit", { listing });
};

module.exports.updateListings = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Successfully updated listing");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListings = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted listing");
  res.redirect("/listings");
};
