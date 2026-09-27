import { Funnel } from "lucide-react";
import MovieCard from "../MovieCard/MovieCard";
import SearchBar from "../../../components/SearchBar/SearchBar";
import type { MovieCatalogItem } from "../../../types/movieCatalogItem";
import styles from "./Catalog.module.css";

function Catalog({ movies }: { movies: MovieCatalogItem[] }) {
  return (
    <>
      <header className={styles.header}>
        <h2>Catálogo de Filmes</h2>

        <div className={styles.actions}>
          <button
          className="btn-icon"
          type="button"
          aria-label="Abrir filtros"
          >
            <Funnel size={22} />
          </button>
          <SearchBar placeholder="Buscar filmes..." size={18}/>
        </div>
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