import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { getGenres } from "../../../api/movies";
import MultiSelect from "../../../components/Multiselect/MultiSelect";
import PosterFrame from "../../../components/PosterFrame/PosterFrame";
import { ROUTES } from "../../../routes/path";
import { MOVIE_STATUSES } from "../../../types/movieCreate";
import type { MovieStatus } from "../../../types/movieCreate";
import { useCreateMovie } from "../useCreateMovie";
import styles from "./CreateMovieModal.module.css";

interface CreateMovieModalProps {
  onClose: () => void;
}

const MAX_CAST_NAME_LENGTH = 255;
const POSTER_PREVIEW_DELAY_MS = 500;

// Digita-se apenas números; as barras entram sozinhas (DD/MM/AAAA).
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// DD/MM/AAAA -> { iso: "AAAA-MM-DD", year }, ou null se não for uma data real.
function parseBrDate(value: string): { iso: string; year: number } | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return null;

  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1]) return null;

  return { iso: `${match[3]}-${match[2]}-${match[1]}`, year };
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseCastNames(value: string): string[] {
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

function CreateMovieModal({ onClose }: CreateMovieModalProps) {
  const navigate = useNavigate();
  const mutation = useCreateMovie();
  const genresQuery = useQuery({
    queryKey: ["genres"],
    queryFn: ({ signal }) => getGenres(signal),
  });

  const [title, setTitle] = useState("");
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [dateText, setDateText] = useState("");
  const [status, setStatus] = useState<MovieStatus | "">("");
  const [synopsis, setSynopsis] = useState("");
  const [castText, setCastText] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [backdropUrl, setBackdropUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Preview com atraso: evita requisitar a imagem a cada tecla digitada.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const value = posterUrl.trim();
      setPreviewUrl(isHttpUrl(value) ? value : "");
    }, POSTER_PREVIEW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [posterUrl]);

  const parsedDate = parseBrDate(dateText);
  const castNames = parseCastNames(castText);

  const errors: Partial<
    Record<
      "title" | "genres" | "date" | "status" | "synopsis" | "cast" | "poster" | "backdrop",
      string
    >
  > = {};
  if (!title.trim()) errors.title = "Informe o título.";
  if (genreIds.length === 0) errors.genres = "Selecione ao menos um gênero.";
  if (!parsedDate) errors.date = "Informe uma data válida (DD/MM/AAAA).";
  if (status === "") errors.status = "Selecione o status.";
  if (!synopsis.trim()) errors.synopsis = "Informe a sinopse.";
  if (castNames.length === 0) {
    errors.cast = "Informe ao menos um ator, separando os nomes por vírgula.";
  } else if (castNames.some((name) => name.length > MAX_CAST_NAME_LENGTH)) {
    errors.cast = `Cada nome deve ter até ${MAX_CAST_NAME_LENGTH} caracteres.`;
  }
  if (posterUrl.trim() && !isHttpUrl(posterUrl.trim())) {
    errors.poster = "Informe uma URL começando com http:// ou https://.";
  }
  if (backdropUrl.trim() && !isHttpUrl(backdropUrl.trim())) {
    errors.backdrop = "Informe uma URL começando com http:// ou https://.";
  }

  const showError = (field: keyof typeof errors) =>
    submitAttempted && errors[field] ? <p className="field-error">{errors[field]}</p> : null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    if (Object.keys(errors).length > 0 || !parsedDate || status === "") return;

    mutation.mutate({
      titulo: title.trim(),
      data_lancamento: parsedDate.iso,
      ano_lancamento: parsedDate.year,
      status_filme: status,
      sinopse: synopsis.trim(),
      genre_ids: genreIds,
      cast_names: castNames,
      poster_url: posterUrl.trim() || null,
      backdrop_url: backdropUrl.trim() || null,
    });
  };

  // Sem onMouseDown no backdrop: o modal só fecha por Cancelar ou X (evita perder o formulário).
  if (mutation.isSuccess) {
    const created = mutation.data.movie;

    return (
      <div className={styles.backdrop} role="presentation">
        <section
          className={`${styles.modal} ${styles.notice}`}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="create-movie-success-title"
        >
          <h2 id="create-movie-success-title">Filme cadastrado com sucesso</h2>
          <p className={styles.noticeText}>
            <strong>{created.titulo}</strong> foi adicionado ao catálogo. Deseja visualizar os
            dados do filme agora?
          </p>
          <div className={styles.actions}>
            <button className="btn btn-ghost" type="button" onClick={onClose}>
              Agora não
            </button>
            <button
              className="btn btn-accent"
              type="button"
              autoFocus
              onClick={() => navigate(ROUTES.movieDetails(created.sk_movie_id))}
            >
              Ver filme
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.backdrop} role="presentation">
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-movie-title"
      >
        <header className={styles.header}>
          <h2 id="create-movie-title">Cadastrar filme</h2>
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

        <form onSubmit={submit} noValidate>
          <div className={styles.content}>
            <aside className={styles.posterCol}>
              <PosterFrame src={previewUrl} alt="Pré-visualização do pôster" size={220} />
            </aside>

            <div className={styles.fields}>
              <div>
                <label>
                  Título *
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={500}
                  />
                </label>
                {showError("title")}
              </div>

              <div>
                <MultiSelect
                  label="Gêneros *"
                  placeholder="Selecione os gêneros"
                  loading={genresQuery.isLoading}
                  options={(genresQuery.data ?? []).map((genre) => ({
                    value: genre.sk_genre_id,
                    label: genre.name,
                  }))}
                  selected={genreIds}
                  onChange={setGenreIds}
                />
                {genresQuery.error && (
                  <p className="field-error">Não foi possível carregar os gêneros.</p>
                )}
                {showError("genres")}
              </div>

              <div className={styles.row}>
                <div>
                  <label>
                    Data de lançamento *
                    <input
                      value={dateText}
                      onChange={(event) => setDateText(maskDate(event.target.value))}
                      placeholder="DD/MM/AAAA"
                      inputMode="numeric"
                      maxLength={10}
                    />
                  </label>
                  {showError("date")}
                </div>
                <label>
                  Ano
                  <input value={parsedDate ? String(parsedDate.year) : ""} readOnly />
                </label>
              </div>

              <div>
                <label>
                  Status *
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as MovieStatus | "")}
                  >
                    <option value="">Selecione...</option>
                    {MOVIE_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                {showError("status")}
              </div>

              <div>
                <label>
                  Sinopse *
                  <textarea
                    value={synopsis}
                    onChange={(event) => setSynopsis(event.target.value)}
                    maxLength={4000}
                    rows={5}
                  />
                </label>
                {showError("synopsis")}
              </div>

              <div>
                <label>
                  Elenco *
                  <textarea
                    value={castText}
                    onChange={(event) => setCastText(event.target.value)}
                    placeholder="Nomes separados por vírgula"
                    rows={3}
                  />
                </label>
                <p className={styles.hint}>
                  Atores que ainda não existirem no banco serão cadastrados.
                </p>
                {showError("cast")}
              </div>

              <div>
                <label>
                  URL do pôster
                  <input
                    value={posterUrl}
                    onChange={(event) => setPosterUrl(event.target.value)}
                    placeholder="https://..."
                    maxLength={2048}
                  />
                </label>
                {showError("poster")}
              </div>

              <div>
                <label>
                  URL do backdrop
                  <input
                    value={backdropUrl}
                    onChange={(event) => setBackdropUrl(event.target.value)}
                    placeholder="https://..."
                    maxLength={2048}
                  />
                </label>
                {showError("backdrop")}
              </div>
            </div>
          </div>

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
            <button className="btn btn-accent" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateMovieModal;
