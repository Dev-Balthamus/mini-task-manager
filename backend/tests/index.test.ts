import { after, before } from "node:test";
import { pool } from "../src/repository/infrastructure/pool.ts";
import { execSync } from "node:child_process";

before(async () => {
  const { rows } = await pool.query(`
    SELECT
      current_database() AS db_name,
      current_user AS db_user,
      inet_server_port() AS server_port,
      inet_server_addr() AS server_ip;
  `);

  console.log("\n🔍 IDENTITÀ SERVER TARGET EFFETTIVO:", rows[0], "\n");
});

// Import dei casi di test in sequenza
import "./cases/db-migration.test.ts";
import "./cases/api-and-pool.test.ts";
import "./cases/data-migration.test.ts";
import "./cases/users-db-update-api-registration.test.ts";
import "./cases/login-logout-api.test.ts";
import "./cases/tenant-isolation.test.ts";

after(async () => {
  // Si chiude il Connection Pool alla fine di tutti i test
  await pool.end();

  // Si esegue lo script di seed via cli
  console.log("\n🌱 Esecuzione automatica del seed post-test...");
  try {
    execSync("npm run seed", { stdio: "inherit" });
  } catch (err) {
    console.error("❌ Errore durante l'esecuzione del seed automatizzato:", err);
  }
});
