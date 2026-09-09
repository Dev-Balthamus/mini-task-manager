export function getTestDatabaseUrl(): string {
  // 1. Single Source of Truth: se DATABASE_URL è presente (da .env o da CI), viene usata direttamente
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // 2. Se DATABASE_URL è assente, viene costruita dinamicamente solo da process.env
  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE;

  if (!user || !database) {
    throw new Error(
      "Configurazione database di test incompleta: definire DATABASE_URL oppure le singole variabili d'ambiente.",
    );
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = password ? `:${encodeURIComponent(password)}` : "";

  return `postgres://${encodedUser}${encodedPassword}@${host}:${port}/${database}`;
}
