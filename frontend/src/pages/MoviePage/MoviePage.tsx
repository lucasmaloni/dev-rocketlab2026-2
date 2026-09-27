import { Menu } from "lucide-react";
import { useParams } from "react-router-dom";
import styles from "./MoviePage.module.css";

export default function MoviePage() {
  const { skMovieId } = useParams<{ skMovieId: string }>();

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button className={styles.menuButton} aria-label="Abrir menu principal">
          <Menu size={24} />
        </button>
      </header>

      <main className={styles.mainContent}>
        <p>ID do filme recebido: {skMovieId}</p>
      </main>
    </div>
  );
}