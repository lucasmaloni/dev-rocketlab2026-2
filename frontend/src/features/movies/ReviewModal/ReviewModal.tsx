import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import StarRating from "../../../components/StarRating/StarRating";
import { useCreateMovieReview } from "../useCreateMovieReview";
import styles from "./ReviewModal.module.css";

interface ReviewModalProps {
  skMovieId: string;
  initialUser: string;
  onClose: () => void;
}

function ReviewModal({ skMovieId, initialUser, onClose }: ReviewModalProps) {
  const [name, setName] = useState(initialUser);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const mutation = useCreateMovieReview(skMovieId, onClose);

  const changeRating = (amount: number) => {
    setRating((currentRating) => {
      const nextRating = Math.round((currentRating + amount) * 2) / 2;
      return Math.min(Math.max(nextRating, 0.5), 5);
    });
  };

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || rating === 0) {
      return;
    }

    mutation.mutate({
      nome: name.trim(),
      nota: rating,
      comentario: comment.trim() || null,
    });
  };

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="review-modal-title">Registrar avaliação</h2>
          <button className="btn-icon" type="button" aria-label="Fechar" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <form onSubmit={submitReview}>
          <label htmlFor="review-name">Nome</label>
          <input
            id="review-name"
            value={name}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <fieldset className={styles.ratingField}>
            <legend>Nota</legend>
            <div className={styles.ratingControl}>
              <button
                className={`btn-icon ${styles.stepButton}`}
                type="button"
                aria-label="Diminuir nota em 0,5"
                onClick={() => changeRating(-0.5)}
                disabled={rating <= 0.5}
              >
                <Minus size={18} />
              </button>
              <StarRating value={rating} />
              <button
                className={`btn-icon ${styles.stepButton}`}
                type="button"
                aria-label="Aumentar nota em 0,5"
                onClick={() => changeRating(0.5)}
                disabled={rating >= 5}
              >
                <Plus size={18} />
              </button>
            </div>
            <span className={styles.ratingValue}>
              {rating > 0 ? `${rating.toFixed(1)} / 5` : "Selecione uma nota"}
            </span>
          </fieldset>

          <label htmlFor="review-comment">Comentário (opcional)</label>
          <textarea
            id="review-comment"
            value={comment}
            maxLength={4000}
            rows={4}
            onChange={(event) => setComment(event.target.value)}
          />

          {mutation.error && <p className={styles.error}>{mutation.error.message}</p>}

          <div className={styles.actions}>
            <button className="btn btn-ghost" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-accent" type="submit" disabled={mutation.isPending || !name.trim() || rating === 0}>
              {mutation.isPending ? "Enviando..." : "Enviar avaliação"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ReviewModal;
