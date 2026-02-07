const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, "profile" + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Photo upload failed" });
  }

  res.json({
    message: "Photo uploaded successfully",
    path: `/uploads/${req.file.filename}`,
  });
});

module.exports = router;
