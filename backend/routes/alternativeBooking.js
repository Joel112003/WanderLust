const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware");
const alternativeBookingController = require("../controllers/alternativeBookingController");

router.get(
  "/:id",
  isAuthenticated,
  alternativeBookingController.getAlternativeBooking
);

router.post(
  "/:id/respond",
  isAuthenticated,
  alternativeBookingController.respondToAlternative
);

router.get(
  "/",
  isAuthenticated,
  alternativeBookingController.getUserAlternatives
);

module.exports = router;
