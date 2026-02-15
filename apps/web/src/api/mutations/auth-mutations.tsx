import { trpc } from "@/lib/trpc";
import type { SignupInput } from "@repo/validators";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type SigninInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  return fallback;
};

export const useSigninMutation = (
  onError?: (message: string) => void,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SigninInput) => trpc.delivery.auth.signin.mutate(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.delivery.auth.getCurrentUser.queryKey(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to sign in");
      if (onError) onError(message);
      else toast.error(message);
    },
  });
};

export const useSignupMutation = (
  onError?: (message: string) => void,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignupInput) => trpc.delivery.auth.signup.mutate(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.delivery.auth.getCurrentUser.queryKey(),
      });
      toast.success("Account created");
      onSuccess?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to sign up");
      if (onError) onError(message);
      else toast.error(message);
    },
  });
};

export const useSignoutMutation = (
  onError?: (message: string) => void,
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => trpc.delivery.auth.signout.mutate(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: trpc.delivery.auth.getCurrentUser.queryKey(),
      });
      onSuccess?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to sign out");
      if (onError) onError(message);
      else toast.error(message);
    },
  });
};