// backend/tests/database.test.js
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { execSync } from "child_process";

describe("Verifica Migrazione Database - Mini Task Manager", () => {
  let pool: Pool;
  let dbUrl: string;

  // Prima di tutti i test, inizializzazione del Pool
  before(() => {
    // Per lo `host`: se il test viene svolto GitLab CI si usa PGHOST, altrimenti si forza 'localhost' per eseguire il test in locale su PC
    const isCI = process.env.CI || process.env.GITLAB_CI;
    const host = isCI ? process.env.PGHOST || "postgres_db" : "localhost";

    const port = process.env.PGPORT || process.env.DB_PORT || "5432";
    const user = process.env.PGUSER || process.env.DB_USER || "postgres";
    const password = process.env.PGPASSWORD || process.env.DB_PASSWORD || "fr4-b4_4PSGLS";
    const database = process.env.PGDATABASE || process.env.DB_NAME || "mtm_tasks_store";

    // Si costruisce la stringa del'URL del database puntando all'host corretto
    dbUrl =
      process.env.DATABASE_URL && isCI
        ? process.env.DATABASE_URL
        : `postgres://${user}:${password}@${host}:${port}/${database}`;

    process.env.DATABASE_URL = dbUrl;

    // Si usano le variabili d'ambiente reali del file .env
    pool = new Pool({
      host,
      port: parseInt(port, 10),
      user,
      password,
      database,
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
    console.log("Esecuzione comando di migrazione DOWN...");

    execSync(`npx node-pg-migrate down --database-url "${dbUrl}"`, { stdio: "inherit" });

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
