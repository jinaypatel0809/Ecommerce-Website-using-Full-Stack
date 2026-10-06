import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadDirectory = path.resolve("uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, uploadDirectory),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

const fileFilter = (_request, file, callback) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) return callback(null, true);
  callback(new Error("Only JPG, PNG and WebP images are allowed."));
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
