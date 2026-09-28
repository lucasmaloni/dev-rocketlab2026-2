import { useState } from "react";
import { ArrowLeft, Eye, Trash, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import PosterFrame from "../../components/PosterFrame/PosterFrame";
import StarRating from "../../components/StarRating/StarRating";
import DeleteMovieModal from "../../features/movies/DeleteMovieModal/DeleteMovieModal";
import DirectorList from "../../features/movies/DirectorList/DirectorList";
import MovieEditModal from "../../features/movies/MovieEditModal/MovieEditModal";
import ReleaseInfo from "../../features/movies/ReleaseInfo/ReleaseInfo";
import { useMovieDetails } from "../../features/movies/useMovieDetails";
import ReviewList from "../../features/movies/ReviewList/ReviewList";
import ReviewModal from "../../features/movies/ReviewModal/ReviewModal";
import styles from "./MoviePage.module.css";

type TabType = "cast" | "crew" | "details" | "genres" | "releases" | "reviews";

const MOCK_USERS = [
  "Shinji Ikari", "Rei Ayanami", "Asuka Langley", "Misato Katsuragi", "Gendo Ikari", 
  "Ritsuko Akagi", "Kaworu Nagisa", "Toji Suzuhara", "Kensuke Aida", "Pen Pen",
];

export default function MoviePage() {
  const { skMovieId } = useParams<{ skMovieId: string }>();
  const navigate = useNavigate();
  const {
    movie, performance,
    genres, cast,
    crew, reviews,
    companies, reviewsSummary,
    isLoading, error, refetch,
  } = useMovieDetails(skMovieId);

  const [activeTab, setActiveTab] = useState<TabType>("cast");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewUser, setReviewUser] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const rating = performance?.nota_tmdb ?? performance?.nota_imdb;
  const ratingOutOfFive = rating !== null && rating !== undefined ? rating / 2 : null;
  const directors = crew.filter((person) => person.tipo_pessoa === "Diretor");

  const openReviewModal = () => {
    const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    setReviewUser(randomUser);
    setIsReviewModalOpen(true);
  };

  const movieDetails = movie
    ? {
        movie,
        performance,
        genres,
        cast,
        crew,
        reviews,
        companies,
        reviews_summary: reviewsSummary,
      }
    : null;
  
  const formatCurrency = (value: number | null | undefined) =>
    value === null || value === undefined
      ? "Não informado"
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(value);

  const tabs: { id: TabType; label: string }[] = [
    { id: "cast", label: "Elenco" },
    { id: "crew", label: "Equipe" },
    { id: "details", label: "Detalhes" },
    { id: "genres", label: "Gêneros" },
    { id: "releases", label: "Lançamento" },
    { id: "reviews", label: "Avaliações" },
  ];

  return (
    <div className={styles.pageContainer}>
      {movie?.backdrop_url && (
        <div className={styles.backdropWrapper} aria-hidden="true">
          <div 
            className={styles.backdropImage} 
            style={{ backgroundImage: `url(${movie.backdrop_url})` }}
          />
        </div>
      )}

      <header className={styles.header}>
        <button 
          className="btn-icon" 
          aria-label="Voltar ao catálogo" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={22} />
        </button>
        <div className={styles.actions}>
          <button 
            className="btn-icon"
            type="button"
            aria-label="Registrar avaliação de filme"
            onClick={openReviewModal}
          >
            <Eye size={22} className={styles.iconView} />
          </button>

          <button
            className="btn-icon"
            type="button"
            aria-label="Editar filme cadastrado"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pencil size={22} className={styles.iconEdit} />
          </button>

          <button
            className="btn-icon"
            type="button"
            aria-label="Excluir filme cadastrado"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash size={22} className={styles.iconDelete} />
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
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
          <>
            <aside className={styles.posterCol}>
              <PosterFrame src={movie.poster_url ?? ""} alt={`Pôster de ${movie.titulo}`} size={230} />
            </aside>

            <section className={styles.infoCol}>
              <div className={styles.titleGroup}>
                <h1 className={styles.title}>{movie.titulo}</h1>
                <div className={styles.meta}>
                  {movie.ano_lancamento && (
                    <a href="#" className={styles.metaYear}>{movie.ano_lancamento}</a>
                  )}
                  {movie.status_filme && <span>{movie.status_filme}</span>}
                </div>
                <div className={styles.directorLine}>
                  <DirectorList directors={directors} />
                </div>
              </div>

              <div className={styles.ratingBlock}>
                {ratingOutOfFive !== null ? (
                  <>
                    <StarRating value={ratingOutOfFive} />
                    <span className={styles.ratingNumber}>{ratingOutOfFive.toFixed(1)}</span>
                  </>
                ) : (
                  <span className="muted">Sem avaliações</span>
                )}
              </div>

              <p className={styles.synopsis}>{movie.sinopse ?? "Sinopse não informada."}</p>

              <div className={styles.tabsContainer}>
                <div className={styles.tabList} role="tablist">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className={styles.tabContent} role="tabpanel">
                  {activeTab === "cast" && (
                    cast.length > 0 ? (
                      <ul className={styles.peopleList}>
                        {cast.map((person) => (
                          <li key={person.sk_person_id} className={styles.personItem}>
                            <strong>{person.nome_pessoa}</strong>
                            <span>{person.tipo_pessoa}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.emptyState}>Nenhum ator associado a este filme.</p>
                    )
                  )}
                  
                  {activeTab === "crew" && (
                    crew.length > 0 ? (
                      <ul className={styles.peopleList}>
                        {crew.map((person) => (
                          <li key={person.sk_person_id} className={styles.personItem}>
                            <strong>{person.nome_pessoa}</strong>
                            <span>{person.tipo_pessoa}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={styles.emptyState}>Nenhum membro da equipe associado a este filme.</p>
                    )
                  )}

                  {activeTab === "releases" && (
                    <ReleaseInfo
                      date={movie.data_lancamento}
                      status={movie.status_filme}
                      companies={companies}
                    />
                  )}

                  {activeTab === "reviews" && (
                    reviews.length > 0 && reviewsSummary ? (
                      <div className={styles.reviewsContent}>
                        <div className={styles.userRatingSummary}>
                          <span>Avaliação dos usuários</span>
                          <div className={styles.userRatingValue}>
                            {reviewsSummary.nota_media_usuarios !== null ? (
                              <>
                                <StarRating value={reviewsSummary.nota_media_usuarios / 2} />
                                <strong>{(reviewsSummary.nota_media_usuarios / 2).toFixed(1)} / 5</strong>
                              </>
                            ) : (
                              <strong>Sem média</strong>
                            )}
                            <span>
                              {reviewsSummary.qtd_avaliacoes_usuarios} avaliação(ões)
                            </span>
                          </div>
                        </div>
                        <ReviewList reviews={reviews} />
                      </div>
                    ) : (
                      <p className={styles.emptyState}>Sem avaliações</p>
                    )
                  )}

                  {activeTab === "genres" && (
                    <div className={styles.tagList}>
                      {genres.length > 0 ? (
                        genres.map((genre) => (
                          <span key={genre.name} className={styles.tag}>{genre.name}</span>
                        ))
                      ) : (
                        <p className={styles.emptyState}>Nenhum gênero catalogado.</p>
                      )}
                    </div>
                  )}

                  {activeTab === "details" && performance ? (
                    <dl className={styles.metricsGrid}>
                      <div className={styles.metricCard}>
                        <dt>Popularidade</dt>
                        <dd>{performance.popularidade ?? "N/A"}</dd>
                      </div>
                      <div className={styles.metricCard}>
                        <dt>Orçamento</dt>
                        <dd>{formatCurrency(performance.orcamento_brl)}</dd>
                      </div>
                      <div className={styles.metricCard}>
                        <dt>Receita</dt>
                        <dd>{formatCurrency(performance.receita_brl)}</dd>
                      </div>
                      <div className={styles.metricCard}>
                        <dt>Lucro</dt>
                        <dd>{formatCurrency(performance.lucro_brl)}</dd>
                      </div>
                    </dl>
                  ) : activeTab === "details" && !performance ? (
                    <p className={styles.emptyState}>Dados de desempenho financeiro não informados.</p>
                  ): null }
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className={styles.feedback} role="alert">
            <p>Não foi possível identificar o filme.</p>
          </div>
        )}
      </main>
      {isReviewModalOpen && skMovieId && (
        <ReviewModal
          key={reviewUser}
          skMovieId={skMovieId}
          initialUser={reviewUser}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
      {isEditModalOpen && movieDetails && (
        <MovieEditModal
          movieDetails={movieDetails}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
      {isDeleteModalOpen && movie && (
        <DeleteMovieModal
          skMovieId={movie.sk_movie_id}
          movieTitle={movie.titulo}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}