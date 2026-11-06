import Joi from 'joi';

const createGameSchema = Joi.object({
  durationInDays: Joi.number().integer().min(1).max(30).default(7),
  isPrivate: Joi.boolean().required(),
});