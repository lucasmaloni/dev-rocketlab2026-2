import csv
from datetime import date
from pathlib import Path
from decimal import Decimal

from sqlalchemy import Table
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.movies.models import (
  DimMovie, 
  DimGenre, 
  DimPerson, 
  DimReview, 
  DimCompany, 
  FactMoviePerformance, 
  MovieReview, 
  bridge_movie_person,
  bridge_movie_genre,
  bridge_movie_company
)

SEEDS_DIR = Path(__file__).resolve().parents[3] / "migrations" / "data" / "seeds"

# Limite de variáveis por statement no SQLite (padrão de build costuma ser 999
# ou 32766). Mantemos um valor conservador único para todas as tabelas, para
# não precisar calcular o limite por número de colunas de cada uma.
BATCH_SIZE = 500


class Seeder():

  def __init__(self, session: AsyncSession) -> None:
    self.session = session
    self.files = {
      "movies": "dim_movies.csv",
      "genres": "dim_genres.csv",
      "companies": "dim_companies.csv",
      "people": "dim_people.csv",
      "reviews": "dim_reviews.csv",
      "fact_movies": "fact_movies_performance.csv",
      "movies_reviews": "movies_reviews.csv",
      "bridge_movie_genre": "bridge_movie_genre.csv",
      "bridge_movie_company": "bridge_movie_company.csv",
      "bridge_movie_person": "bridge_movie_person.csv"
    }

  def _read_csv(self, filename: str) -> list[dict[str, str]]:
    path = SEEDS_DIR / filename

    with path.open(encoding="utf-8", newline="") as f:
      return list(csv.DictReader(f))

  @staticmethod
  def _parse_date(value: str) -> date | None:
    return date.fromisoformat(value) if value else None
  
  @staticmethod
  def _parse_int(value: str) -> int | None:
    return int(float(value)) if value else None

  @staticmethod
  def _parse_float(value: str) -> float | None:
    return float(value) if value else None

  @staticmethod
  def _parse_decimal(value: str) -> Decimal | None:
    return Decimal(value) if value else None

  @staticmethod
  def _parse_decimal_or_zero(value: str) -> Decimal:
    return Decimal(value) if value else Decimal("0")

  @staticmethod
  def _parse_int_or_zero(value: str) -> int:
    return int(value) if value else 0

  async def _insert_in_batches(
    self,
    table: type[DeclarativeBase] | Table,
    values: list[dict],
    conflict_cols: list[str]
    ) -> None:
    """Insere `values` em lotes, evitando estourar o limite de variáveis
    por statement do SQLite quando a tabela de origem tem muitas linhas
    (ex: CSVs com dezenas de milhares de registros)."""

    for start in range(0, len(values), BATCH_SIZE):
      batch = values[start : start + BATCH_SIZE]
      stmt = sqlite_insert(table).values(batch)
      stmt = stmt.on_conflict_do_nothing(index_elements=conflict_cols)
      await self.session.execute(stmt)

  async def seed_movies(self, filename: str = "movies") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "sk_movie_id": row["sk_movie_id"],
        "id_filme": row["id_filme"],
        "titulo": row["titulo"],
        "data_lancamento": self._parse_date(row.get("data_lancamento", "")),
        "ano_lancamento": self._parse_int(row.get("ano_lancamento", "")),
        "duracao_minutos": self._parse_int(row.get("duracao_minutos", "")),
        "status_filme": row.get("status_filme") or None,
        "sinopse": row.get("sinopse") or None,
        "url_poster": row.get("url_poster") or None,
        "url_backdrop": row.get("url_backdrop") or None,
      }

      for row in rows
    ]

    await self._insert_in_batches(DimMovie, values, ["sk_movie_id"])

  async def seed_genres(self, filename:str = "genres") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "nome_genero": row["nome_genero"],
        "sk_genre_id": row["sk_genre_id"]
      }

      for row in rows
    ]

    await self._insert_in_batches(DimGenre, values, ["sk_genre_id"])

  async def seed_people(self, filename: str = "people") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "sk_person_id": row["sk_person_id"],
        "nome_pessoa": row["nome_pessoa"],
        "tipo_pessoa": row["tipo_pessoa"]
      }

      for row in rows
    ]

    await self._insert_in_batches(DimPerson, values, ["sk_person_id"])

  async def seed_reviews(self, filename: str = "reviews") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "sk_review_id": row["sk_review_id"],
        "sk_movie_id": row["sk_movie_id"],
        "qtd_avaliacoes_usuarios": self._parse_int_or_zero(row["qtd_avaliacoes_usuarios"]),
        "nota_media_usuarios": self._parse_float(row["nota_media_usuarios"])
      }

      for row in rows
    ]

    await self._insert_in_batches(DimReview, values, ["sk_review_id"])

  async def seed_companies(self, filename: str = "companies") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "sk_company_id": row["sk_company_id"],
        "nome_produtora": row["nome_produtora"]
      }

      for row in rows
    ]

    await self._insert_in_batches(DimCompany, values, ["sk_company_id"])

  async def seed_fact_movies(self, filename: str = "fact_movies") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "sk_movie_id": row["sk_movie_id"],
        "orcamento_usd": self._parse_decimal(row["orcamento_usd"]),
        "receita_usd": self._parse_decimal(row["receita_usd"]),
        "lucro_usd": self._parse_decimal_or_zero(row["lucro_usd"]),
        "orcamento_brl": self._parse_decimal(row["orcamento_brl"]),
        "receita_brl": self._parse_decimal(row["receita_brl"]),
        "lucro_brl": self._parse_decimal_or_zero(row["lucro_brl"]),
        "popularidade": self._parse_float(row["popularidade"]),
        "nota_tmdb": self._parse_float(row["nota_tmdb"]),
        "qtd_tmdb": self._parse_int(row["qtd_tmdb"]),
        "nota_imdb": self._parse_float(row["nota_imdb"]),
        "qtd_imdb": self._parse_int(row["qtd_imdb"])
      }

      for row in rows
    ]

    await self._insert_in_batches(FactMoviePerformance, values, ["sk_movie_id"])

  async def seed_movies_reviews(self, filename: str = "movies_reviews") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "sk_movie_review_id": row["sk_movie_review_id"],
        "sk_movie_id": row["sk_movie_id"],
        "nome": row["nome"],
        "nota": self._parse_float(row["nota"]),
        "comentario": row["comentario"]
      }

      for row in rows
    ]

    await self._insert_in_batches(MovieReview, values, ["sk_movie_review_id"])

  async def seed_bridge_movie_person(self, filename: str = "bridge_movie_person") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "sk_movie_id": row["sk_movie_id"],
        "sk_person_id": row["sk_person_id"]
      }

      for row in rows
    ]

    await self._insert_in_batches(
      bridge_movie_person, values, ["sk_movie_id", "sk_person_id"]
    )

  async def seed_bridge_movie_genre(self, filename:str = "bridge_movie_genre") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "sk_movie_id": row["sk_movie_id"],
        "sk_genre_id": row["sk_genre_id"]
      }

      for row in rows
    ]

    await self._insert_in_batches(
      bridge_movie_genre, values, ["sk_movie_id", "sk_genre_id"]
    )

  async def seed_bridge_movie_company(self, filename:str = "bridge_movie_company") -> None:
    rows = self._read_csv(self.files[filename])

    if not rows:
      return

    values = [
      {
        "sk_movie_id": row["sk_movie_id"],
        "sk_company_id": row["sk_company_id"]
      }

      for row in rows
    ]

    await self._insert_in_batches(
      bridge_movie_company, values, ["sk_movie_id", "sk_company_id"]
    )
