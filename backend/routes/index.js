const registerRoutes = (app) => {
  app.use("/listings", require("./listing"));
  app.use("/listings/:listingId/reviews", require("./review"));
  app.use("/auth", require("./user"));
  app.use("/bookings", require("./booking"));
  app.use("/notifications", require("./notification"));
  app.use("/admin", require("./adminRoutes"));
  app.use("/api/payment", require("./payment"));
  app.use("/wishlist", require("./wishlist"));
  app.use("/messages", require("./message"));
  app.use("/trust", require("./trust"));
  app.use("/api/cancellation", require("./cancellation"));
  app.use("/api/reports", require("./report"));
  app.use("/api/alternative-bookings", require("./alternativeBooking"));
};

module.exports = { registerRoutes };
