import { Funnel, Eye, Trash, Pencil } from "lucide-react";
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
}

function Catalog({
  movies,
  searchValue,
  suggestions,
  suggestionsLoading,
  onSearchChange,
  onSearchSubmit,
  onSearchSelect,
}: CatalogProps) {
  return (
    <>
      <header className={styles.header}>

        <div className={styles.actions}>
          <h2>Catálogo de Filmes</h2>
          <button 
            className="btn-icon"
            type="button"
            aria-label="Registrar avaliação de filme"
          >
            <Eye size={22} className={styles.iconView} />
          </button>

          <button
            className="btn-icon"
            type="button"
            aria-label="Editar filme cadastrado"
          >
            <Pencil size={22} className={styles.iconEdit} />
          </button>

          <button
            className="btn-icon"
            type="button"
            aria-label="Excluir filme cadastrado">
              <Trash size={22} className={styles.iconDelete} />
          </button>
        </div>

        <div className={styles.actions}>
          <button
          className="btn-icon"
          type="button"
          aria-label="Abrir filtros"
          >
            <Funnel size={22} />
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