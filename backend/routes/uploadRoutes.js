const express   = require("express");
const router    = express.Router();
const multer    = require("multer");
const path      = require("path");
const fs        = require("fs");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ok = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];
  ok.includes(file.mimetype) ? cb(null, true) : cb(new Error("Images only (jpg/png/webp/gif)"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/", protect, adminOnly, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ success: true, message: "Image uploaded", imageUrl });
});

module.exports = router;
