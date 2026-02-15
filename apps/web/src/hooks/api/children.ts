import { trpc } from "@/lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    ChildrenPaginatedInput,
    CreateChildInput,
    UpdateChildInput,
} from "@repo/validators";
import { toast } from "sonner";

export const useChildren = (input: ChildrenPaginatedInput) => {
    return useQuery(trpc.children.findMany.queryOptions(input));
};

export const useChild = (id: string) => {
    return useQuery(trpc.children.findOne.queryOptions({ where: { id } }));
};

export const useCreateChild = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateChildInput) => trpc.children.create.mutate(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.children.findMany.queryKey() });
            toast.success("Child created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create child: ${error.message}`);
        },
    });
};

export const useUpdateChild = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateChildInput) => trpc.children.update.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: trpc.children.findMany.queryKey() });
            queryClient.invalidateQueries({
                queryKey: trpc.children.findOne.queryKey({ where: { id: data.id } }),
            });
            toast.success("Child updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update child: ${error.message}`);
        },
    });
};

export const useDeleteChildren = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => trpc.children.remove.mutate(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.children.findMany.queryKey() });
            toast.success("Children deleted successfully");
        },
        onError: (error) => {
            toast.error(`Failed to delete children: ${error.message}`);
        },
    });
};
