import { Film } from "lucide-react";
import styles from "./PosterFrame.module.css";

function PosterFrame({ src, alt, size }: { src: string; alt: string; size: number }) {
  return (
    <div className={styles.frame} style={{ width: size }}>
      {src ? (
        <img className={styles.image} src={src} alt={alt} loading="lazy" />
      ) : (
        <div className={styles.fallback} role="img" aria-label={alt}>
          <Film size={Math.max(size * 0.3, 20)} />
        </div>
      )}
    </div>
  );
}

export default PosterFrame;