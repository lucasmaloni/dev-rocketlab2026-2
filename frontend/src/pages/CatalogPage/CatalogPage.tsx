import { Clapperboard, Menu, ChevronLeft, ChevronRight } from "lucide-react";
import Catalog from "../../features/Catalog/Catalog";
import styles from "./CatalogPage.module.css";
import type { MovieCatalogItem } from "../../types/movieCatalogItem";

const mockMovie: MovieCatalogItem = {
  skMovieId: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
  titulo: "Evangelion: 3.0+1.0 Thrice Upon a Time",
  posterUrl: "https://m.media-amazon.com/images/M/MV5BNWYzOTRlYzItMmM5Ni00NjQxLWIwYjUtYTFhYTVhOWRhYWEyXkEyXkFqcGc@._V1_QL75_UY281_CR11,0,190,281_.jpg",
  notaMedia: 4.0
};

function CatalogPage(){
  return(
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
          <Catalog movies={[mockMovie]} />
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.pagination}`}>
          <button className="btn btn-ghost" aria-label="Página anterior">
            <ChevronLeft size={18} />
          </button>
          <span>Página 1 de 5</span>
          <button className="btn btn-ghost" aria-label="Próxima página">
            <ChevronRight size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default CatalogPage;