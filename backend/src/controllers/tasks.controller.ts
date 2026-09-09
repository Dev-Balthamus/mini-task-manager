import type { Request, Response } from "express";
import { PostgresTasksRepository } from "../repository/infrastructure/PostgresTasksRepository.js";
import { taskBodySchema } from "../schemas/tasks.schema.js";

const tasksRepo = new PostgresTasksRepository();

// ENDPOINT CREATE
export const createTask = async (req: Request, res: Response) => {
  const { error, value } = taskBodySchema.validate(req.body);

  // Qui si verifica che la validazione non fallisca
  if (error) {
    return res.status(400).json({ msg: error.details[0]?.message });
  }

  // Se la validazione avviene con successo
  try {
    const newTask = await tasksRepo.create(value);
    return res.status(201).json({ msg: "Il task è stato creato!", task: newTask });
  } catch (e) {
    console.error("Errore nella creazione del nuovo task: ", e);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
};

// ENDPOINT GET-ALL
export const getAllTasks = async (_req: Request, res: Response) => {
  try {
    // Qui viene letto il contenuto della tabella `tasks` sul database
    const tasks = await tasksRepo.getAll();
    // Qui il contenuto della tabella è convertito in JSON per React
    return res.status(200).json(tasks);
  } catch (e) {
    console.error("Errore nella lettura della tabella `tasks`: ", e);
    return res.status(500).json({ msg: "Errore nella lettura dei task" });
  }
};

//ENDPOINT GET-ONE-BY-ID
export const getTaskById = async (req: Request, res: Response) => {
  // Qui viene salvato e verificato l'ID del task che si vuole trovare
  const { id } = req.params;
  // Qui si gestisce il caso in cui non sia stato trovato un task con l'ID salvato e validato
  if (!id || typeof id !== "string") {
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
};

//ENDPOINT MODIFY-ONE-BY-ID
export const updateTask = async (req: Request, res: Response) => {
  // Qui viene salvato e verificato l'ID del task che si vuole trovare
  const { id } = req.params;
  if (!id || typeof id !== "string") {
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
};

//ENDPOINT DELETE-ONE-BY-ID
export const deleteTask = async (req: Request, res: Response) => {
  // Qui viene salvato e verificato l'ID del task che si vuole trovare
  const { id } = req.params;
  if (!id || typeof id !== "string") {
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
    console.error("Errore cancellazione task: ", e);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
};
