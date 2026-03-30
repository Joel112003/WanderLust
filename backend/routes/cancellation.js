const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const cancellationController = require("../controllers/cancellation");

router.post(
  "/listings/:id/cancel",
  isAuthenticated,
  cancellationController.cancelListing
);

router.get(
  "/listings/:id/history",
  isAuthenticated,
  cancellationController.getCancellationHistory
);

router.get(
  "/bookings/cancelled",
  isAuthenticated,
  cancellationController.getCancelledBookings
);

module.exports = router;
