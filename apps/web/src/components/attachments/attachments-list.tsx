import { useAttachments } from "@/hooks/api/attachments";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { FileText, Image, Video, Music, Download } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { UploadAttachmentDialog } from "../dialogs/upload-attachment-dialog";

interface AttachmentsListProps {
    reportId: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getFileIcon = (fileType: string) => {
    switch (fileType) {
        case "PHOTO":
            return <Image className="h-5 w-5 text-blue-500" />;
        case "VIDEO":
            return <Video className="h-5 w-5 text-purple-500" />;
        case "AUDIO":
            return <Music className="h-5 w-5 text-green-500" />;
        case "DOCUMENT":
        default:
            return <FileText className="h-5 w-5 text-orange-500" />;
    }
};

const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function AttachmentsList({ reportId }: AttachmentsListProps) {
    const { data: attachments, isLoading } = useAttachments(reportId);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Attachments</CardTitle>
                <UploadAttachmentDialog reportId={reportId} />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading attachments...</p>
                    </div>
                ) : attachments?.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No attachments yet.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {attachments?.map((attachment) => (
                            <div
                                key={attachment.id}
                                className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    {getFileIcon(attachment.fileType)}
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate text-sm font-medium">
                                            {attachment.originalFileName || "Unnamed file"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(attachment.fileSizeBytes)} • {attachment.fileType}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                >
                                    <a
                                        href={`${API_URL}${attachment.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                    >
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
