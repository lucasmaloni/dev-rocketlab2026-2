from pydantic import BaseModel, ConfigDict, Field
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
  sk_movie_id: str = Field(..., alias="skMovieId", serialization_alias="skMovieId")
  titulo: str
  poster_url: str | None = Field(default=None, alias="posterUrl", serialization_alias="posterUrl")
  nota_media: float | None = Field(default=None, alias="notaMedia", serialization_alias="notaMedia")

  model_config = ConfigDict(populate_by_name=True)
