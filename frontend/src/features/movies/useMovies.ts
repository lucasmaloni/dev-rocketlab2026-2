import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMovies } from "../../api/movies";

export function useMovies(page: number) {
  const { data, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["movies", page],
    queryFn: ({ signal }) => getMovies(page, signal),
    placeholderData: keepPreviousData, // mantém a página anterior visível durante o load
  });

  return {
    movies: data?.items ?? [],
    currentPage: page,
    totalPages: data?.totalPages ?? 1,
    totalMovies: data?.total ?? 0,
    isLoading: isLoading || isPlaceholderData,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}