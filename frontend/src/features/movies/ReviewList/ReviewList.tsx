import StarRating from "../../../components/StarRating/StarRating";
import type { Review } from "../../../types/review";
import styles from "./ReviewList.module.css";

interface ReviewListProps {
  reviews: Review[];
}

function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className={styles.emptyState}>Nenhuma avaliação registrada.</p>;
  }

  return (
    <ul className={styles.list}>
      {reviews.map((review, index) => (
        <li className={styles.review} key={`${review.nome}-${index}`}>
          <div className={styles.header}>
            <strong>{review.nome}</strong>
            <div className={styles.rating}>
              <StarRating value={review.nota / 2} />
            </div>
          </div>
          <p>{review.comentario}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;
