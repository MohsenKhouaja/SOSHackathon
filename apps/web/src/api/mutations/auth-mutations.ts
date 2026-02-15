import { signOut } from "@/lib/auth-client";
import { useMutation } from "@tanstack/react-query";

export const useSignoutMutation = (
  onError?: (error: unknown) => void,
  onSuccess?: () => void
) => {
  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onError,
    onSuccess,
  });
};

