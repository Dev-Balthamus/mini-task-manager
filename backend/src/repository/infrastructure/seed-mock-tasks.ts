import { pool } from "./pool.js";

// Task di esempio per l'ambiente di sviluppo
const initialTasks = [
  {
    title: "Inizializzare l'ambiente Docker",
    description: "Configurare PostgreSQL e la rete per il backend Express",
    priority: "high",
    executed: true,
  },
  {
    title: "Implementare la paginazione dell'API",
    description: "Aggiungere i parametri limit e offset nella GET /api/tasks",
    priority: "medium",
    executed: false,
  },
  {
    title: "Scrivere la documentazione OpenAPI/Swagger",
    description: "Documentare gli endpoint e gli schemi degli errori",
    priority: "low",
    executed: false,
  },
  {
    title: "Ottimizzare gli indici del database",
    description: "Valutare indici su priority e executed per query frequenti",
    priority: "high",
    executed: false,
  },
];

async function toSeedMockTasks() {
  console.log("🌱 Avvio del processo di seed del database...");

  try {
    // Si verifica che la tabella esista
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tasks'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.error("❌ La tabella 'tasks' non esiste. Esegui prima le migrazioni con 'npx node-pg-migrate up'.");
      process.exit(1);
    }

    // Si inseriscono i mock tasks (facendo il controllo di idempotenza sul titolo)
    let addedCount = 0;

    for (const task of initialTasks) {
      const result = await pool.query(
        `
        INSERT INTO tasks (title, description, priority, executed)
        SELECT $1::varchar, $2::varchar, $3::task_priority, $4::boolean
        WHERE NOT EXISTS (
          SELECT 1 FROM tasks WHERE title = $1::varchar
        )
        RETURNING id;
        `,
        [task.title, task.description, task.priority, task.executed],
      );

      if (result.rowCount && result.rowCount > 0) {
        addedCount++;
      }
    }

    console.log(`✅ Seed completato con successo! Nuovi task inseriti: ${addedCount}/${initialTasks.length}`);
  } catch (error) {
    console.error("❌ Errore durante il seed del database:", error);
    process.exitCode = 1;
  } finally {
    // Si chiude il pool affinché il processo Node termini pulito
    await pool.end();
  }
}

toSeedMockTasks();
