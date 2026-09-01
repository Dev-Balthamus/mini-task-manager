import express from "express";
import { PostgresTasksRepository } from "./repository/infrastructure/PostgresTasksRepository.js";
import Joi from "joi";
import morgan from "morgan";
import cors from "cors"; // Per far comunicare frontend e backend se sono su porte diverse

const app = express();
const tasksRepo = new PostgresTasksRepository();

const taskBodySchema = Joi.object({
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
  const { title, description, priority, executed } = req.body; // Questo è l'oggetto inviato da React
  const taskToValidate = { title, description, priority, executed };
  const { error, value } = taskBodySchema.validate(taskToValidate);

  // Qui si verifica che la validazione non fallisca
  if (error) {
    return res.status(400).json({ msg: error.details[0]?.message });
  }

  // Se la validazione avviene con successo
  try {
    // Viene tentata l'aggiunta del nuovo task viene aggiunto alla tabella `tasks` sul database
    const newTask = await tasksRepo.create(value);
    return res.status(201).json({ msg: "Il task è stato creato!", task: newTask });
  } catch (e) {
    console.error("Errore nella creazione del nuovo task: ", e);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
});

// ENDPOINT GET-ALL
app.get("/api/tasks", async (_req, res) => {
  try {
    // Qui viene letto il contenuto della tabella `tasks` sul database
    const tasks = await tasksRepo.getAll();
    // Qui il contenuto della tabella è convertito in JSON per React
    res.status(200).json(tasks);
  } catch (e) {
    console.error("Errore nella lettura della tabella `tasks`: ", e);
    return res.status(500).json({ msg: "Errore nella lettura dei task" });
  }
});

//ENDPOINT GET-ONE-BY-ID
app.get("/api/tasks/:id", async (req, res) => {
  // Qui viene salvato e verificato l'ID del task che si vuole trovare
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ msg: "ID non valido" });
  }

  try {
    // Qui si recupera il task voluto dalla tabella `tasks`
    const task = await tasksRepo.getById(id);
    // Qui si gestisce il caso in cui non sia stato trovato un task con l'ID salvato e validato
    if (!task) {
      return res.status(404).json({ msg: "Task non trovato" });
    }
    return res.status(200).json({ msg: "Task trovato!", task });
  } catch (e) {
    // Qui si gestisce il caso in cui il task sia stato trovato ma comunque non recuperato
    console.error("Errore di recupero del task voluto dalla tabella `tasks`: ", e);
    return res.status(500).json({ msg: "Errore nella lettura del task" });
  }
});

//ENDPOINT MODIFY-ONE-BY-ID
app.put("/api/tasks/:id", async (req, res) => {
  // Qui viene salvato e verificato l'ID del task che si vuole trovare
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ msg: "ID non valido" });
  }

  // Qui vengono permessi updates parziali del task dato
  const updateSchema = taskBodySchema.fork(["title", "priority"], (schema) => schema.optional());
  const { error, value } = updateSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0]?.message });
  }

  try {
    // Qui si aggiorna il task voluto dalla tabella `tasks`
    const updatedTask = await tasksRepo.update(id, value);
    // Qui si gestisce il caso in cui non sia stato trovato un task con l'ID salvato e validato
    if (!updatedTask) {
      return res.status(404).json({ msg: "Task non trovato" });
    }
    return res.status(200).json({ msg: "Task aggiornato!", task: updatedTask });
  } catch (e) {
    // Qui si gestisce il caso in cui il task sia stato trovato ma comunque non aggiornato
    console.error("Errore di aggiornamento del task voluto dalla tabella `tasks`: ", e);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
});

//ENDPOINT DELETE-ONE-BY-ID
app.delete("/api/tasks/:id", async (req, res) => {
  // Qui viene salvato e verificato l'ID del task che si vuole trovare
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ msg: "ID non valido" });
  }

  try {
    // Qui si cancella il task voluto dalla tabella `tasks`
    const task = await tasksRepo.delete(id);
    // Qui si gestisce il caso in cui non sia stato trovato un task con l'ID salvato e validato
    if (!task) {
      return res.status(404).json({ msg: "Task non trovato" });
    }
    return res.status(200).json({ msg: "Task trovato!", task });
  } catch (e) {
    // Qui si gestisce il caso in cui il task sia stato trovato ma comunque non cancellato
    console.error("Errore di cancellazione del task voluto dalla tabella `tasks`: ", e);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
});

export default app;
