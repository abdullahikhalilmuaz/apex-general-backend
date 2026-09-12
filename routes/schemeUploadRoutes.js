const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const schemeUploadController = require("../controllers/schemeUploadController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  },
});

router.post(
  "/upload",
  auth,
  upload.single("pdf"),
  schemeUploadController.uploadScheme,
);

router.post(
  "/upload",
  auth,
  upload.single("pdf"),
  (req, res, next) => {
    console.log("UPLOAD ROUTE HIT");
    next();
  },
  schemeUploadController.uploadScheme,
);
module.exports = router;
