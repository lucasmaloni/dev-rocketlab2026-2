import { Funnel } from "lucide-react";
import MovieCard from "../MovieCard/MovieCard";
import type { MovieCatalogItem } from "../../../types/movieCatalogItem";
import styles from "./Catalog.module.css";

function Catalog({ movies }: { movies: MovieCatalogItem[] }) {
  return (
    <>
      <header className={styles.header}>
        <button
          className="btn-icon"
          type="button"
          aria-label="Abrir filtros"
        >
          <Funnel size={22} />
        </button>
        <h2>Catálogo de Filmes</h2>
      </header>
      <div className={styles.catalog}>
        {movies.map((movieItem) => (
          <MovieCard key={movieItem.skMovieId} movieCatalogItem={movieItem} />
        ))}
      </div>
    </>
    
  );
}

export default Catalog;