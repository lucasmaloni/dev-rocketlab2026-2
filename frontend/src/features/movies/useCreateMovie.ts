import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMovie } from "../../api/movies";
import type { MovieCreatePayload } from "../../types/movieCreate";
import type { MovieDetails } from "../../types/movieDetail";

export function useCreateMovie() {
  const queryClient = useQueryClient();

  return useMutation<MovieDetails, Error, MovieCreatePayload>({
    mutationFn: createMovie,
    onSuccess: () => {
      // Todas as páginas/buscas do catálogo (["movies", page, query, pageSize]).
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}
