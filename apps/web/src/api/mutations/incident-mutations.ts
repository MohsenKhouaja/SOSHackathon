import { trpc } from "@/lib/trpc";
import { type CreateIncidentInput, type UpdateIncidentInput } from "@repo/validators";
import { toast } from "sonner";

export const useCreateIncidentMutation = (
  onError?: (error: string) => void,
  onSuccess?: () => void
) => {
  const utils = trpc.useUtils();
  return trpc.incidents.create.useMutation({
    onSuccess: () => {
      toast.success("Incident reported successfully");
      utils.incidents.findMany.invalidate();
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to report incident");
      onError?.(err.message);
    },
  });
};

export const useUpdateIncidentStatusMutation = () => {
  const utils = trpc.useUtils();
  return trpc.incidents.update.useMutation({
    onSuccess: () => {
      toast.success("Incident status updated");
      utils.incidents.findMany.invalidate();
      utils.incidents.findOne.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update status");
    },
  });
};

