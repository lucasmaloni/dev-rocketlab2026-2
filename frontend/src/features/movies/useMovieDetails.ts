import { useQuery } from "@tanstack/react-query";
import { getMovieDetails } from "../../api/movies";

export function useMovieDetails(skMovieId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["movie", skMovieId],
    queryFn: ({ signal }) => getMovieDetails(skMovieId as string, signal),
    enabled: Boolean(skMovieId),
  });

  return {
    movie: data?.movie ?? null,
    performance: data?.performance ?? null,
    genres: data?.genres ?? [],
    cast: data?.cast ?? [],
    crew: data?.crew ?? [],
    reviews: data?.reviews ?? [],
    companies: data?.companies ?? [],
    reviewsSummary: data?.reviews_summary ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}