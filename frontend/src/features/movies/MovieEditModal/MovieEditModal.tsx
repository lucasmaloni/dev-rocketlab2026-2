import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { getGenres } from "../../../api/movies";
import type { MovieDetails } from "../../../types/movieDetail";
import type { MovieUpdatePayload } from "../../../types/movieUpdate";
import { useUpdateMovie } from "../useUpdateMovie";
import styles from "./MovieEditModal.module.css";

type EditTab = "general" | "genres" | "performance";

interface MovieEditModalProps {
  movieDetails: MovieDetails;
  onClose: () => void;
}

function MovieEditModal({ movieDetails, onClose }: MovieEditModalProps) {
  const { movie, genres: currentGenres, performance } = movieDetails;
  const [activeTab, setActiveTab] = useState<EditTab>("general");
  const [title, setTitle] = useState(movie.titulo);
  const [releaseDate, setReleaseDate] = useState(movie.data_lancamento ?? "");
  const [status, setStatus] = useState(movie.status_filme ?? "");
  const [synopsis, setSynopsis] = useState(movie.sinopse ?? "");
  const [genreIds, setGenreIds] = useState<string[]>([]);

  const genresQuery = useQuery({ queryKey: ["genres"], queryFn: ({ signal }) => getGenres(signal) });
  const mutation = useUpdateMovie(movie.sk_movie_id, onClose);

  const formatCurrency = (value: number | null) =>
    value === null
      ? "Não informado"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(value);

  const formatValue = (value: number | null) => value ?? "Não informado";

  const currentGenreIds = new Set(currentGenres.map((genre) => genre.sk_genre_id));
  const toggleId = (setter: (value: string[] | ((current: string[]) => string[])) => void, id: string) => {
    setter((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !releaseDate) return;

    const payload: MovieUpdatePayload = {
      titulo: title.trim(),
      data_lancamento: releaseDate,
      status_filme: status.trim() || null,
      sinopse: synopsis.trim() || null,
      genre_ids_to_add: genreIds,
    };
    mutation.mutate(payload);
  };

  const tabs: { id: EditTab; label: string }[] = [
    { id: "general", label: "Geral" },
    { id: "genres", label: "Gêneros" },
    { id: "performance", label: "Performance" },
  ];

  const catalogError = genresQuery.error;

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={onClose}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-movie-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <h2 id="edit-movie-title">Editar filme</h2>
          <button className="btn-icon" type="button" aria-label="Fechar" onClick={onClose}><X size={20} /></button>
        </header>

        <div className={styles.tabList} role="tablist">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? styles.activeTab : ""} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {activeTab === "general" && (
            <div className={styles.fields}>
              <label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={500} required /></label>
              <label>Data de lançamento<input type="date" value={releaseDate} onChange={(event) => setReleaseDate(event.target.value)} required /></label>
              <label>Ano de lançamento<input value={releaseDate ? releaseDate.slice(0, 4) : ""} readOnly /></label>
              <label>Status<input value={status} onChange={(event) => setStatus(event.target.value)} maxLength={50} /></label>
              <label>Sinopse<textarea value={synopsis} onChange={(event) => setSynopsis(event.target.value)} maxLength={4000} rows={6} /></label>
            </div>
          )}

          {activeTab === "genres" && (
            <section className={styles.selectionSection}>
              <p className={styles.hint}>Gêneros atuais não podem ser removidos.</p>
              <div className={styles.currentList}>{currentGenres.map((genre) => <span key={genre.sk_genre_id}>{genre.name}</span>)}</div>
              {genresQuery.isLoading ? <p>Carregando gêneros...</p> : <div className={styles.options}>{genresQuery.data?.filter((genre) => !currentGenreIds.has(genre.sk_genre_id)).map((genre) => <label key={genre.sk_genre_id}><input type="checkbox" checked={genreIds.includes(genre.sk_genre_id)} onChange={() => toggleId(setGenreIds, genre.sk_genre_id)} />{genre.name}</label>)}</div>}
            </section>
          )}

          {activeTab === "performance" && (
            <section className={styles.selectionSection}>
              <p className={styles.hint}>Performance é somente leitura nesta edição.</p>
              {performance ? (
                <div className={styles.performanceGrid}>
                  <div className={styles.performanceGroup}>
                    <h3>Financeiro</h3>
                    <dl className={styles.metricList}>
                      <div><dt>Orçamento (USD)</dt><dd>{formatCurrency(performance.orcamento_usd)}</dd></div>
                      <div><dt>Receita (USD)</dt><dd>{formatCurrency(performance.receita_usd)}</dd></div>
                      <div><dt>Orçamento (BRL)</dt><dd>{formatCurrency(performance.orcamento_brl)}</dd></div>
                      <div><dt>Receita (BRL)</dt><dd>{formatCurrency(performance.receita_brl)}</dd></div>
                      <div><dt>Lucro (BRL)</dt><dd>{formatCurrency(performance.lucro_brl)}</dd></div>
                    </dl>
                  </div>
                  <div className={styles.performanceGroup}>
                    <h3>Popularidade</h3>
                    <dl className={styles.metricList}>
                      <div><dt>Índice</dt><dd>{formatValue(performance.popularidade)}</dd></div>
                    </dl>
                  </div>
                  <div className={styles.performanceGroup}>
                    <h3>Avaliações externas</h3>
                    <dl className={styles.metricList}>
                      <div><dt>Nota TMDB</dt><dd>{formatValue(performance.nota_tmdb)}</dd></div>
                      <div><dt>Votos TMDB</dt><dd>{formatValue(performance.qtd_tmdb)}</dd></div>
                      <div><dt>Nota IMDb</dt><dd>{formatValue(performance.nota_imdb)}</dd></div>
                      <div><dt>Votos IMDb</dt><dd>{formatValue(performance.qtd_imdb)}</dd></div>
                    </dl>
                  </div>
                </div>
              ) : (
                <p className={styles.emptyState}>Performance não informada.</p>
              )}
            </section>
          )}

          {catalogError && <p className={styles.error}>Não foi possível carregar os catálogos de edição.</p>}
          {mutation.error && <p className={styles.error}>{mutation.error.message}</p>}
          <div className={styles.actions}>
            <button className="btn btn-ghost" type="button" onClick={onClose}>Cancelar</button>
            <button className="btn btn-accent" type="submit" disabled={mutation.isPending || !title.trim() || !releaseDate}>{mutation.isPending ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default MovieEditModal;
