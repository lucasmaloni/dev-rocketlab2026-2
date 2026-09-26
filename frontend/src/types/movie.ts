export interface Movie {
  skMovieId: string;
  id: string;
  titulo: string;
  dataLancamento: string | Date;
  anoLancamento: number;
  duracaoMinutos: number;
  statusFilme: string;
  sinopse: string;
  posterUrl: string;
  backdropUrl: string | null;
}
