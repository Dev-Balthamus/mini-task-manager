export function getTestDatabaseUrl(): string {
  const isCI = Boolean(process.env.CI || process.env.GITLAB_CI);

  // In ambiente CI (GitHub Actions o GitLab-CI), la DATABASE_URL è già fornita e pronta all'uso
  if (isCI && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  /*
  In locale si dà priorità al blocco PG* del file .env (PostgreSQL nativo su host),
  isolando i test dal container Docker Compose (DB_*)
  */
  const host = process.env.PGHOST || "localhost";
  const port = process.env.PGPORT || "5432";
  const user = process.env.PGUSER || "postgres";
  const password = process.env.PGPASSWORD || "fr4-b4_4PSGLS";
  const database = process.env.PGDATABASE || "mtm_tasks_store_test-l";

  return `postgres://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}
