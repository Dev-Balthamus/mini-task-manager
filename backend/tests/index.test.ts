import { after } from "node:test";
import { pool } from "../src/repository/infrastructure/pool.ts";

// Import dei casi di test in sequenza
import "./cases/db-migration.test.ts";
import "./cases/api-and-pool.test.ts";
import "./cases/data-migration.test.ts";
import "./cases/users-db-update-api-registration.test.ts";

// Chiusura del Connection Pool alla fine di tutti i test
after(async () => {
  await pool.end();
});
