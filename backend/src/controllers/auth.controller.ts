import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PostgresUsersRepository } from "../repository/infrastructure/PostgresUsersRepository.js";
import { registerUserBodySchema, loginUserBodySchema } from "../schemas/auth.schema.js";

const usersRepo = new PostgresUsersRepository();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-prod";

// ENDPOINT REGISTER USER
export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Si valida l'input con Joi
  const { error, value } = registerUserBodySchema.validate({ email, password });
  if (error) {
    return res.status(400).json({ msg: error.details[0]?.message });
  }

  try {
    // Si controlla se esiste già un utente con la mail inserita
    const existingUser = await usersRepo.findByEmail(value.email);
    if (existingUser) {
      return res.status(409).json({ msg: "C'è già un utente registrato con la mail inserita" });
    }

    // Si esegue l'hash della password (Salt Factor 10)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(value.password, saltRounds);

    // Si salva l'utente sul database
    const newUser = await usersRepo.register({
      email: value.email,
      password: hashedPassword,
    });

    // Si manda risposta al client (escludendo la password dai dati per il riscontro)
    return res.status(201).json({
      msg: "Utente registrato con successo!",
      user: {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    });
  } catch (e) {
    console.error("Errore nell'operazione di registrazione dell'utente: ", e);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
};

// ENDPOINT LOGIN USER
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Si valida l'input con Joi
  const { error, value } = loginUserBodySchema.validate({ email, password });
  if (error) {
    return res.status(400).json({ msg: error.details[0]?.message });
  }

  // Si imposta un messaggio di errore che sia generico al fine di non rivelare se l'email esiste o no nel database
  const GENERIC_ERROR_MSG = "Credenziali non valide";

  try {
    // Si cerca l'utente tramite Repository
    const user = await usersRepo.findByEmail(value.email);
    if (!user) {
      return res.status(401).json({ msg: GENERIC_ERROR_MSG });
    }

    // Si verifica Hash Password con bcrypt
    const isPasswordValid = await bcrypt.compare(value.password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ msg: GENERIC_ERROR_MSG });
    }

    // Si genera il Token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });

    // Si imposta il Cookie Sicuro httpOnly
    res.cookie("token", token, {
      httpOnly: true, // Impedisce l'accesso al cookie da script JS nel client (XSS Protection)
      secure: process.env.NODE_ENV === "production", // HTTPS solo in produzione
      sameSite: "strict", // Previene attacchi CSRF
      maxAge: 24 * 60 * 60 * 1000, // 1 giorno in millisecondi
    });

    return res.status(200).json({
      msg: "Login effettuato con successo!",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (e) {
    console.error("Errore durante l'operazione di login: ", e);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
};

//ENDPOINT LOGOUT USER
export const logout = async (_req: Request, res: Response) => {
  try {
    // Si rimuove il cookie 'token' impostandone la data di scadenza nel passato
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ msg: "Logout effettuato con successo!" });
  } catch (e) {
    console.error("Errore durante il logout: ", e);
    return res.status(500).json({ msg: "Errore interno del server" });
  }
};
