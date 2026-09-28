import { X } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { useDeleteMovie } from "../useDeleteMovie";
import styles from "./DeleteMovieModal.module.css";

interface DeleteMovieModalProps {
  skMovieId: string;
  movieTitle: string;
  onClose: () => void;
}

function DeleteMovieModal({ skMovieId, movieTitle, onClose }: DeleteMovieModalProps) {
  const [confirmation, setConfirmation] = useState("");
  const mutation = useDeleteMovie(skMovieId);

  const canDelete = confirmation === movieTitle && !mutation.isPending;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canDelete) return;
    mutation.mutate();
  };

  // Sem onMouseDown no backdrop: o modal só fecha por Cancelar ou X.
  return (
    <div className={styles.backdrop} role="presentation">
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-movie-title"
      >
        <header className={styles.header}>
          <h2 id="delete-movie-title">Excluir filme</h2>
          <button
            className="btn-icon"
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={submit}>
          <p className={styles.warning}>
            Esta ação é <strong>permanente</strong>. O filme, suas avaliações, dados de
            performance e associações com gêneros, produtoras e pessoas serão removidos e
            não poderão ser recuperados.
          </p>

          <label className={styles.confirmLabel}>
            Para confirmar, digite o título exato do filme:{" "}
            <strong className={styles.titleToType}>{movieTitle}</strong>
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              required
              autoFocus
            />
          </label>

          {mutation.error && <p className={styles.error}>{mutation.error.message}</p>}

          <div className={styles.actions}>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancelar
            </button>
            <button className="btn btn-danger" type="submit" disabled={!canDelete}>
              {mutation.isPending ? "Excluindo..." : "Excluir permanentemente"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default DeleteMovieModal;
