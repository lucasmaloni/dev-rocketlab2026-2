import { Star } from "lucide-react";
import styles from "./StarRating.module.css";

function StarRating({ value } : { value: number }) {
  return (
    <span className={styles.rating} aria-label={`Nota ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={20}
          className={styles.star}
          fill={n <= value ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

export default StarRating;