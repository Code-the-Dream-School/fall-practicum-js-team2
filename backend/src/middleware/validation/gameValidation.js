import Joi from 'joi';

const createGameSchema = Joi.object({
  durationInDays: Joi.number().integer().min(1).max(30).default(7),
  isPrivate: Joi.boolean().required(),
});

const joinGameSchema = Joi.object({
  gameId: Joi.number().integer().min(1).optional(),
  joinCode: Joi.string().trim().uppercase().optional(),
}).xor('gameId', 'joinCode'); 

module.exports = {
  createGameSchema,
  joinGameSchema
}