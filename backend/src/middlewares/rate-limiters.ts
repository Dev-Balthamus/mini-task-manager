import rateLimit from "express-rate-limit";

// Rate Limiter per proteggere l'endpoint di login da attacchi brute-force
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Finestra di 15 minuti
  limit: 5, // Massimo 5 tentativi per IP ogni 15 minuti
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { msg: "Troppi tentativi di login. Riprova tra 15 minuti." },
});
