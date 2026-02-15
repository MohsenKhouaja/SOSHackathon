import { trpc } from "@/lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateProgramInput,
    ProgramsPaginatedInput,
    UpdateProgramInput,
} from "@repo/validators";
import { toast } from "sonner";

export const usePrograms = (input: ProgramsPaginatedInput) => {
    return useQuery(trpc.programs.findMany.queryOptions(input));
};

export const useProgram = (id: string) => {
    return useQuery(trpc.programs.findOne.queryOptions({ where: { id } }));
};

export const useCreateProgram = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateProgramInput) => trpc.programs.create.mutate(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.programs.findMany.queryKey() });
            toast.success("Program created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create program: ${error.message}`);
        },
    });
};

export const useUpdateProgram = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateProgramInput) => trpc.programs.update.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: trpc.programs.findMany.queryKey() });
            queryClient.invalidateQueries({
                queryKey: trpc.programs.findOne.queryKey({ where: { id: data.id } }),
            });
            toast.success("Program updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update program: ${error.message}`);
        },
    });
};

export const useDeletePrograms = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: string[]) => trpc.programs.remove.mutate(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: trpc.programs.findMany.queryKey() });
            toast.success("Programs deleted successfully");
        },
        onError: (error) => {
            toast.error(`Failed to delete programs: ${error.message}`);
        },
    });
};
