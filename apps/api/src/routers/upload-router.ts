import { Router } from "express";
import { uploadSingleFile } from "../config/multer";
import { db } from "@repo/db";
import { reportAttachment } from "@repo/db/tables";
import { logger } from "@repo/logger";

export const expressUploadRouter: Router = Router();

function detectFileType(mimetype: string): "PHOTO" | "VIDEO" | "AUDIO" | "DOCUMENT" {
    if (mimetype.startsWith("image/")) return "PHOTO";
    if (mimetype.startsWith("video/")) return "VIDEO";
    if (mimetype.startsWith("audio/")) return "AUDIO";
    return "DOCUMENT";
}

// Upload an attachment for an incident report
expressUploadRouter.post(
    "/attachment/:reportId",
    uploadSingleFile,
    async (req, res) => {
        try {
            const { reportId } = req.params;
            const file = req.file;

            if (!file) {
                res.status(400).json({ error: "No file uploaded" });
                return;
            }

            if (!reportId) {
                res.status(400).json({ error: "Report ID is required" });
                return;
            }

            const fileUrl = `/uploads/${file.filename}`;
            const fileType = detectFileType(file.mimetype);

            const [attachment] = await db
                .insert(reportAttachment)
                .values({
                    reportId,
                    fileUrl,
                    fileType,
                    originalFileName: file.originalname,
                    fileSizeBytes: file.size,
                })
                .returning();

            logger.info(`Attachment uploaded for report ${reportId}: ${fileUrl}`);

            res.status(201).json(attachment);
        } catch (error) {
            logger.error("Upload failed", error);
            res.status(500).json({ error: "Upload failed" });
        }
    }
);
