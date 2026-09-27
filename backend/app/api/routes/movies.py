import math

from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.dto.genre import GenreName
from app.dto.movies import (
    Movie,
    MovieCatalogItem,
    MovieCatalogResponse,
    MovieDetailsResponse,
    MoviePerformance,
)
from app.dto.person import Person
from app.dto.review import Review
from app.movies.models import DimMovie, FactMoviePerformance

movies_router = APIRouter()

DEFAULT_PAGE_SIZE = 40
MAX_PAGE_SIZE = 80

@movies_router.get("/catalog/{page}", response_model=MovieCatalogResponse)
async def get_movie_catalog(
    page: int = Path(ge=1, description="Número da página (iniciando em 1)"),
    page_size: int = Query(
        default=DEFAULT_PAGE_SIZE,
        ge=1,
        le=MAX_PAGE_SIZE,
        description="Quantidade por página",
    ),
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
    page_size: int = Query(
        default=DEFAULT_PAGE_SIZE,
        ge=1,
        le=MAX_PAGE_SIZE,
        description="Quantidade por página",
    ),
    session: AsyncSession = Depends(get_db),
) -> MovieCatalogResponse:
    """Atalho para obter a primeira página do catálogo."""
    return await get_movie_catalog(page=1, page_size=page_size, session=session)


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

    return MovieDetailsResponse(
        movie=movie_response,
        performance=performance_response,
        genres=[GenreName(name=genre.nome_genero) for genre in movie.genres],
        cast=cast,
        crew=crew,
        reviews=reviews,
    )