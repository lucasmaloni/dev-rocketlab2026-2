export interface MovieUpdatePayload {
  titulo: string;
  data_lancamento: string;
  status_filme: string | null;
  sinopse: string | null;
  genre_ids_to_add: string[];
}
