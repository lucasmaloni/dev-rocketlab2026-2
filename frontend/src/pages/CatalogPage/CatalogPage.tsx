import { Clapperboard, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import Catalog from "../../features/movies/Catalog/Catalog";
import { useMovies } from "../../features/movies/useMovies";
import styles from "./CatalogPage.module.css";

function CatalogPage() {
  const {
    movies,
    currentPage,
    totalPages,
    isLoading,
    error,
    nextPage,
    prevPage,
    refetch,
  } = useMovies();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <span className={styles.brand}>
            <Clapperboard size={26} color="var(--accent)" />
            <h3>Catálogo de Filmes</h3>
          </span>
          <button className="btn-icon" aria-label="Abrir menu">
            <Menu size={24} />
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.catalogContainer}>
          {error ? (
            <div className={styles.feedback}>
              <p>{error}</p>
              <button className="btn" onClick={refetch}>
                Tentar novamente
              </button>
            </div>
          ) : isLoading ? (
            <div className={styles.feedback}>
              <p>Carregando filmes...</p>
            </div>
          ) : (
            <Catalog movies={movies} />
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