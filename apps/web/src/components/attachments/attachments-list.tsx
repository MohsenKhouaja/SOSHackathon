import { Card } from "@repo/ui/components/ui/card";

export function AttachmentsList({ reportId }: { reportId: string }) {
  // Replace with your actual attachments logic
  return (
    <Card className="p-4">
      <div className="text-muted-foreground">No attachments found.</div>
    </Card>
  );
}
