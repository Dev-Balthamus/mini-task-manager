import { describe, before, after, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { pool } from "../../src/repository/infrastructure/pool.ts";
import { up as migrateJSONtoPG } from "../../migrations/1784876179819_migrate-json-to-pg.ts";
import { getTestDatabaseUrl } from "../helpers/get-test-db-url.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..", "..");
const dataDirPath = path.join(projectRoot, "data");
const tasksJSONPath = path.join(dataDirPath, "tasks.json");

// Dati di un paio di task di test
const mockTasks = [
  {
    id: 1784886676,
    title: "Test Task Migration 1",
    description: "Descrizione Test 1",
    priority: "high",
    executed: false,
  },
  {
    id: 1784886708,
    title: "Test Task Migration 2",
    description: "Descrizione Test 2",
    priority: "medium",
    executed: true,
  },
];

const isWindows = process.platform === "win32";
const command = isWindows
  ? `findstr /s /i /m "tasks.json" src\\*`
  : `grep -ri --exclude-dir={node_modules,dist} --exclude="03-data-migration.test.ts" "tasks.json" .`;

describe("Verifica Migrazione Dati - Mini Task Manager", () => {
  before(async () => {
    // 1. Allineamento centralizzato dell'URL del Database
    process.env.DATABASE_URL = getTestDatabaseUrl();

    // In via preventiva si pulisce il database da eventuali vecchi task di test
    await pool.query("DELETE FROM tasks WHERE title LIKE 'Test Task Migration%'");

    // Si creano percorso e file JSON di test
    if (!fs.existsSync(dataDirPath)) {
      fs.mkdirSync(dataDirPath, { recursive: true });
    }
    fs.writeFileSync(tasksJSONPath, JSON.stringify(mockTasks, null, 2), "utf8");
  });

  after(async () => {
    // Dopo il test, pulizia del database e chiusura del Connection Pool
    await pool.query("DELETE FROM tasks WHERE title LIKE 'Test Task Migration%'");
  });

  test("1. Verifica migrazione dati dal file JSON al database PostgreSQL, e successiva eliminazione di cartella `data`", async () => {
    // Si crea un oggetto mock che reindirizza le chiamate `pgm.db.query` verso il nostro `pool`
    const mockPgm = {
      db: {
        query: (queryText: string, values?: any[]) => pool.query(queryText, values),
      },
    } as any;

    // Si invoca la funzione di migrazione passandole l'oggetto mock
    await migrateJSONtoPG(mockPgm);

    /* FASE 01: Verifica di inserimento dati in database */

    const { rows } = await pool.query("SELECT * FROM tasks WHERE title LIKE 'Test Task Migration%' ORDER BY title ASC");

    assert.equal(rows.length, 2, "I task migrati nel DB dovrebbero essere 2");
    assert.equal(rows[0].title, "Test Task Migration 1");
    assert.equal(rows[1].priority, "medium");
    assert.equal(rows[0].executed, false);
    assert.equal(rows[1].executed, true);

    /* FASE 02: Verifica di rimozione dal file system del file JSON e della cartella `data` */

    const fileExists = fs.existsSync(tasksJSONPath);
    const dirExists = fs.existsSync(dataDirPath);

    assert.equal(fileExists, false, "Il file tasks.json deve essere stato eliminato");
    assert.equal(dirExists, false, "La cartella data/ deve essere stata eliminata");
  });

  test("2. Verifica assenza di riferimenti residui al file 'tasks.json' nel codice sorgente", () => {
    try {
      /* Esecuzione automatizzata del comando `grep -ri tasks.json backend/`, 
      specificando di ignorare `node_modules/`, `dist/` e lo script di test stesso */

      const commandOutput = execSync(command, { encoding: "utf8", cwd: path.join(__dirname, "..") }).trim();

      // Se il grep s'imbatte in qualcosa, lancia un'eccezione o restituisce testo
      assert.equal(commandOutput, "", `Trovati riferimenti residui a 'tasks.json':\n${commandOutput}`);
    } catch (error: any) {
      // In bash/Linux, grep restituisce exit code 1 se NON trova niente - che è il comportamento atteso
      if (error.status === 1) {
        assert.ok(true, "Nessun riferimento residuo trovato da grep.");
      } else {
        throw error;
      }
    }
  });
});
