import type { Genre } from "./genre";
import type { Company } from "./company";
import type { Movie } from "./movie";
import type { MoviePerformance } from "./moviePerformance";
import type { Person } from "./person";
import type { Review, ReviewSummary } from "./review";

export interface MovieDetails {
  movie: Movie;
  performance: MoviePerformance | null;
  genres: Genre[];
  cast: Person[];
  crew: Person[];
  reviews: Review[];
  companies: Company[];
  reviews_summary: ReviewSummary | null;
}