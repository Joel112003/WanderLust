const express = require("express");
const router = express.Router();
const multer = require("multer");
const { isAuthenticated, isAdmin } = require("../middleware");
const reportController = require("../controllers/reportController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/reports/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "report-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {

    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

router.post(
  "/listing",
  isAuthenticated,
  upload.array("photos", 10),
  reportController.createReport
);

router.get("/user", isAuthenticated, reportController.getUserReports);

router.get("/:ticketNumber", isAuthenticated, reportController.getReportByTicket);

router.patch("/:id/status", isAuthenticated, reportController.updateReportStatus);

router.get("/", isAuthenticated, reportController.getAllReports);

module.exports = router;
