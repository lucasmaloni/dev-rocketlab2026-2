import { Info } from "lucide-react";
import PosterFrame from "../../components/PosterFrame/PosterFrame";
import StarRating from "../../components/StarRating/StarRating";
import type { Movie } from "../../types/movie";
import type { MoviePerformance } from "../../types/moviePerformance";
import styles from "./MovieCard.module.css";

function MovieCard({
  movie,
  moviePerformance,
}: {
  movie: Movie;
  moviePerformance: MoviePerformance;
}) {
  // nota_tmdb vem na escala de 0 a 10; StarRating espera de 0 a 5.
  const starValue = moviePerformance.notaTmdb
    ? Math.round(moviePerformance.notaTmdb / 2)
    : 0;

  return (
    <div className={styles.card}>
      <PosterFrame src={movie.posterUrl} alt={movie.titulo} size={180} />

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