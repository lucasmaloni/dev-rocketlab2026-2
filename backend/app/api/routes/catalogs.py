from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dto.genre import GenreName
from app.movies.models import DimGenre

catalog_router = APIRouter()


@catalog_router.get("/genres", response_model=list[GenreName])
async def get_genres(session: AsyncSession = Depends(get_db)) -> list[GenreName]:
    result = await session.execute(select(DimGenre).order_by(DimGenre.nome_genero))
    return [
        GenreName(sk_genre_id=genre.sk_genre_id, name=genre.nome_genero)
        for genre in result.scalars().all()
    ]


