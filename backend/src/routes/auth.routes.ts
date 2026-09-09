import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { loginRateLimiter } from "../middlewares/rate-limiters.js";

const router = Router();

router.post("/register", register);
router.post("/login", loginRateLimiter, login);
router.post("/logout", logout);

export default router;
