import client from "./client";
import type { MovieCatalogResponse } from "../types/movieCatalogResponse";

export const getMovies = async (
  page: number = 1,
  signal?: AbortSignal
): Promise<MovieCatalogResponse> => {
  const response = await client.get<MovieCatalogResponse>(`/movies/catalog/${page}`, {
    signal,
  });
  return response.data;
};