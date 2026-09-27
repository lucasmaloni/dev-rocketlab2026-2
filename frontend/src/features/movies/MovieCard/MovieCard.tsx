import { Info } from "lucide-react";
import PosterFrame from "../../../components/PosterFrame/PosterFrame";
import StarRating from "../../../components/StarRating/StarRating";
import type { MovieCatalogItem } from "../../../types/movieCatalogItem";
import styles from "./MovieCard.module.css";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../routes/path";

function MovieCard({
  movieCatalogItem
}: {
  movieCatalogItem : MovieCatalogItem
}) {
  const starValue = movieCatalogItem.notaMedia ?? 0;

  const navigate = useNavigate();

  const handleInfoClick = () => {
    navigate(ROUTES.movieDetails(movieCatalogItem.skMovieId));
  };
  
  return (
    <div className={styles.card}>
      <PosterFrame 
        src={movieCatalogItem.posterUrl ?? ""} 
        alt={movieCatalogItem.titulo} 
        size={180} 
      />

      <div className={styles.footer}>
        <StarRating value={starValue} />
        <button 
          className="btn-icon" 
          aria-label="Mais informações"
          onClick={handleInfoClick}
        >
          <Info size={20} />
        </button>
      </div>
    </div>
  );
}

export default MovieCard;