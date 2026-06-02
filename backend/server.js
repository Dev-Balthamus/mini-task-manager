import express from "express";
import fs from "fs";
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
app.post("/api/tasks", (req, res) => {
  const { id, title, description, priority, executed } = req.body; // Questo è l'oggetto inviato da React
  const newTask = { id, title, description, priority, executed };
  const validatedNewTask = taskSchema.validate(newTask);

  if (validatedNewTask.error) {
    return res.status(400).json({ msg: validatedNewTask.error.details[0].message });
  }

  // Qui viene letto il file JSON esistente
  fs.readFile(tasksJSONPath, "utf8", (err, data) => {
    if (err) {
      console.error("Errore nella lettura del file:", err);
      return res.status(500).json({ msg: "Errore interno del server" });
    }

    // Il contenuto del JSON viene trasformato in un array dei tasks
    let tasks = [];
    if (data) {
      tasks = JSON.parse(data);
    }

    // Il nuovo task viene aggiunto all'array dei tasks
    tasks.push(newTask);

    // L'array aggiornato viene sovrascritto nel file JSON
    // I parametri "null" e "2" vanno a formattare il JSON per favorirne la leggibilità
    fs.writeFile(tasksJSONPath, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        console.error("Errore nella scrittura del file:", err);
        return res.status(500).json({ msg: "Impossibile salvare il task" });
      }

      res.status(201).json({ msg: "Il task è stato creato!", task: newTask });
    });
  });
});

// Endpoint GET-ALL
app.get("/api/tasks", (req, res) => {
  fs.readFile(tasksJSONPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ msg: "Errore nella lettura dei task" });
    }
    res.status(200).json(JSON.parse(data || "[]"));
  });
});

//ENDPOINT GET-ONE-BY-ID
app.get("/api/tasks/:id", (req, res) => {
  // Qui viene letto il file JSON esistente
  fs.readFile(tasksJSONPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ msg: "Errore nella lettura dei task" });
    }

    // Il contenuto del JSON viene trasformato in un array dei tasks per trovare quello con l'ID dato
    const tasks = JSON.parse(data || "[]");

    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) {
      return res.status(404).json({ msg: "Task non trovato" });
    }
    res.status(200).json({ msg: "Task trovato!", task: task });
  });
});

//ENDPOINT MODIFY-ONE-BY-ID
app.put("/api/tasks/:id", (req, res) => {
  // Qui viene letto il file JSON esistente
  fs.readFile(tasksJSONPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ msg: "Errore nella lettura dei task" });
    }

    // Il contenuto del JSON viene trasformato in un array dei tasks per trovare quello con l'ID dato
    const tasks = JSON.parse(data || "[]");
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) {
      return res.status(404).json({ msg: "Task non trovato" });
    }

    //Il task trovato viene aggiornato con i nuovi dati inviati da React
    const { title, description, priority, executed } = req.body;
    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.executed = executed !== undefined ? executed : task.executed;

    // L'array aggiornato viene sovrascritto nel file JSON
    fs.writeFile(tasksJSONPath, JSON.stringify(tasks, null, 2), (err) => {
      if (err) {
        console.error("Errore nella scrittura del file:", err);
        return res.status(500).json({ msg: "Impossibile aggiornare il task" });
      }

      res.status(200).json({ msg: "Task aggiornato!", task: task });
    });
  });
});

//ENDPOINT DELETE-ONE-BY-ID
app.delete("/api/tasks/:id", (req, res) => {
  fs.readFile(tasksJSONPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ msg: "Errore nella lettura dei task" });
    }

    // Il contenuto del JSON viene trasformato in un array dei tasks per trovare quello con l'ID dato
    const tasks = JSON.parse(data || "[]");
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) {
      return res.status(404).json({ msg: "Task non trovato" });
    }

    // Crea un nuovo array dei tasks da cui è stato rimosso il task con l'ID dato
    const updatedTasks = tasks.filter((t) => t.id !== Number(req.params.id));

    // L'array aggiornato viene sovrascritto nel file JSON
    fs.writeFile(tasksJSONPath, JSON.stringify(updatedTasks, null, 2), (err) => {
      if (err) {
        console.error("Errore nella scrittura del file:", err);
        return res.status(500).json({ msg: "Impossibile eliminare il task" });
      }
      res.status(200).json({ msg: "Task eliminato!", task: task });
    });
  });
});

app.listen(port, () => {
  console.log(`Server dell''app "Mio Task Manager" in ascolto sulla porta ${port}`);
});
