export const MOVIE_STATUSES = ["Lançado", "Anunciado", "Em produção"] as const;

export type MovieStatus = (typeof MOVIE_STATUSES)[number];

export interface MovieCreatePayload {
  titulo: string;
  data_lancamento: string;
  ano_lancamento: number;
  status_filme: MovieStatus;
  sinopse: string;
  genre_ids: string[];
  cast_names: string[];
  poster_url: string | null;
  backdrop_url: string | null;
}
