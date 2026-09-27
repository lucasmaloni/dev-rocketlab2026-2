import type { Genre } from "./genre";
import type { Movie } from "./movie";
import type { MoviePerformance } from "./moviePerformance";

export interface MovieDetails {
  movie: Movie;
  performance: MoviePerformance | null;
  genres: Genre[];
}