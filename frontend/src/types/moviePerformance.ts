export interface MoviePerformance {
  sk_movie_id: string;
  orcamento_usd: number | null;
  receita_usd: number | null;
  orcamento_brl: number | null;
  receita_brl: number | null;
  lucro_brl: number | null;
  popularidade: number | null;
  nota_tmdb: number | null;
  qtd_tmdb: number | null;
  nota_imdb: number | null;
  qtd_imdb: number | null;
}
