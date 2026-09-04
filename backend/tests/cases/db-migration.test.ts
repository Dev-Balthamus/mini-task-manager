import { describe, before, after, test } from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import { execSync } from "child_process";
import { getTestDatabaseUrl } from "../helpers/get-test-db-url.ts";

describe("Verifica Migrazione Database - Mini Task Manager", () => {
  let pool: Pool;
  let dbUrl: string;

  // Helper per eseguire node-pg-migrate ereditando process.env ed esplicitando la dbUrl
  const runMigrate = (action: string) => {
    execSync(`npx node-pg-migrate ${action} -m migrations --import ts-node/esm --database-url "${dbUrl}"`, {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: dbUrl }, // Garantisce l'allineamento perfetto delle variabili d'ambiente!
    });
  };

  // Prima di tutti i test, inizializzazione del Pool
  before(async () => {
    // Risoluzione centralizzata dell'URL (Gestisce i 3 scenari: Docker, CI, Localhost)
    dbUrl = getTestDatabaseUrl();
    process.env.DATABASE_URL = dbUrl;

    // Single Source of Truth: si passa direttamente la connectionString al Pool
    pool = new Pool({
      connectionString: dbUrl,
      max: 3, // Numero limite di client nel contesto dei test, per non sovraccaricare PostgreSQL
    });
    // In ragione del lazy loading del pool, eseguire il `connect()` non è necessario

    // Si pulisce totalmente il database target effetivo prima del test
    await pool.query("DROP TABLE IF EXISTS users, tasks, pgmigrations CASCADE;");
    await pool.query("DROP TYPE IF EXISTS task_priority CASCADE;");
  });

  // Finiti tutti i test, svuotamento del Pool e chiusura delle connessioni
  after(async () => {
    // Si ri-eseguono tutte le migrazioni sul database corretto prima di passare ai test successivi
    runMigrate("up");
  });

  test("1. Applicazione dello schema (UP di 1 passo)", async () => {
    console.log("Esecuzione comando di migrazione UP...");

    runMigrate("up 1");

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

  test("3. Rollback dello schema (DOWN di 1 passo)", async () => {
    console.log("Esecuzione comando di migrazione DOWN...");
    runMigrate("down 1");

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
