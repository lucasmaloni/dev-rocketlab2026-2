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
    assert isinstance(data, dict)
    assert "items" in data
    assert "total" in data
    assert "totalPages" in data
    assert data["total"] > 0
    assert data["totalPages"] > 0
    assert len(data["items"]) == 5

    item = data["items"][0]
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
    assert isinstance(data, dict)
    assert len(data["items"]) == 5


@pytest.mark.asyncio
async def test_get_movie_catalog_pagination_differs() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res1 = await client.get("/api/v1/movies/catalog/1?page_size=5")
        res2 = await client.get("/api/v1/movies/catalog/2?page_size=5")

    assert res1.status_code == 200
    assert res2.status_code == 200

    ids1 = [item["skMovieId"] for item in res1.json()["items"]]
    ids2 = [item["skMovieId"] for item in res2.json()["items"]]

    # Ensure pages don't return the same elements
    assert set(ids1).isdisjoint(set(ids2))


@pytest.mark.asyncio
async def test_get_movie_catalog_invalid_page() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/movies/catalog/0")

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_movie_catalog_search_filters_titles() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/movies/catalog/1?q=star%20wars&page_size=40")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 5
    assert len(data["items"]) == data["total"]
    assert all("star wars" in item["titulo"].lower() for item in data["items"])


@pytest.mark.asyncio
async def test_get_movie_catalog_search_ignores_accents() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/movies/catalog/1?q=acao&page_size=40")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert len(data["items"]) == data["total"]


@pytest.mark.asyncio
async def test_get_movie_catalog_search_suggestion_page_size_is_independent() -> None:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/movies/catalog/1?q=star%20wars&page_size=5")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] > data["pageSize"]
    assert len(data["items"]) == 5
