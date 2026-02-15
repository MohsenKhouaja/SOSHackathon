import { trpc } from "@/lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateIncidentInput,
    IncidentsPaginatedInput,
    UpdateIncidentInput,
} from "@repo/validators";
import { toast } from "sonner";

export const useIncidents = (input: IncidentsPaginatedInput) => {
    return useQuery(trpc.incidents.findMany.queryOptions(input));
};

export const useIncident = (id: string) => {
    return useQuery(trpc.incidents.findOne.queryOptions({ where: { id } }));
};

export const useCreateIncident = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateIncidentInput) => trpc.incidents.create.mutate(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.incidents.findMany.queryKey() });
            toast.success("Incident Report created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create incident: ${error.message}`);
        },
    });
};

export const useUpdateIncident = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateIncidentInput) => trpc.incidents.update.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: trpc.incidents.findMany.queryKey() });
            queryClient.invalidateQueries({
                queryKey: trpc.incidents.findOne.queryKey({ where: { id: data.id } }),
            });
            toast.success("Incident Report updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update incident: ${error.message}`);
        },
    });
};

export const useDeleteIncidents = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: { deletedIds: string[] }) => trpc.incidents.remove.mutate(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.incidents.findMany.queryKey() });
            toast.success("Incidents deleted successfully");
        },
        onError: (error) => {
            toast.error(`Failed to delete incidents: ${error.message}`);
        },
    });
};
