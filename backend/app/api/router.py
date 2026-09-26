from fastapi import APIRouter

from app.api.routes.movies import movies_router

api_router = APIRouter()

api_router.include_router(movies_router, prefix="/movies", tags=["movies"])
