import httpx
import pytest

from app.main import app


@pytest.mark.asyncio
async def test_get_movie_catalog_page_1() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/movies/catalog/1?page_size=5")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5

    item = data[0]
    assert "skMovieId" in item
    assert "titulo" in item
    assert "posterUrl" in item
    assert "notaMedia" in item
    if item["notaMedia"] is not None:
        assert isinstance(item["notaMedia"], (int, float))
        assert 0.0 <= item["notaMedia"] <= 5.0


@pytest.mark.asyncio
async def test_get_movie_catalog_default_route() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/movies/catalog?page_size=5")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5


@pytest.mark.asyncio
async def test_get_movie_catalog_pagination_differs() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res1 = await client.get("/api/v1/movies/catalog/1?page_size=5")
        res2 = await client.get("/api/v1/movies/catalog/2?page_size=5")

    assert res1.status_code == 200
    assert res2.status_code == 200

    ids1 = [item["skMovieId"] for item in res1.json()]
    ids2 = [item["skMovieId"] for item in res2.json()]

    # Ensure pages don't return the same elements
    assert set(ids1).isdisjoint(set(ids2))


@pytest.mark.asyncio
async def test_get_movie_catalog_invalid_page() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/movies/catalog/0")

    assert response.status_code == 422
