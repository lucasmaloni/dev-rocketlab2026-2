import client from "./client";
import type { MovieCatalogResponse } from "../types/movieCatalogResponse";
import type { MovieDetails } from "../types/movieDetail";
import type { Genre } from "../types/genre";
import type { MovieCreatePayload } from "../types/movieCreate";
import type { MovieUpdatePayload } from "../types/movieUpdate";
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

export const updateMovie = async (
  skMovieId: string,
  payload: MovieUpdatePayload,
): Promise<MovieDetails> => {
  const response = await client.patch<MovieDetails>(`/movies/${skMovieId}`, payload);
  return response.data;
};

export const createMovie = async (payload: MovieCreatePayload): Promise<MovieDetails> => {
  const response = await client.post<MovieDetails>("/movies", payload);
  return response.data;
};

export const deleteMovie = async (skMovieId: string): Promise<void> => {
  await client.delete(`/movies/${skMovieId}`);
};

export const getGenres = async (signal?: AbortSignal): Promise<Genre[]> => {
  const response = await client.get<Genre[]>("/genres", { signal });
  return response.data;
};