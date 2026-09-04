import Joi from "joi";

// Schema di validazione per gli oggetti di tipo `task`
export const taskBodySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional().allow(""),
  priority: Joi.string().valid("high", "medium", "low").required(),
  executed: Joi.boolean().required(),
});
