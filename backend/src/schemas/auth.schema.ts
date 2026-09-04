import Joi from "joi";

// Schema di validazione per registrazione dei nuovi oggetti di tipo `user`
export const registerUserBodySchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "L'email inserita non è valida",
    "any.required": "L'email è un campo obbligatorio",
  }),
  password: Joi.string().min(11).required().messages({
    "string.min": "La password deve contenere almeno 11 caratteri",
    "any.required": "La password è un campo obbligatorio",
  }),
});

// Schema di validazione per login degli utenti
export const loginUserBodySchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "L'email inserita non è valida",
    "any.required": "L'email è un campo obbligatorio",
  }),
  password: Joi.string().required().messages({
    "any.required": "La password è un campo obbligatorio",
  }),
});
