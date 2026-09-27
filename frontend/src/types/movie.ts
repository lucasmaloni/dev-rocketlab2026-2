export interface Movie {
  sk_movie_id: string;
  id: string;
  titulo: string;
  data_lancamento: string | null;
  ano_lancamento: number | null;
  status_filme: string | null;
  sinopse: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
}
