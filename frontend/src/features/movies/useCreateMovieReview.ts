import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMovieReview } from "../../api/movies";
import type { CreateReviewPayload } from "../../types/review";

export function useCreateMovieReview(skMovieId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createMovieReview(skMovieId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movie", skMovieId] });
      onSuccess?.();
    },
  });
}
