import { describe, before, after, test } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import bcrypt from "bcrypt";
import app from "../../src/app.ts";
import { pool } from "../../src/repository/infrastructure/pool.ts";
import { getTestDatabaseUrl } from "../helpers/get-test-db-url.ts";

describe("Verifica Login & Logout API", () => {
  let server: Server;
  let baseUrl: string;

  const testUser = {
    email: "auth.cycle.test@example.com",
    password: "PasswordSuperSicura123!",
  };

  before(async () => {
    // Si allinea la variabile d'ambiente database
    process.env.DATABASE_URL = getTestDatabaseUrl();

    // Si pulisce preventivamente il database per isolare i test
    await pool.query("DELETE FROM users WHERE email = $1", [testUser.email]);

    // Si pre-inseriscono le credenziali di un utente di test
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [testUser.email, hashedPassword]);

    // Si avvia il server Express su porta dinamica
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
    await pool.query("DELETE FROM users WHERE email = $1", [testUser.email]);
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  // =================================
  // LOGIN UTENTE
  // =================================
  test("1. POST /api/auth/login - Credenziali corrette impostano il cookie httpOnly", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    assert.equal(res.status, 200);

    const setCookieHeader = res.headers.get("set-cookie");
    assert.ok(setCookieHeader, "Header Set-Cookie assente");
    assert.ok(setCookieHeader.includes("token="), "Header Cookie deve contenere il token");
    assert.ok(setCookieHeader.includes("HttpOnly"), "Flag HttpOnly mancante");
    assert.ok(setCookieHeader.includes("SameSite=Strict"), "Flag SameSite=Strict mancante");
  });

  test("2. POST /api/auth/login - Messaggio d'errore generico unico (Anti Enumeration)", async () => {
    // Caso A: Email errata
    const resWrongEmail = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "notfound@example.com", password: testUser.password }),
    });

    // Caso B: Password errata
    const resWrongPW = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testUser.email, password: "WrongPassword!" }),
    });

    assert.equal(resWrongEmail.status, 401);
    assert.equal(resWrongPW.status, 401);

    const bodyEmail = await resWrongEmail.json();
    const bodyPass = await resWrongPW.json();

    assert.equal(
      bodyEmail.msg,
      bodyPass.msg,
      "I messaggi d'errore devono essere identici sia per email inesistente sia per password errata",
    );
  });

  // =================================
  // 3. LOGOUT UTENTE
  // =================================
  test("3. POST /api/auth/logout - Invalida e rimuove il cookie di sessione", async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
    });

    assert.equal(res.status, 200);

    const setCookieHeader = res.headers.get("set-cookie");
    assert.ok(setCookieHeader, "Header Set-Cookie assente nella risposta di logout");

    // Verifica che il cookie venga rimosso o resettato con scadenza nel passato
    assert.ok(
      setCookieHeader.includes("token=;") || setCookieHeader.includes("Max-Age=0") || setCookieHeader.includes("1970"),
      "Il cookie deve essere marcato come rimosso/scaduto",
    );
  });
});
