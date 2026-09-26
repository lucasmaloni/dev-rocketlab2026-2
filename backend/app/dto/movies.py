from pydantic import BaseModel
from decimal import Decimal

class Movie(BaseModel):
  ''' Modelo de filme para ser usado na API. Contém informações detalhadas do filme.'''
  sk_movie_id: str
  id: int
  titulo: str
  data_lancamento: str | None
  ano_lancamento: int | None
  status_filme: str | None
  sinopse: str | None
  poster_url: str | None

class MoviePerformance(BaseModel):
  sk_movie_id: str
  orcamento_usd: Decimal | None
  receita_usd: Decimal | None
  orcamento_brl: Decimal | None
  receita_brl: Decimal | None
  lucro_brl: Decimal | None
  popularidade: float | None
  nota_tmdb: float | None
  qtd_tmdb: int | None
  nota_imdb: float | None
  qtd_imdb: int | None

class MovieCatalogItem(BaseModel):
  ''' Item a ser enviado para catalogar os filmes no banco. Apenas informações chave'''
  # dim_movies
  sk_movie_id: str
  titulo: str
  posterUrl: str | None
  # fact_movie_performance
  notamedia: float
