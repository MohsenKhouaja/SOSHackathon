// /** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
// import { randomUUID } from "node:crypto";
// import { existsSync, unlink } from "node:fs";
// import path from "node:path";
// import { logger } from "@repo/logger";
// import type { Request, Response } from "express";
// import sharp from "sharp";
// import { uploadDir } from "../config/multer";
// import { addToBloomFilter, isInBloomFilter } from "../utils/bloom-filter";
// import cache from "../utils/cache";

// const useHttps = process.env.VITE_USE_HTTPS === "true";
// const protocol = useHttps ? "https" : "http";
// const frontendUrl = process.env.FRONTEND_URL || `${protocol}://localhost:3000`;

// const expressUploadImage = async (req: Request, res: Response) => {
//   const cacheKey = req.params.token;
//   const imageHash = await cache.get(cacheKey);
//   if (!imageHash) {
//     res.status(400).json({ error: "Invalid token" });
//     return;
//   }

//   const file = req.file;
//   if (!file) {
//     res.status(400).json({ error: "No file uploaded" });
//     return;
//   }

//   const inputPath = path.join(uploadDir, file.filename);
//   const outputPathWebp = path.join(uploadDir, `${imageHash}.webp`);
//   const thumbnailPath = path.join(uploadDir, `thumbnail-${imageHash}.webp`);

//   try {
//     let imageBuffer: Buffer<ArrayBufferLike> | null =
//       await sharp(inputPath).toBuffer();
//     await Promise.all([
//       // Convert to WebP
//       sharp(imageBuffer)
//         .webp({ quality: 80 })
//         .toFile(outputPathWebp),
//       // logger.info(`Image converted to WebP at ${outputPathWebp}`);

//       // Generate a Thumbnail
//       sharp(imageBuffer)
//         .resize(640, 360)
//         .webp({ quality: 80 })
//         .toFile(thumbnailPath),
//       // logger.info(`Thumbnail generated at ${thumbnailPath}`);
//     ]);
//     imageBuffer = null;

//     logger.info(`Image uploaded at: ${outputPathWebp}`);
//     if (existsSync(outputPathWebp) && existsSync(thumbnailPath)) {
//       unlink(inputPath, (err) => {
//         if (err) {
//           logger.error(`Failed to delete file ${inputPath}`, err);
//         }
//       });
//     }

//     cache.del(cacheKey);

//     await addToBloomFilter(imageHash);

//     res.status(201).json({
//       webp: `${frontendUrl}/uploads/${imageHash}.webp`,
//       thumbnail: `${frontendUrl}/uploads/thumbnail-${imageHash}.webp`,
//     });
//   } catch (sharpError) {
//     logger.error("Image processing failed", sharpError);
//     res.status(500).json({ error: "Image processing failed" });
//   }
// };

// const expressGetUploadUrl = async (req: Request, res: Response) => {
//   try {
//     const { imageHash } = req.body;

//     if (!imageHash) {
//       logger.error("No image hash provided");
//       res.status(400).json({ error: "No image hash provided" });
//       return;
//     }

//     const exists = await isInBloomFilter(imageHash);

//     if (exists) {
//       const image = {
//         webp: `${frontendUrl}/uploads/${imageHash}.webp`,
//         thumbnail: `${frontendUrl}/uploads/thumbnail-${imageHash}.webp`,
//       };
//       logger.info(`Duplicate image detected with hash ${imageHash}`);
//       res.json({
//         isDuplicate: true,
//         image,
//       });
//       return;
//     }

//     const token = randomUUID();

//     cache.set(token, imageHash, 60 * 5); // 5 minutes

//     logger.info(
//       `Upload URL generated for image hash ${imageHash}: /upload/image/${token}`
//     );
//     res
//       .status(200)
//       .json({ isDuplicate: false, uploadUrl: `/upload/image/${token}` });

//     return;
//   } catch (error) {
//     logger.error("Error getting upload URL", error);
//     res.status(500).json({ error: "Error getting upload URL" });
//   }
// };

// export const uploadService = {
//   expressUploadImage,
//   expressGetUploadUrl,
// };
