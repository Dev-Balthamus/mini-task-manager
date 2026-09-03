import { describe, before, after, test } from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { execSync } from "child_process";

describe("Verifica Migrazione Database - Mini Task Manager", () => {
  let pool: Pool;
  let dbUrl: string;

  // Prima di tutti i test, inizializzazione del Pool
  before(() => {
    // Si rileva se il test stia girando in un ambiente CI (GitHub Actions o GitLab CI)
    const isCI = Boolean(process.env.CI || process.env.GITLAB_CI);

    /* 
    Se in CI, si usa direttamente la DATABASE_URL fornita dal runner;
    altrimenti, se in locale, si leggono le variabili PG* del file .env
    */
    const host = process.env.PGHOST || "localhost";
    const port = process.env.PGPORT || "5432";
    const user = process.env.PGUSER || "postgres";
    const password = process.env.PGPASSWORD || "fr4-b4_4PSGLS";
    const database = process.env.PGDATABASE || "mtm_tasks_store_test-l";

    // Si costruisce la stringa del'URL del database puntando all'host corretto
    dbUrl =
      isCI && process.env.DATABASE_URL
        ? process.env.DATABASE_URL
        : `postgres://${user}:${password}@${host}:${port}/${database}`;

    process.env.DATABASE_URL = dbUrl;

    pool = new Pool({
      connectionString: dbUrl,
      max: 3, // Numero limite di client nel contesto dei test, per non sovraccaricare PostgreSQL
    });
    // In ragione del lazy loading del pool, eseguire il `connect()` non è necessario
  });

  // Finiti tutti i test, svuotamento del Pool e chiusura delle connessioni
  after(async () => {
    await pool.end(); // Solo così Node.JS potrà terminare il processo di testing
  });

  test("1. Applicazione dello schema (UP)", async () => {
    console.log("Esecuzione comando di migrazione UP...");

    execSync(`npx node-pg-migrate up --database-url "${dbUrl}"`, { stdio: "inherit" });

    // Interrogazione di PostgreSQL mediante il Pool
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tasks'
      );
    `);

    // Verifica dell'esecuzione della database migration
    assert.equal(result.rows[0].exists, true, "La tabella 'tasks' dovrebbe esistere nel database");
  });

  test("2. Verifica dei vincoli dello schema", async () => {
    // Tentativo di inserimento di un record (task) con attributo `priorità` non valido
    await assert.rejects(
      async () => {
        await pool.query(`
          INSERT INTO tasks (title, priority) 
          VALUES ('Test Task', 'priorita_inventata')
        `);
      },
      (err) => {
        /*
        Verifica che l'errore sia effettivamente legato al tipo ENUM di PostgreSQL
        Si basa sul codice d'errore nativo Postgres (22P02) o sulla presenza di 'task_priority'
        */
        const pgError = err as Error & { code?: string };
        const isEnumError = pgError.code === "22P02" || pgError.message.includes("task_priority");
        return isEnumError;
      },
      "Il database avrebbe dovuto rifiutare una priorità non valida",
    );
  });

  test("3. Rollback dello schema (DOWN)", async () => {
    console.log("Esecuzione comando di migrazione DOWN (2 passi)...");

    execSync(`npx node-pg-migrate down 2 --database-url "${dbUrl}"`, { stdio: "inherit" });

    // Verifica dell'esecuzione del rollback del database
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tasks'
      );
    `);

    assert.equal(result.rows[0].exists, false, "La tabella 'tasks' non dovrebbe più esistere dopo il rollback");
  });
});
