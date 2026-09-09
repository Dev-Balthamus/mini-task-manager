import { describe, before, after, test } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import app from "../../src/app.ts";
import { pool } from "../../src/repository/infrastructure/pool.ts";
import { getTestDatabaseUrl } from "../helpers/get-test-db-url.ts";

describe("Verifica nuovi modulo Repository e Connection Pool - Mini Task Manager", () => {
  let server: Server;
  let baseUrl: string;
  let createdTaskId: string; // Tipo stringa dato che il database lo genera come UUID

  before(async () => {
    // In primis si allineano le variabili d'ambiente per il pool
    process.env.DATABASE_URL = getTestDatabaseUrl();

    // Prima di tutti i test, healthcheck del database
    await pool.query("SELECT 1");

    // Avvio del server Express su porta dinamica (noi scriviamo 0, ma il sistema assegna una porta libera casuale)
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
    // Dopo tutti i test, si procede a chiudere in modo pulito il server Express - il Connection Pool di PostgreSQL rimane aperto per i test seguenti
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  test("1. Verifica Endpoint CREATE (POST /api/tasks)", async () => {
    const newTask = {
      title: "Test Task CI/CD",
      description: "Task creato durante il test di integrazione",
      priority: "high",
      executed: false,
    };

    const res = await fetch(`${baseUrl}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    assert.equal(res.status, 201);

    const data = (await res.json()) as { msg: string; task: { id: string; title: string; executed: boolean } };

    assert.equal(data.msg, "Il task è stato creato!");
    assert.equal(typeof data.task.id, "string"); // Verifica che l'ID sia di tipo UUID
    assert.equal(data.task.title, newTask.title);
    assert.equal(data.task.executed, false); // Garantisce che executed sia false

    // L'ID del task creato viene salvato per i test successivi
    createdTaskId = data.task.id;
  });

  test("2. Verifica Endpoint GET-ALL (GET /api/tasks)", async () => {
    const res = await fetch(`${baseUrl}/api/tasks`);

    assert.equal(res.status, 200);

    const tasks = (await res.json()) as Array<unknown>;

    assert.ok(Array.isArray(tasks));
    assert.ok(tasks.length > 0);
  });

  test("3. Verifica Endpoint GET-ONE-BY-ID (GET /api/tasks/:id)", async () => {
    const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`);

    assert.equal(res.status, 200);

    const data = (await res.json()) as { task: { id: string } };

    assert.equal(data.task.id, createdTaskId);
  });

  test("4. Verifica Endpoint MODIFY-ONE-BY-ID (PUT /api/tasks/:id)", async () => {
    const updateData = {
      title: "Titolo Modificato",
      priority: "medium",
      executed: false, // Ogni volta che un task viene modificato, executed torna a valore `false`
    };

    const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });

    assert.equal(res.status, 200);

    const data = (await res.json()) as { task: { title: string; priority: string; executed: boolean } };

    assert.equal(data.task.title, "Titolo Modificato");
    assert.equal(data.task.priority, "medium");
    assert.equal(data.task.executed, false);
  });

  test("5. Verifica Endpoint DELETE-ONE-BY-ID (DELETE /api/tasks/:id)", async () => {
    const deleteRes = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
      method: "DELETE",
    });

    assert.equal(deleteRes.status, 200);

    /*
    A riprova dell'eliminazione del task di test,
    eseguiamo una GET-ONE-BY-ID che ci si attende restituisca `404 Not Found`
    */
    const getTask = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`);
    assert.equal(getTask.status, 404);
  });
});
