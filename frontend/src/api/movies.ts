import client from "./client";
import type { MovieCatalogResponse } from "../types/movieCatalogResponse";
import type { MovieDetails } from "../types/movieDetail";
import type { CreateReviewPayload, ReviewCreatedResponse } from "../types/review";

export const getMovies = async (
  page: number = 1,
  signal?: AbortSignal,
  query?: string,
  pageSize?: number,
): Promise<MovieCatalogResponse> => {
  const response = await client.get<MovieCatalogResponse>(`/movies/catalog/${page}`, {
    params: {
      q: query || undefined,
      page_size: pageSize,
    },
    signal,
  });
  return response.data;
};

export const getMovieDetails = async (
  skMovieId: string,
  signal?: AbortSignal
): Promise<MovieDetails> => {
  const response = await client.get<MovieDetails>(`/movies/${skMovieId}`, {
    signal,
  });
  return response.data;
};

export const createMovieReview = async (
  skMovieId: string,
  payload: CreateReviewPayload,
  signal?: AbortSignal,
): Promise<ReviewCreatedResponse> => {
  const response = await client.post<ReviewCreatedResponse>(
    `/reviews/${skMovieId}`,
    payload,
    { signal },
  );
  return response.data;
};