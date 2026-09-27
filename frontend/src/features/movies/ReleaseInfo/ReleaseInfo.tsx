import type { Company } from "../../../types/company";
import styles from "./ReleaseInfo.module.css";

interface ReleaseInfoProps {
  date: string | null;
  status: string | null;
  companies: Company[];
}

function formatReleaseDate(date: string | null) {
  if (!date) {
    return "Data não informada.";
  }

  const [year, month, day] = date.split("-");
  if (!year || !month || !day) {
    return "Data não informada.";
  }

  return `${day}/${month}/${year}`;
}

function ReleaseInfo({ date, status, companies }: ReleaseInfoProps) {
  return (
    <div className={styles.container}>
      <dl className={styles.metadata}>
        <div>
          <dt>Data de lançamento</dt>
          <dd>{formatReleaseDate(date)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{status ?? "Status não informado."}</dd>
        </div>
      </dl>

      <section>
        <h3 className={styles.title}>Produtoras</h3>
        {companies.length > 0 ? (
          <ul className={styles.companyList}>
            {companies.map((company) => (
              <li key={company.sk_company_id}>{company.nome_produtora}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyState}>Nenhuma produtora associada.</p>
        )}
      </section>
    </div>
  );
}

export default ReleaseInfo;
