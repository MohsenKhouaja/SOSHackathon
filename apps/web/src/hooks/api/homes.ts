import { trpc } from "@/lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateHomeInput,
    HomesPaginatedInput,
    UpdateHomeInput,
} from "@repo/validators";
import { toast } from "sonner";

export const useHomes = (input: HomesPaginatedInput) => {
    return useQuery(trpc.homes.findMany.queryOptions(input));
};

export const useHome = (id: string) => {
    return useQuery(trpc.homes.findOne.queryOptions({ where: { id } }));
};

export const useCreateHome = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateHomeInput) => trpc.homes.create.mutate(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.homes.findMany.queryKey() });
            toast.success("Home created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create home: ${error.message}`);
        },
    });
};

export const useUpdateHome = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateHomeInput) => trpc.homes.update.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: trpc.homes.findMany.queryKey() });
            queryClient.invalidateQueries({
                queryKey: trpc.homes.findOne.queryKey({ where: { id: data.id } }),
            });
            toast.success("Home updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update home: ${error.message}`);
        },
    });
};

export const useDeleteHomes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => trpc.homes.remove.mutate(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.homes.findMany.queryKey() });
            toast.success("Homes deleted successfully");
        },
        onError: (error) => {
            toast.error(`Failed to delete homes: ${error.message}`);
        },
    });
};
