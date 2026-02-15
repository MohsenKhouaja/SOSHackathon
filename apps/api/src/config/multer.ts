/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
import fs from "node:fs";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import multer, { type StorageEngine } from "multer";

export const uploadDir = path.join("public", "uploads");
// Ensure the uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const RANDOM_SUFFIX_MAX = 1e9;

const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir); // Set the upload directory
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * RANDOM_SUFFIX_MAX)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const KILOBYTE = 1000; //Linux standard
const MEGABYTE = KILOBYTE ** 2;
const MAX_FILE_SIZE_BYTES = 10 * MEGABYTE; // 10 MB

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true);
  },
});

export function uploadSingleImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  upload.single("image")(req, res, (err: unknown) => {
    // If Multer threw an error, handle it here
    if (err instanceof multer.MulterError) {
      // File size limit exceeded
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File size limit exceeded. Max 10 MB allowed." });
      }
      // Other Multer errors (e.g., invalid field name)
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      // Non-Multer errors (e.g. from fileFilter or other middlewares)
      return res.status(400).json({ error: (err as Error).message });
    }
    // No errors => proceed to the controller
    next();
  });
}

// General upload for any file type (documents, audio, video, images)
const GENERAL_MAX_FILE_SIZE = 25 * MEGABYTE; // 25 MB

const generalUpload = multer({
  storage,
  limits: { fileSize: GENERAL_MAX_FILE_SIZE },
});

export function uploadSingleFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  generalUpload.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ error: "File size limit exceeded. Max 25 MB allowed." });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
    next();
  });
}

export default upload;

