import math
import unicodedata

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.dto.company import Company
from app.dto.genre import GenreName
from app.dto.movies import (
    Movie,
    MovieCatalogItem,
    MovieCatalogResponse,
    MovieDetailsResponse,
    MoviePerformance,
)
from app.dto.person import Person
from app.dto.review import Review, ReviewSummary
from app.movies.models import DimMovie, FactMoviePerformance

movies_router = APIRouter()

DEFAULT_PAGE_SIZE = 40
MAX_PAGE_SIZE = 80


def _normalize_search_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    without_accents = "".join(
        character for character in normalized if not unicodedata.combining(character)
    )
    return without_accents.lower()


def _normalized_title_expression():
    expression = func.lower(DimMovie.titulo)
    replacements = {
        "á": "a", "à": "a", "ã": "a", "â": "a", "ä": "a",
        "é": "e", "è": "e", "ê": "e", "ë": "e",
        "í": "i", "ì": "i", "î": "i", "ï": "i",
        "ó": "o", "ò": "o", "õ": "o", "ô": "o", "ö": "o",
        "ú": "u", "ù": "u", "û": "u", "ü": "u",
        "ç": "c",
    }
    for source, target in replacements.items():
        expression = func.replace(expression, source, target)
    return expression

@movies_router.get("/catalog/{page}", response_model=MovieCatalogResponse)
async def get_movie_catalog(
    page: int = Path(ge=1, description="Número da página (iniciando em 1)"),
    page_size: int = Query(
        default=DEFAULT_PAGE_SIZE,
        ge=1,
        le=MAX_PAGE_SIZE,
        description="Quantidade por página",
    ),
    q: str | None = Query(default=None, description="Termo para buscar no título"),
    session: AsyncSession = Depends(get_db),
) -> MovieCatalogResponse:
    """Retorna os filmes paginados para o catálogo com metadados de total de páginas."""
    offset = (page - 1) * page_size

    search_term = _normalize_search_text(q.strip()) if q and q.strip() else None
    movie_filter = (
        _normalized_title_expression().contains(search_term) if search_term else None
    )

    count_stmt = select(func.count()).select_from(DimMovie)
    if movie_filter is not None:
        count_stmt = count_stmt.where(movie_filter)
    total_result = await session.execute(count_stmt)
    total_movies = total_result.scalar() or 0

    total_pages = math.ceil(total_movies / page_size) if total_movies > 0 else 1

    # Fallback inteligente: se nota_tmdb for 0 ou nula, utiliza nota_imdb
    effective_rating = case(
        (FactMoviePerformance.nota_tmdb > 0, FactMoviePerformance.nota_tmdb),
        (FactMoviePerformance.nota_imdb > 0, FactMoviePerformance.nota_imdb),
        else_=None,
    )

    has_poster = case((DimMovie.url_poster.isnot(None), 1), else_=0)

    stmt = (
        select(
            DimMovie.sk_movie_id,
            DimMovie.titulo,
            DimMovie.url_poster,
            effective_rating.label("rating"),
        )
        .outerjoin(FactMoviePerformance, DimMovie.sk_movie_id == FactMoviePerformance.sk_movie_id)
        .order_by(
            has_poster.desc(),
            FactMoviePerformance.popularidade.desc().nulls_last(),
            DimMovie.ano_lancamento.desc().nulls_last(),
            DimMovie.titulo.asc(),
        )
        .offset(offset)
        .limit(page_size)
    )
    if movie_filter is not None:
        stmt = stmt.where(movie_filter)

    result = await session.execute(stmt)
    rows = result.all()

    items = [
        MovieCatalogItem(
            sk_movie_id=row.sk_movie_id,
            titulo=row.titulo,
            poster_url=row.url_poster,
            nota_media=round(row.rating / 2, 1) if row.rating is not None else None,
        )
        for row in rows
    ]

    return MovieCatalogResponse(
        items=items,
        total=total_movies,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@movies_router.get("/catalog", response_model=MovieCatalogResponse)
async def get_movie_catalog_default(
    page_size: int = Query(
        default=DEFAULT_PAGE_SIZE,
        ge=1,
        le=MAX_PAGE_SIZE,
        description="Quantidade por página",
    ),
    q: str | None = Query(default=None, description="Termo para buscar no título"),
    session: AsyncSession = Depends(get_db),
) -> MovieCatalogResponse:
    """Atalho para obter a primeira página do catálogo."""
    return await get_movie_catalog(page=1, page_size=page_size, q=q, session=session)


@movies_router.get("/{sk_movie_id}", response_model=MovieDetailsResponse)
async def get_movie_details(
    sk_movie_id: str,
    session: AsyncSession = Depends(get_db),
) -> MovieDetailsResponse:
    stmt = (
        select(DimMovie)
        .options(
            selectinload(DimMovie.performance),
            selectinload(DimMovie.genres),
            selectinload(DimMovie.people),
            selectinload(DimMovie.reviews),
            selectinload(DimMovie.companies),
            selectinload(DimMovie.reviews_summary),
        )
        .where(DimMovie.sk_movie_id == sk_movie_id)
    )
    result = await session.execute(stmt)
    movie = result.scalar_one_or_none()

    if movie is None:
        raise HTTPException(status_code=404, detail="Filme não encontrado")

    movie_response = Movie(
        sk_movie_id=movie.sk_movie_id,
        id=movie.id_filme,
        titulo=movie.titulo,
        data_lancamento=(
            movie.data_lancamento.isoformat() if movie.data_lancamento is not None else None
        ),
        ano_lancamento=movie.ano_lancamento,
        status_filme=movie.status_filme,
        sinopse=movie.sinopse,
        poster_url=movie.url_poster,
        backdrop_url=movie.url_backdrop,
    )

    performance_response = None
    if movie.performance is not None:
        performance = movie.performance
        performance_response = MoviePerformance(
            sk_movie_id=performance.sk_movie_id,
            orcamento_usd=performance.orcamento_usd,
            receita_usd=performance.receita_usd,
            orcamento_brl=performance.orcamento_brl,
            receita_brl=performance.receita_brl,
            lucro_brl=performance.lucro_brl,
            popularidade=performance.popularidade,
            nota_tmdb=performance.nota_tmdb,
            qtd_tmdb=performance.qtd_tmdb,
            nota_imdb=performance.nota_imdb,
            qtd_imdb=performance.qtd_imdb,
        )

    people = [
        Person(
            sk_person_id=person.sk_person_id,
            nome_pessoa=person.nome_pessoa,
            tipo_pessoa=person.tipo_pessoa,
        )
        for person in movie.people
    ]
    cast = sorted(
        (person for person in people if person.tipo_pessoa == "Ator"),
        key=lambda person: person.nome_pessoa.casefold(),
    )
    crew = sorted(
        (person for person in people if person.tipo_pessoa in {"Diretor", "Roteirista"}),
        key=lambda person: person.nome_pessoa.casefold(),
    )
    reviews = [
        Review(nome=review.nome, comentario=review.comentario, nota=review.nota)
        for review in sorted(
            movie.reviews,
            key=lambda review: review.created_at,
            reverse=True,
        )
    ]
    companies = [
        Company(
            sk_company_id=company.sk_company_id,
            nome_produtora=company.nome_produtora,
        )
        for company in movie.companies
    ]
    reviews_summary = (
        ReviewSummary(
            qtd_avaliacoes_usuarios=movie.reviews_summary.qtd_avaliacoes_usuarios,
            nota_media_usuarios=movie.reviews_summary.nota_media_usuarios,
        )
        if movie.reviews_summary is not None
        else None
    )

    return MovieDetailsResponse(
        movie=movie_response,
        performance=performance_response,
        genres=[GenreName(name=genre.nome_genero) for genre in movie.genres],
        cast=cast,
        crew=crew,
        reviews=reviews,
        companies=companies,
        reviews_summary=reviews_summary,
    )