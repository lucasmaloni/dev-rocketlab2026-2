import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMovie } from "../../api/movies";
import type { MovieUpdatePayload } from "../../types/movieUpdate";

export function useUpdateMovie(skMovieId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MovieUpdatePayload) => updateMovie(skMovieId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["movie", skMovieId] });
      onSuccess?.();
    },
  });
}