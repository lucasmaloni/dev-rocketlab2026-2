
export const ROUTE_PATTERNS = {
  catalog: "/",
  movieDetails: "/movies/:skMovieId",
} as const;

export const ROUTES = {
  catalog: "/",
  movieDetails: (skMovieId: string) => `/movies/${skMovieId}`,
} as const;