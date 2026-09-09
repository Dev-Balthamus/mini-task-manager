import { describe, before, after, test } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import bcrypt from "bcrypt";
import app from "../../src/app.ts";
import { pool } from "../../src/repository/infrastructure/pool.ts";
import { getTestDatabaseUrl } from "../helpers/get-test-db-url.ts";

describe("Verifica Tabella Users e Autenticazione - Mini Task Manager", () => {
  let server: Server;
  let baseUrl: string;

  const mockUser = {
    email: "test.dev@example.com",
    password: "PasswordSicura123!",
  };

  before(async () => {
    // In primis si allineano le variabili d'ambiente per il pool
    process.env.DATABASE_URL = getTestDatabaseUrl();

    // Pulizia preventiva della tabella users per isolare i test
    await pool.query("DELETE FROM users WHERE email = $1", [mockUser.email]);

    // Avvio del server Express su porta dinamica
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === "object") {
          baseUrl = `http://localhost:${address.port}`;
        }
        resolve();
      });
    });
  });

  after(async () => {
    // Pulizia finale del database e chiusura del server Express
    await pool.query("DELETE FROM users WHERE email = $1", [mockUser.email]);
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  test("1. Verifica struttura tabella 'users' nel database", async () => {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users';
    `);

    const columns = result.rows.map((row) => row.column_name);

    assert.ok(columns.includes("id"), "La colonna 'id' deve esistere");
    assert.ok(columns.includes("email"), "La colonna 'email' deve esistere");
    assert.ok(columns.includes("password"), "La colonna 'password' deve esistere");
    assert.ok(columns.includes("created_at"), "La colonna 'created_at' deve esistere");
    assert.ok(columns.includes("updated_at"), "La colonna 'updated_at' deve esistere");
  });

  test("2. Registrazione di nuovo utente e verifica hashing della password", async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockUser),
    });

    assert.equal(res.status, 201, "La registrazione dovrebbe restituire HTTP 201");

    // Si interroga direttamente la tabella 'users' per verificare la persistenza
    const dbResult = await pool.query("SELECT id, email, password FROM users WHERE email = $1", [mockUser.email]);

    assert.equal(dbResult.rows.length, 1, "L'utente deve essere presente in database");

    const dbUser = dbResult.rows[0];
    assert.equal(dbUser.email, mockUser.email);

    // Verifica che la password salvata è un hash e non è in chiaro
    assert.notEqual(dbUser.password, mockUser.password, "La password NON deve essere in chiaro");

    // Verifica che l'hash sia davvero valido tramite bcrypt
    const isValidHash = await bcrypt.compare(mockUser.password, dbUser.password);
    assert.ok(isValidHash, "L'hash salvato a DB deve corrispondere alla password in chiaro");
  });

  test("3. Verifica vincolo Unique sulla colonna email (Rifiuto di duplicati)", async () => {
    // Si tenta di registrare lo stesso utente una seconda volta
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockUser),
    });

    // Verifica che l'endpoint gestisca il vincolo unique di PostgreSQL e risponda 400 o 409
    assert.ok(
      res.status === 400 || res.status === 409,
      `Ci si aspettava status 400 o 409 per email duplicata, ottenuto: ${res.status}`,
    );
  });
});
