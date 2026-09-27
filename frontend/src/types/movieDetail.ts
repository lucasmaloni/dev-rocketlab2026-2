import type { Genre } from "./genre";
import type { Movie } from "./movie";
import type { MoviePerformance } from "./moviePerformance";
import type { Person } from "./person";

export interface MovieDetails {
  movie: Movie;
  performance: MoviePerformance | null;
  genres: Genre[];
  cast: Person[];
  crew: Person[];
}