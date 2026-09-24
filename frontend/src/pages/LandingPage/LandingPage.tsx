import { 
  X, Menu, Search, Star, Trash2, Pencil, Plus, Check, Film, 
  Clapperboard, MessageSquare, ArrowLeft,ChevronLeft, ChevronRight, type LucideIcon,
} from "lucide-react";
import styles from "./LandingPage.module.css";

const icons: { name: string; Icon: LucideIcon }[] = [
  { name: "X", Icon: X },
  { name: "Menu", Icon: Menu },
  { name: "Search", Icon: Search },
  { name: "Star", Icon: Star },
  { name: "Trash2", Icon: Trash2 },
  { name: "Pencil", Icon: Pencil },
  { name: "Plus", Icon: Plus },
  { name: "Check", Icon: Check },
  { name: "Film", Icon: Film },
  { name: "Clapperboard", Icon: Clapperboard },
  { name: "MessageSquare", Icon: MessageSquare },
  { name: "ArrowLeft", Icon: ArrowLeft },
  { name: "ChevronLeft", Icon: ChevronLeft },
  { name: "ChevronRight", Icon: ChevronRight },
];

function StarRating({ value }: { value: number }) {
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

function LandingPage() {
  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <span className={styles.brand}>
            <Clapperboard size={26} color="var(--accent)" />
            <h3>Catálogo de Filmes</h3>
          </span>
          <button className="btn-icon" aria-label="Abrir menu">
            <Menu size={24} />
          </button>
        </div>
      </header>

      <main className="container">
        <section className={styles.section}>
          <h1>Ícones do projeto</h1>
          <p className="muted">
            Visualização dos ícones do Lucide com as cores definidas no index.css.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Todos os ícones</h2>
          <div className={styles.grid}>
            {icons.map(({ name, Icon }) => (
              <div key={name} className={`card ${styles.tile}`}>
                <Icon size={28} />
                <span className="muted">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Botões com ícone</h2>
          <div className={styles.row}>
            <button className="btn btn-accent">
              <Plus size={18} /> Novo filme
            </button>
            <button className="btn">
              <Pencil size={18} /> Editar
            </button>
            <button className="btn btn-danger">
              <Trash2 size={18} /> Remover
            </button>
            <button className="btn btn-ghost">
              <ArrowLeft size={18} /> Voltar
            </button>
            <button className="btn-icon" aria-label="Fechar">
              <X size={22} />
            </button>
            <button className="btn-icon" aria-label="Editar">
              <Pencil size={20} />
            </button>
            <button className="btn-icon" aria-label="Remover">
              <Trash2 size={20} />
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Barra de busca</h2>
          <div className={styles.search}>
            <Search size={18} className={styles.searchIcon} />
            <input type="search" placeholder="Buscar filmes..." />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Avaliação</h2>
          <div className={styles.column}>
            <StarRating value={5} />
            <StarRating value={3} />
            <StarRating value={1} />
          </div>
        </section>

        <section className={styles.section}>
          <h2>Paginação</h2>
          <div className="pagination">
            <button className="btn btn-ghost" aria-label="Página anterior">
              <ChevronLeft size={18} />
            </button>
            <span>Página 1 de 5</span>
            <button className="btn btn-ghost" aria-label="Próxima página">
              <ChevronRight size={18} />
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Tamanhos</h2>
          <div className={styles.row}>
            {[16, 20, 24, 32, 48].map((size) => (
              <div key={size} className={styles.size}>
                <Film size={size} color="var(--primary-hover)" />
                <span className="muted">{size}px</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

export default LandingPage;