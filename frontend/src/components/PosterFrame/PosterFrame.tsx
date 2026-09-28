import { Film } from "lucide-react";
import { useState } from "react";
import styles from "./PosterFrame.module.css";

function PosterFrame({ src, alt, size }: { src: string; alt: string; size: number }) {
  // Guarda a URL que falhou (e não um booleano) para que uma nova URL volte a ser tentada.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && src !== failedSrc;

  return (
    <div className={styles.frame} style={{ width: size }}>
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div className={styles.fallback} role="img" aria-label={alt}>
          <Film size={Math.max(size * 0.3, 20)} />
        </div>
      )}
    </div>
  );
}

export default PosterFrame;