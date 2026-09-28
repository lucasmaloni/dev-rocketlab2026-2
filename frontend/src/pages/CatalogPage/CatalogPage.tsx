import { Clapperboard, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Catalog from "../../features/movies/Catalog/Catalog";
import { useMovies } from "../../features/movies/useMovies";
import styles from "./CatalogPage.module.css";

function CatalogPage() {
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();
  const appliedSearch = searchParams.get("q") ?? "";
  const { movies, currentPage, totalPages, isLoading, error, refetch } = useMovies(
    page,
    appliedSearch,
  );
  const suggestionsQuery = useMovies(1, debouncedSearch, 5, Boolean(debouncedSearch));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchValue(appliedSearch);
      setPage(1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [appliedSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchValue]);

  const submitSearch = () => {
    const query = searchValue.trim();
    setPage(1);
    setSearchParams(query ? { q: query } : {});
  };

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <span className={styles.brand}>
            <Clapperboard size={26} color="var(--accent)" />
            <h3>Você Pode (Não) Assistir</h3>
          </span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.catalogContainer}>
          {error ? (
            <div className={styles.feedback}>
              <p>{error}</p>
              <button className="btn" onClick={() => refetch()}>
                Tentar novamente
              </button>
            </div>
          ) : isLoading ? (
            <div className={styles.feedback}>
              <p>Carregando filmes...</p>
            </div>
          ) : (
            <Catalog
              movies={movies}
              searchValue={searchValue}
              suggestions={suggestionsQuery.movies}
              suggestionsLoading={suggestionsQuery.isLoading}
              onSearchChange={setSearchValue}
              onSearchSubmit={submitSearch}
              onSearchSelect={(movie) => navigate(`/movies/${movie.skMovieId}`)}
            />
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.pagination}`}>
          <button
            className="btn btn-ghost"
            aria-label="Página anterior"
            onClick={prevPage}
            disabled={isLoading || currentPage <= 1}
          >
            <ChevronLeft size={18} />
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            className="btn btn-ghost"
            aria-label="Próxima página"
            onClick={nextPage}
            disabled={isLoading || currentPage >= totalPages}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default CatalogPage;