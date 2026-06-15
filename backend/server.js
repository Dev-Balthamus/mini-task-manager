import express from "express";
import fs from "fs";
import { readFile } from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url"; // Per ottenere __dirname in ES Modules
import cors from "cors"; // Per far comunicare frontend e backend se sono su porte diverse
import Joi from "joi";
import "express-async-errors";
import morgan from "morgan";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tasksJSONPath = path.join(__dirname, "tasks.json");

const taskSchema = Joi.object({
  id: Joi.number().integer().required(),
  title: Joi.string().required(),
  description: Joi.string().optional().allow(""),
  priority: Joi.string().valid("high", "medium", "low").required(),
  executed: Joi.boolean().required(),
});

app.use(morgan("dev"));

app.use(cors()); // Per far parlare React con Express
app.use(express.json()); // Per permettere a Express di leggere il JSON inviato nel body da React

// ENDPOINT CREATE
app.post("/api/tasks", async (req, res) => {
  const { id, title, description, priority, executed } = req.body; // Questo è l'oggetto inviato da React
  const newTask = { id, title, description, priority, executed };
  const validatedNewTask = taskSchema.validate(newTask);

  if (validatedNewTask.error) {
    return res.status(400).json({ msg: validatedNewTask.error.details[0].message });
  }

  try {
    // Qui viene letto il file JSON esistente
    const data = await fs.promises.readFile(tasksJSONPath, "utf8");

    // Il contenuto del JSON viene trasformato in un array dei tasks
    let tasks = [];
    if (data) {
      tasks = JSON.parse(data);
    }

    // Il nuovo task viene aggiunto all'array dei tasks
    tasks.push(newTask);

    // L'array aggiornato viene sovrascritto nel file JSON
    // I parametri "null" e "2" vanno a formattare il JSON per favorirne la leggibilità
    await fs.promises.writeFile(tasksJSONPath, JSON.stringify(tasks, null, 2));

    return res.status(201).json({ msg: "Il task è stato creato!", task: newTask });
  } catch (err) {
    console.error("Errore nella lettura del file:", err);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
});

// Endpoint GET-ALL
app.get("/api/tasks", async (req, res) => {
  try {
    // Qui viene letto il file JSON esistente
    const data = await fs.promises.readFile(tasksJSONPath, "utf8");

    res.status(200).json(JSON.parse(data || "[]"));
  } catch (err) {
    return res.status(500).json({ msg: "Errore nella lettura dei task" });
  }
});

//ENDPOINT GET-ONE-BY-ID
app.get("/api/tasks/:id", async (req, res) => {
  try {
    // Qui viene letto il file JSON esistente
    const data = await fs.promises.readFile(tasksJSONPath, "utf8");

    // Il contenuto del JSON viene trasformato in un array dei tasks per trovare quello con l'ID dato
    const tasks = JSON.parse(data || "[]");

    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) {
      return res.status(404).json({ msg: "Task non trovato" });
    }
    res.status(200).json({ msg: "Task trovato!", task: task });
  } catch (err) {
    return res.status(500).json({ msg: "Errore nella lettura dei task" });
  }
});

//ENDPOINT MODIFY-ONE-BY-ID
app.put("/api/tasks/:id", async (req, res) => {
  try {
    // Qui viene letto il file JSON esistente
    const data = await fs.promises.readFile(tasksJSONPath, "utf8");

    // Il contenuto del JSON viene trasformato in un array dei tasks per trovare quello con l'ID dato
    const tasks = JSON.parse(data || "[]");
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) {
      return res.status(404).json({ msg: "Task non trovato" });
    }

    //Il task trovato viene aggiornato con i nuovi dati inviati da React
    const { title, description, priority, executed } = req.body;
    task.title = title || task.title;
    task.description = description;
    task.priority = priority || task.priority;
    task.executed = executed !== undefined ? executed : task.executed;

    const editedTask = taskSchema.validate(task);

    // L'array aggiornato viene sovrascritto nel file JSON
    await fs.promises.writeFile(tasksJSONPath, JSON.stringify(tasks, null, 2));

    return res.status(200).json({ msg: "Task aggiornato!", task: task });
  } catch (err) {
    console.error("Errore durante l'aggiornamento del task:", err);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
});

//ENDPOINT DELETE-ONE-BY-ID
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    // Qui viene letto il file JSON esistente
    const data = await fs.promises.readFile(tasksJSONPath, "utf8");

    // Il contenuto del JSON viene trasformato in un array dei tasks per trovare quello con l'ID dato
    const tasks = JSON.parse(data || "[]");
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) {
      return res.status(404).json({ msg: "Task non trovato" });
    }

    // Crea un nuovo array dei tasks da cui è stato rimosso il task con l'ID dato
    const updatedTasks = tasks.filter((t) => t.id !== Number(req.params.id));

    // L'array aggiornato viene sovrascritto nel file JSON
    await fs.promises.writeFile(tasksJSONPath, JSON.stringify(updatedTasks, null, 2));

    return res.status(200).json({ msg: "Task eliminato!", task: task });
  } catch (err) {
    console.error("Errore durante la cancellazione del task:", err);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
});

app.listen(port, () => {
  console.log(`Server dell''app "Mio Task Manager" in ascolto sulla porta ${port}`);
});
