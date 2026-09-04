import { Router } from "express";
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask } from "../controllers/tasks.controller.js";

const router = Router();

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
