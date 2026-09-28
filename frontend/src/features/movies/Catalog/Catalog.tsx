import { Plus } from "lucide-react";
import MovieCard from "../MovieCard/MovieCard";
import SearchBar from "../../../components/SearchBar/SearchBar";
import type { MovieCatalogItem } from "../../../types/movieCatalogItem";
import styles from "./Catalog.module.css";

interface CatalogProps {
  movies: MovieCatalogItem[];
  searchValue: string;
  suggestions: MovieCatalogItem[];
  suggestionsLoading: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchSelect: (movie: MovieCatalogItem) => void;
  onAddMovie: () => void;
}

function Catalog({
  movies,
  searchValue,
  suggestions,
  suggestionsLoading,
  onSearchChange,
  onSearchSubmit,
  onSearchSelect,
  onAddMovie,
}: CatalogProps) {
  return (
    <>
      <header className={styles.header}>
        <h2>Catálogo de Filmes</h2>

        <div className={styles.actions}>
          <button
            className="btn-icon"
            type="button"
            aria-label="Cadastrar novo filme"
            onClick={onAddMovie}
          >
            <Plus size={22} />
          </button>
          <SearchBar
            placeholder="Buscar filmes..."
            size={18}
            value={searchValue}
            suggestions={suggestions}
            suggestionsLoading={suggestionsLoading}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            onSelect={onSearchSelect}
          />
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