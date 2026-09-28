from datetime import date
from decimal import Decimal
from typing import Literal
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

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


MovieStatus = Literal["Lançado", "Anunciado", "Em produção"]


class MovieCreate(BaseModel):
  """Payload para cadastrar um filme. Elenco vira DimPerson (Ator) se não existir."""
  titulo: str = Field(..., min_length=1, max_length=500)
  data_lancamento: date
  ano_lancamento: int
  status_filme: MovieStatus
  sinopse: str = Field(..., min_length=1, max_length=4000)
  genre_ids: list[str] = Field(..., min_length=1)
  cast_names: list[str] = Field(..., min_length=1)
  poster_url: str | None = Field(default=None, max_length=2048)
  backdrop_url: str | None = Field(default=None, max_length=2048)

  @field_validator("titulo", "sinopse")
  @classmethod
  def validate_required_text(cls, value: str) -> str:
    value = value.strip()
    if not value:
      raise ValueError("Campo obrigatório")
    return value

  @field_validator("cast_names")
  @classmethod
  def validate_cast_names(cls, value: list[str]) -> list[str]:
    names = [name.strip() for name in value if name.strip()]
    if not names:
      raise ValueError("Informe ao menos um ator")
    if any(len(name) > 255 for name in names):
      raise ValueError("Cada nome de ator deve ter até 255 caracteres")
    return names

  @field_validator("poster_url", "backdrop_url")
  @classmethod
  def validate_url(cls, value: str | None) -> str | None:
    if value is None:
      return None
    value = value.strip()
    if not value:
      return None
    parsed = urlparse(value)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
      raise ValueError("URL deve começar com http:// ou https://")
    return value

  @model_validator(mode="after")
  def validate_year_matches_date(self) -> "MovieCreate":
    if self.ano_lancamento != self.data_lancamento.year:
      raise ValueError("Ano de lançamento não corresponde à data de lançamento")
    return self


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