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

const SEED_USER_EMAIL = "seed.user@example.com";
// Password fittizia già sottoposta ad hash con bcrypt per ambiente dev/mock
const MOCK_HASHED_PASSWORD = "$2b$10$e.I6SgT4W0QY5vO.1z/1e.6WzUvL3yL2f2o5S1/4zV5K.M1N1t!s";

async function toSeedMockTasks() {
  console.log("🌱 Avvio del processo di seed del database...");

  try {
    // Si verifica che esistano le tabelle necessarie
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('tasks', 'users');
    `);

    if (tablesCheck.rows.length < 2) {
      console.error("❌ Le tabelle 'tasks' o 'users' non esistono. Esegui prima le migrazioni con 'npm run m-up'.");
      process.exit(1);
    }

    // Si recupera o crea l'utente dedicato ai dati di seed
    let seedUserId: string;

    const userRes = await pool.query("SELECT id FROM users WHERE email = $1", [SEED_USER_EMAIL]);

    if (userRes.rows.length > 0) {
      seedUserId = userRes.rows[0].id;
    } else {
      const newUserRes = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id", [
        SEED_USER_EMAIL,
        MOCK_HASHED_PASSWORD,
      ]);
      seedUserId = newUserRes.rows[0].id;
      console.log(`👤 Creato utente di seed: ${SEED_USER_EMAIL}`);
    }

    // Si inseriscono i mock tasks (facendo il controllo di idempotenza sul titolo)
    let addedCount = 0;

    for (const task of initialTasks) {
      const result = await pool.query(
        `
        INSERT INTO tasks (title, description, priority, executed, user_id)
        SELECT $1::varchar, $2::varchar, $3::task_priority, $4::boolean, $5::uuid
        WHERE NOT EXISTS (
          SELECT 1 FROM tasks WHERE title = $1::varchar AND user_id = $5::uuid
        )
        RETURNING id;
        `,
        [task.title, task.description, task.priority, task.executed, seedUserId],
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
