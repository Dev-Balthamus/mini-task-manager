import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types/express.d.ts";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-prod";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ msg: "Accesso non autorizzato: Token mancante" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    // Si tipizza esplicitamente l'oggetto con AuthUser
    const user: AuthUser = {
      id: decoded.userId,
      email: decoded.email,
    };

    // Popoliamo req.user
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Accesso non autorizzato: Token non valido o scaduto" });
  }
};
