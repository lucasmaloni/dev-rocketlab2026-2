import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMovies } from "../../api/movies";

export function useMovies(
  page: number,
  query = "",
  pageSize?: number,
  enabled = true,
) {
  const { data, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["movies", page, query, pageSize],
    queryFn: ({ signal }) => getMovies(page, signal, query, pageSize),
    enabled,
    placeholderData: keepPreviousData,
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