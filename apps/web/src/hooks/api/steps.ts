import { trpc } from "@/lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateActionPlanInput,
    CreateEvaluationInput,
    CreateFollowUpInput,
    CreateFormalDecisionInput,
    UpdateActionPlanInput,
    UpdateEvaluationInput,
    UpdateFollowUpInput,
    UpdateFormalDecisionInput,
} from "@repo/validators";
import { toast } from "sonner";

// Evaluation
export const useEvaluations = (reportId: string) => {
    return useQuery(trpc.steps.getEvaluations.queryOptions({ reportId }));
};

export const useCreateEvaluation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateEvaluationInput) => trpc.steps.createEvaluation.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: trpc.steps.getEvaluations.queryKey({ reportId: data.reportId }),
            });
            toast.success("Evaluation created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create evaluation: ${error.message}`);
        },
    });
};

export const useUpdateEvaluation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateEvaluationInput) => trpc.steps.updateEvaluation.mutate(input),
        onSuccess: (data) => {
            // Since update returns the record, we might need to know reportId. 
            // The record returned has reportId.
            queryClient.invalidateQueries({
                queryKey: trpc.steps.getEvaluations.queryKey({ reportId: data.reportId }),
            });
            toast.success("Evaluation updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update evaluation: ${error.message}`);
        },
    });
};

// Action Plan
export const useActionPlans = (reportId: string) => {
    return useQuery(trpc.steps.getActionPlans.queryOptions({ reportId }));
};

export const useCreateActionPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateActionPlanInput) => trpc.steps.createActionPlan.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: trpc.steps.getActionPlans.queryKey({ reportId: data.reportId }),
            });
            toast.success("Action Plan created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create action plan: ${error.message}`);
        },
    });
};

export const useUpdateActionPlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateActionPlanInput) => trpc.steps.updateActionPlan.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: trpc.steps.getActionPlans.queryKey({ reportId: data.reportId }),
            });
            toast.success("Action Plan updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update action plan: ${error.message}`);
        },
    });
};

// Follow Up
export const useFollowUps = (reportId: string) => {
    return useQuery(trpc.steps.getFollowUps.queryOptions({ reportId }));
};

export const useCreateFollowUp = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateFollowUpInput) => trpc.steps.createFollowUp.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: trpc.steps.getFollowUps.queryKey({ reportId: data.reportId }),
            });
            toast.success("Follow Up created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create follow up: ${error.message}`);
        },
    });
};

export const useUpdateFollowUp = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateFollowUpInput) => trpc.steps.updateFollowUp.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: trpc.steps.getFollowUps.queryKey({ reportId: data.reportId }),
            });
            toast.success("Follow Up updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update follow up: ${error.message}`);
        },
    });
};

// Formal Decision
export const useFormalDecisions = (reportId: string) => {
    return useQuery(trpc.steps.getFormalDecisions.queryOptions({ reportId }));
};

export const useCreateFormalDecision = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateFormalDecisionInput) => trpc.steps.createFormalDecision.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: trpc.steps.getFormalDecisions.queryKey({ reportId: data.reportId }),
            });
            toast.success("Formal Decision created successfully");
        },
        onError: (error) => {
            toast.error(`Failed to create formal decision: ${error.message}`);
        },
    });
};

export const useUpdateFormalDecision = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateFormalDecisionInput) => trpc.steps.updateFormalDecision.mutate(input),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: trpc.steps.getFormalDecisions.queryKey({ reportId: data.reportId }),
            });
            toast.success("Formal Decision updated successfully");
        },
        onError: (error) => {
            toast.error(`Failed to update formal decision: ${error.message}`);
        },
    });
};
