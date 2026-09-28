from fastapi import APIRouter

from app.api.routes.catalogs import catalog_router
from app.api.routes.movies import movies_router
from app.api.routes.reviews import reviews_router

api_router = APIRouter()

api_router.include_router(movies_router, prefix="/movies", tags=["movies"])
api_router.include_router(reviews_router, prefix="/reviews", tags=["reviews"])
api_router.include_router(catalog_router, tags=["catalogs"])
