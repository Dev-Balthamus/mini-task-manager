import { MigrationBuilder } from "node-pg-migrate";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirPath = path.join(__dirname, "..", "data");
const fileName = ["tasks", "json"].join(".");
const tasksJSONPath = path.join(dataDirPath, fileName);

// Interfaccia per i task nel file JSON
interface Task {
  id: number;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  executed: boolean;
}

export async function up(pgm: MigrationBuilder): Promise<void> {
  // All'inizio si verifica se il file JSON esista ancora, solo poi si procede
  if (!fs.existsSync(tasksJSONPath)) {
    console.log("ℹ️ Nessun file JSON trovato. Migrazione già eseguita o non necessaria.");
    return;
  }

  console.log("🚀 Inizio migrazione dati da JSON a PostgreSQL...");

  const rawData = fs.readFileSync(tasksJSONPath, "utf8");
  const tasks: Task[] = JSON.parse(rawData);

  if (!Array.isArray(tasks) || tasks.length === 0) {
    console.log("ℹ️ Il file JSON è vuoto o non valido. Nessun dato da migrare.");
    return;
  }

  for (const task of tasks) {
    /*
    Dato che l'ID originale era numerico/Date.now(), ma ora si vogliono gli UUID generati dal database,
    l'inserimento dell'ID viene saltato, lasciando a PostgresSQL generarlo,
    oppure si esegue una conversione controllata.
    */
    const queryText = `
        INSERT INTO tasks (title, description, priority, executed) 
        VALUES ($1, $2, $3, $4)
      `;
    const values = [task.title, task.description, task.priority, task.executed];

    await pgm.db.query(queryText, values);
  }

  console.log(`✅ Migrazione completata con successo! Inseriti ${tasks.length} task.`);

  /*
    Solo se la migrazione dei dati nel vecchio JSON è andata a buon fine,
    si eliminano il file JSON e la directory in cui era salvato
    */
  try {
    // Si rimuove la cartella "data" con tutto ciò che contiene
    fs.rmSync(dataDirPath, { recursive: true, force: true });
    console.log(`🧹 Cartella 'data' e file '${fileName}' rimossi con successo.`);
  } catch (err) {
    console.error("⚠️ Errore durante l'eliminazione della cartella 'data':", err);
  }
}

// 2. La funzione DOWN è richiesta da node-pg-migrate per gestire i rollback
export async function down(pgm: MigrationBuilder): Promise<void> {}
