import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { loginRateLimiter } from "../middlewares/rate-limiters.js";

const router = Router();

router.post("/register", register);
router.post("/login", loginRateLimiter, login);

export default router;
