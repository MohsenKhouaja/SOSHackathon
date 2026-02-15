import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Attachment {
    id: string;
    reportId: string;
    fileUrl: string;
    fileType: "PHOTO" | "VIDEO" | "AUDIO" | "DOCUMENT";
    originalFileName: string | null;
    fileSizeBytes: number | null;
    uploadedAt: string;
}

// Fetch attachments for a report (using direct fetch since no tRPC endpoint yet)
export const useAttachments = (reportId: string) => {
    return useQuery({
        queryKey: ["attachments", reportId],
        queryFn: async (): Promise<Attachment[]> => {
            // For now, return empty array since we don't have a GET endpoint
            // TODO: Add tRPC endpoint or REST endpoint for fetching attachments
            return [];
        },
        enabled: !!reportId,
    });
};

// Upload attachment using FormData
export const useUploadAttachment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reportId, file }: { reportId: string; file: File }) => {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${API_URL}/api/upload/attachment/${reportId}`, {
                method: "POST",
                body: formData,
                credentials: "include", // Include cookies for auth
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload failed");
            }

            return response.json() as Promise<Attachment>;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["attachments", data.reportId] });
            toast.success("File uploaded successfully");
        },
        onError: (error: Error) => {
            toast.error(`Upload failed: ${error.message}`);
        },
    });
};
