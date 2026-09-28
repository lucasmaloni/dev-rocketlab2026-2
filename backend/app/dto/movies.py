from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.dto.company import Company
from app.dto.genre import GenreName
from app.dto.person import Person
from app.dto.review import Review, ReviewSummary


class MovieUpdate(BaseModel):
  titulo: str = Field(..., min_length=1, max_length=500)
  data_lancamento: date
  status_filme: str | None = Field(default=None, max_length=50)
  sinopse: str | None = Field(default=None, max_length=4000)
  genre_ids_to_add: list[str] = Field(default_factory=list)

  @field_validator("titulo")
  @classmethod
  def validate_title(cls, value: str) -> str:
    value = value.strip()
    if not value:
      raise ValueError("Título é obrigatório")
    return value


class Movie(BaseModel):
  ''' Modelo de filme para ser usado na API. Contém informações detalhadas do filme.'''
  sk_movie_id: str
  id: str
  titulo: str
  data_lancamento: str | None
  ano_lancamento: int | None
  status_filme: str | None
  sinopse: str | None
  poster_url: str | None
  backdrop_url: str | None

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

class MovieCatalogResponse(BaseModel):
  """Envelope de resposta para o catálogo com dados de paginação dinâmicos."""
  items: list[MovieCatalogItem]
  total: int
  page: int
  page_size: int = Field(alias="pageSize", serialization_alias="pageSize")
  total_pages: int = Field(alias="totalPages", serialization_alias="totalPages")
  model_config = ConfigDict(populate_by_name=True)

class MovieDetailsResponse(BaseModel):
  """Envelope de resposta para detalhes do filme."""
  movie: Movie
  performance: MoviePerformance | None
  genres: list[GenreName]
  cast: list[Person]
  crew: list[Person]
  reviews: list[Review]
  companies: list[Company]
  reviews_summary: ReviewSummary | None