import { describe, before, after, test } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import app from "../../src/app.ts";
import { pool } from "../../src/repository/infrastructure/pool.ts";
import { getTestDatabaseUrl } from "../helpers/get-test-db-url.ts";

describe("Verifica Isolamento Tenant: Permessi Utente A vs Utente B", () => {
  let server: Server;
  let baseUrl: string;
  let cookieUserA: string;
  let cookieUserB: string;
  let taskUserAId: string;

  const userA = { email: "tenant.user.a@example.com", password: "SuperAPassword123!" };
  const userB = { email: "tenant.user.b@example.com", password: "SuperBPassword987!" };

  before(async () => {
    process.env.DATABASE_URL = getTestDatabaseUrl();

    // Pulizia preventiva dei dati dei due utenti
    await pool.query("DELETE FROM users WHERE email IN ($1, $2)", [userA.email, userB.email]);

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

    // Registrazione e Login Utente A
    await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userA),
    });

    const resLoginA = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userA),
    });

    cookieUserA = resLoginA.headers.get("set-cookie") || "";

    // Registrazione e Login Utente B
    await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userB),
    });

    const resLoginB = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userB),
    });

    cookieUserB = resLoginB.headers.get("set-cookie") || "";
  });

  after(async () => {
    // Pulizia finale del database e chiusura del server Express
    await pool.query("DELETE FROM users WHERE email IN ($1, $2)", [userA.email, userB.email]);
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  // ==================================================================
  // PRE TEST: Utente A crea un task
  // ==================================================================

  test("1. Rifiuto con 401 se si accede ai task senza cookie", async () => {
    const res = await fetch(`${baseUrl}/api/tasks`);

    assert.equal(res.status, 401);
  });

  test("2. Utente A crea un task con successo", async () => {
    const res = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieUserA,
      },
      body: JSON.stringify({
        title: "Task Privato dell'Utente A",
        priority: "high",
        executed: false,
      }),
    });

    assert.equal(res.status, 201, "Il task di Utente A deve essere creato (201)");
    const body = await res.json();

    assert.ok(body.task?.id, "Il task creato deve contenere un ID");
    taskUserAId = body.task.id;
  });

  // ==================================================================
  // CORE TEST: Utente B prova Lettura, Modifica e Cancellazione
  // ==================================================================

  test("3. Utente B prova a LEGGERE il task di Utente A -> Fallisce con 404", async () => {
    const res = await fetch(`${baseUrl}/api/tasks/${taskUserAId}`, {
      method: "GET",
      headers: { Cookie: cookieUserB },
    });

    assert.equal(res.status, 404, "Utente B non deve poter leggere il task di Utente A e deve ricevere 404");
  });

  test("4. Utente B prova a MODIFICARE il task di Utente A -> Fallisce con 404", async () => {
    const res = await fetch(`${baseUrl}/api/tasks/${taskUserAId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieUserB,
      },
      body: JSON.stringify({
        title: "Tentativo di Hack da Utente B",
        executed: true,
      }),
    });

    assert.equal(res.status, 404, "Utente B non deve poter aggiornare il task di Utente A e deve ricevere 404");

    // Si controlla che il task di Utente A sia rimasto inalterato nel database
    const checkRes = await fetch(`${baseUrl}/api/tasks/${taskUserAId}`, {
      method: "GET",
      headers: { Cookie: cookieUserA },
    });

    const checkBody = await checkRes.json();

    assert.equal(checkBody.task.title, "Task Privato dell'Utente A", "Il titolo originale non deve essere cambiato");
    assert.equal(checkBody.task.executed, false, "Lo stato executed originale non deve essere cambiato");
  });

  test("5. Utente B prova a CANCELLARE il task di Utente A -> Fallisce con 404", async () => {
    const res = await fetch(`${baseUrl}/api/tasks/${taskUserAId}`, {
      method: "DELETE",
      headers: { Cookie: cookieUserB },
    });

    assert.equal(res.status, 404, "Utente B non deve poter cancellare il task di Utente A e deve ricevere 404");

    // Si controlla che il task esista ancora per l'Utente A
    const checkRes = await fetch(`${baseUrl}/api/tasks/${taskUserAId}`, {
      method: "GET",
      headers: { Cookie: cookieUserA },
    });
    assert.equal(checkRes.status, 200, "Il task deve essere ancora presente per l'Utente A");
  });
});
