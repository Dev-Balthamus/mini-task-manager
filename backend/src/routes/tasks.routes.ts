import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { createTask, getAllTasks, getTaskById, updateTask, deleteTask } from "../controllers/tasks.controller.js";

const router = Router();

// Si applica la protezione da autenticazione a TUTTE le rotte di questo router
router.use(authenticateToken);

router.post("/", createTask);
router.get("/", getAllTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
