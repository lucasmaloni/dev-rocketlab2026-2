from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

health_router = APIRouter()

@health_router.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}

@health_router.get("/db_health")
async def db_health_check(session: AsyncSession = Depends(get_db)) -> dict[str, int]:
    """Retorna o status do banco contando os registros das principais tabelas."""
    
    tables = [
        "dim_movies",
        "dim_genres",
        "dim_companies",
        "dim_people",
        "fact_movies_performance",
        "movie_reviews",
        "dim_reviews",
    ]
    
    counts = {}
    for table in tables:
        result = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
        counts[table] = result.scalar()
        
    return counts
