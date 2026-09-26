import { Info } from "lucide-react";
import PosterFrame from "../../components/PosterFrame/PosterFrame";
import StarRating from "../../components/StarRating/StarRating";
import type { MovieCatalogItem } from "../../types/movieCatalogItem";
import styles from "./MovieCard.module.css";

function MovieCard({
  movieCatalogItem
}: {
  movieCatalogItem : MovieCatalogItem
}) {
  // nota_tmdb vem na escala de 0 a 10; StarRating espera de 0 a 5.
  const starValue = movieCatalogItem.notaMedia
    ? Math.round(movieCatalogItem.notaMedia)
    : 0;
  
  const posterUrl = movieCatalogItem.posterUrl
    ? movieCatalogItem.posterUrl : movieCatalogItem.titulo
  
  return (
    <div className={styles.card}>
      <PosterFrame src={posterUrl} alt={movieCatalogItem.titulo} size={180} />

      <div className={styles.footer}>
        <StarRating value={starValue} />
        <button className="btn-icon" aria-label="Mais informações">
          <Info size={20} />
        </button>
      </div>
    </div>
  );
}

export default MovieCard;