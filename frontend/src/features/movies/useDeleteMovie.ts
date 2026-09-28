import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { deleteMovie } from "../../api/movies";
import { ROUTES } from "../../routes/path";

export function useDeleteMovie(skMovieId: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<void, Error, void>({
    mutationFn: () => deleteMovie(skMovieId),
    onSuccess: () => {
      // refetchType "none": o filme não existe mais, então refazer o GET do
      // detalhe (ainda ativo na MoviePage) resultaria em 404 antes da navegação.
      queryClient.invalidateQueries({
        queryKey: ["movie", skMovieId],
        refetchType: "none",
      });
      queryClient.invalidateQueries({ queryKey: ["movies"] });
      navigate(ROUTES.catalog);
    },
  });
}
