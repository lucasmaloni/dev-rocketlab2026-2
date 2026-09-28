from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.dto.review import Review, ReviewCreate, ReviewCreatedResponse, ReviewSummary
from app.movies.models import DimMovie, DimReview, MovieReview

reviews_router = APIRouter()


@reviews_router.post(
    "/{sk_movie_id}",
    response_model=ReviewCreatedResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_movie_review(
    payload: ReviewCreate,
    sk_movie_id: str = Path(description="Chave do filme avaliado"),
    session: AsyncSession = Depends(get_db),
) -> ReviewCreatedResponse:
    movie_result = await session.execute(
        select(DimMovie)
        .options(selectinload(DimMovie.reviews_summary))
        .where(DimMovie.sk_movie_id == sk_movie_id)
    )
    movie = movie_result.scalar_one_or_none()
    if movie is None:
        raise HTTPException(status_code=404, detail="Filme não encontrado")

    review = MovieReview(
        sk_movie_id=sk_movie_id,
        nome=payload.nome,
        nota=payload.nota * 2,
        comentario=payload.comentario or "Avaliação sem comentário",
    )
    session.add(review)
    await session.flush()

    summary_result = await session.execute(
        select(
            func.count(MovieReview.sk_movie_review_id),
            func.avg(MovieReview.nota),
        ).where(MovieReview.sk_movie_id == sk_movie_id)
    )
    review_count, review_average = summary_result.one()

    summary = movie.reviews_summary
    if summary is None:
        summary = DimReview(
            sk_movie_id=sk_movie_id,
            qtd_avaliacoes_usuarios=review_count,
            nota_media_usuarios=review_average,
        )
        session.add(summary)
    else:
        summary.qtd_avaliacoes_usuarios = review_count
        summary.nota_media_usuarios = review_average

    await session.commit()
    await session.refresh(review)

    return ReviewCreatedResponse(
        review=Review(
            nome=review.nome,
            comentario=review.comentario,
            nota=review.nota,
        ),
        reviews_summary=ReviewSummary(
            qtd_avaliacoes_usuarios=review_count,
            nota_media_usuarios=review_average,
        ),
    )