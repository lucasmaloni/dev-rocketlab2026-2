import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MovieCatalogItem } from "../../types/movieCatalogItem";
import SearchItem from "../SearchItem/SearchItem";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  placeholder: string;
  size: number;
  value: string;
  suggestions: MovieCatalogItem[];
  suggestionsLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSelect: (movie: MovieCatalogItem) => void;
}

function SearchBar({
  placeholder,
  size,
  value,
  suggestions,
  suggestionsLoading,
  onChange,
  onSubmit,
  onSelect,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setIsOpen(false);
      onSubmit();
    }
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.search} ref={searchRef}>
      <Search size={size} className={styles.searchIcon} />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(Boolean(event.target.value.trim()));
        }}
        onFocus={() => setIsOpen(Boolean(value.trim()))}
        onKeyDown={handleKeyDown}
      />
      {isOpen && value.trim() && (
        <div className={styles.suggestions} role="listbox">
          {suggestionsLoading ? (
            <p className={styles.feedback}>Buscando filmes...</p>
          ) : suggestions.length > 0 ? (
            suggestions.map((movie) => (
              <SearchItem
                key={movie.skMovieId}
                movie={movie}
                onSelect={() => {
                  setIsOpen(false);
                  onSelect(movie);
                }}
              />
            ))
          ) : (
            <p className={styles.feedback}>Nenhum filme encontrado</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;