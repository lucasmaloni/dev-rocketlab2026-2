import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import PosterFrame from "../../components/PosterFrame/PosterFrame";
import StarRating from "../../components/StarRating/StarRating";
import { useMovieDetails } from "../../features/movies/useMovieDetails";
import styles from "./MoviePage.module.css";

export default function MoviePage() {
  const { skMovieId } = useParams<{ skMovieId: string }>();
  const navigate = useNavigate();
  const { movie, performance, genres, isLoading, error, refetch } = useMovieDetails(skMovieId);

  const rating = performance?.nota_tmdb ?? performance?.nota_imdb;
  const ratingOutOfFive = rating !== null && rating !== undefined ? rating / 2 : null;
  const formatCurrency = (value: number | null | undefined) =>
    value === null || value === undefined
      ? "Não informado"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(value);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <button className="btn-icon" aria-label="Voltar ao catálogo" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <button className={styles.menuButton} aria-label="Abrir menu principal">
          <Menu size={24} />
        </button>
      </header>

      <main className={`container ${styles.mainContent}`}>
        {isLoading ? (
          <div className={styles.feedback} role="status">
            <p>Carregando detalhes...</p>
          </div>
        ) : error ? (
          <div className={styles.feedback} role="alert">
            <p>{error}</p>
            <button className="btn" onClick={() => refetch()}>
              Tentar novamente
            </button>
          </div>
        ) : movie ? (
          <article className={styles.movieDetails}>
            <div
              className={styles.backdrop}
              style={movie.backdrop_url ? { backgroundImage: `url(${movie.backdrop_url})` } : undefined}
              aria-hidden="true"
            />

            <div className={styles.content}>
              <PosterFrame src={movie.poster_url ?? ""} alt={`Pôster de ${movie.titulo}`} size={260} />

              <section className={styles.summary}>
                <p className={styles.eyebrow}>Detalhes do filme</p>
                <h1>{movie.titulo}</h1>
                <div className={styles.meta}>
                  <span>ID: {movie.id}</span>
                  {movie.ano_lancamento && <span>{movie.ano_lancamento}</span>}
                  {movie.status_filme && <span>{movie.status_filme}</span>}
                </div>

                {genres.length > 0 ? (
                  <div className={styles.genres} aria-label="Gêneros">
                    {genres.map((genre) => <span key={genre.name}>{genre.name}</span>)}
                  </div>
                ) : (
                  <p className="muted">Gêneros não informados.</p>
                )}

                <div className={styles.rating}>
                  {ratingOutOfFive !== null ? (
                    <>
                      <StarRating value={ratingOutOfFive} />
                      <span>{ratingOutOfFive.toFixed(1)} / 5</span>
                    </>
                  ) : (
                    <span className="muted">Nota não informada.</span>
                  )}
                </div>

                <p className={styles.synopsis}>{movie.sinopse ?? "Sinopse não informada."}</p>
              </section>
            </div>

            <section className={styles.performance} aria-labelledby="performance-title">
              <h2 id="performance-title">Desempenho</h2>
              {performance ? (
                <dl className={styles.metrics}>
                  <div><dt>Popularidade</dt><dd>{performance.popularidade ?? "Não informado"}</dd></div>
                  <div><dt>Orçamento</dt><dd>{formatCurrency(performance.orcamento_brl)}</dd></div>
                  <div><dt>Receita</dt><dd>{formatCurrency(performance.receita_brl)}</dd></div>
                  <div><dt>Avaliações TMDB</dt><dd>{performance.qtd_tmdb ?? "Não informado"}</dd></div>
                  <div><dt>Avaliações IMDb</dt><dd>{performance.qtd_imdb ?? "Não informado"}</dd></div>
                </dl>
              ) : (
                <p className="muted">Dados de desempenho não informados.</p>
              )}
            </section>
          </article>
        ) : (
          <div className={styles.feedback} role="alert">
            <p>Não foi possível identificar o filme.</p>
          </div>
        )}
      </main>
    </div>
  );
}