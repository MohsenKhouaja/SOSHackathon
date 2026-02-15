import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { useEffect, useState } from "react";

export function AlphaNoticeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Logic to show dialog once per session or something
    const hasSeen = sessionStorage.getItem("alpha-notice-seen");
    if (!hasSeen) {
      setOpen(true);
      sessionStorage.setItem("alpha-notice-seen", "true");
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to the Alpha Preview</DialogTitle>
          <DialogDescription>
            This is an early access version of the platform. Features may change.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

