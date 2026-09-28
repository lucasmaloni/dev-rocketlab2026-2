import type { Person } from "../../../types/person";
import styles from "./DirectorList.module.css";

interface DirectorListProps {
  directors: Person[];
}

function DirectorList({ directors }: DirectorListProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>Direção</span>
      <strong className={styles.names}>
        {directors.length > 0
          ? directors.map((director) => director.nome_pessoa).join(", ")
          : "Dados indisponíveis"}
      </strong>
    </div>
  );
}

export default DirectorList;
