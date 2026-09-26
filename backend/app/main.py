from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.seed.seeder import Seeder
from app.db.session import engine

configure_logging()
settings = get_settings()

async_session_factory = async_sessionmaker(engine, expire_on_commit=False)
SEEDING_ENABLED = False

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Popula o banco com dados iniciais e libera recursos ao encerrar."""

    del app
    if SEEDING_ENABLED:
        
        async with async_session_factory() as session:
            seeder = Seeder(session)
            await seeder.seed_movies()
            await seeder.seed_genres()
            await seeder.seed_companies()
            await seeder.seed_people()
            await seeder.seed_bridge_movie_genre()
            await seeder.seed_bridge_movie_company()
            await seeder.seed_bridge_movie_person()
            await seeder.seed_fact_movies()
            await seeder.seed_reviews()
            await seeder.seed_movies_reviews()
            await session.commit()

    yield
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version=settings.project_version,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.backend_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/db_health", tags=["db_health"])
    async def db_health_check() -> dict[str, str]:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok"}

    return app


app = create_app()
