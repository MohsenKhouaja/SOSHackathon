import { trpc } from "@/lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateUserInput,
    UpdateUserInput,
    UsersPaginatedInput,
} from "@repo/validators";
import { toast } from "sonner";

export const useUsers = (input: UsersPaginatedInput) => {
    return useQuery(trpc.users.findMany.queryOptions(input));
};

export const useUser = (id: string) => {
    return useQuery(trpc.users.findOne.queryOptions({ where: { id } }));
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateUserInput) => trpc.users.create.mutate(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.users.findMany.queryKey() });
            toast.success("User created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create user: ${error.message}`);
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateUserInput) => trpc.users.update.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: trpc.users.findMany.queryKey() });
            queryClient.invalidateQueries({
                queryKey: trpc.users.findOne.queryKey({ where: { id: data.id } }),
            });
            toast.success("User updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update user: ${error.message}`);
        },
    });
};

export const useDeleteUsers = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => trpc.users.remove.mutate(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.users.findMany.queryKey() });
            toast.success("Users deleted successfully");
        },
        onError: (error) => {
            toast.error(`Failed to delete users: ${error.message}`);
        },
    });
};
