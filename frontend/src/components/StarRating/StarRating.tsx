import { Star } from "lucide-react";
import styles from "./StarRating.module.css";

function StarRating({ value } : { value: number }) {
  const normalizedValue = Math.min(Math.max(value, 0), 5);

  return (
    <span className={styles.rating} aria-label={`Nota ${normalizedValue} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span className={styles.starWrapper} key={n}>
          <Star size={20} className={styles.star} fill="none" aria-hidden="true" />
          <span
            className={styles.filledStar}
            style={{ width: `${Math.min(Math.max(normalizedValue - n + 1, 0), 1) * 100}%` }}
          >
            <Star size={20} className={styles.star} fill="currentColor" aria-hidden="true" />
          </span>
        </span>
      ))}
    </span>
  );
}

export default StarRating;