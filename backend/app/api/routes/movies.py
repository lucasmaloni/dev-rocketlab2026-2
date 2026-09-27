import math
from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dto.movies import MovieCatalogItem, MovieCatalogResponse
from app.movies.models import DimMovie, FactMoviePerformance

movies_router = APIRouter()

DEFAULT_PAGE_SIZE = 40
MAX_PAGE_SIZE = 80


@movies_router.get("/catalog/{page}", response_model=MovieCatalogResponse)
async def get_movie_catalog(
    page: int = Path(ge=1, description="Número da página (iniciando em 1)"),
    page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description="Quantidade por página"),
    session: AsyncSession = Depends(get_db),
) -> MovieCatalogResponse:
    """Retorna os filmes paginados para o catálogo com metadados de total de páginas."""
    offset = (page - 1) * page_size

    # Contagem total de filmes cadastrados
    count_stmt = select(func.count()).select_from(DimMovie)
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
    page_size: int = Query(default=DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE, description="Quantidade por página"),
    session: AsyncSession = Depends(get_db),
) -> MovieCatalogResponse:
    """Atalho para obter a primeira página do catálogo."""
    return await get_movie_catalog(page=1, page_size=page_size, session=session)