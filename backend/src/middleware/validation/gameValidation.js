const Joi = require("joi");

const createGameSchema = Joi.object({
  durationInDays: Joi.number().integer().min(1).max(30).default(7),
  isPrivate: Joi.boolean().required(),
});

const joinGameSchema = Joi.object({
  gameId: Joi.number().integer().min(1).optional(),
  joinCode: Joi.string().trim().uppercase().optional(),
}).xor('gameId', 'joinCode'); 

const submitDrawingSchema = Joi.array().items(
  Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    timestamp: Joi.date()
  })
).min(2).required(); 

module.exports = {
  createGameSchema,
  joinGameSchema,
  submitDrawingSchema,
}