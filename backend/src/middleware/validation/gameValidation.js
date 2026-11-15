const Joi = require("joi");

const createGameSchema = Joi.object({
  lobbyName: Joi.string().trim().min(3).max(50).required(),
  drawingPrompt: Joi.string().trim.min(2).max(100).optional(),
  privacy: Joi.string().valid("PUBLIC", "PRIVATE", "SOLO").required(),
  gameDuration: Joi.number().integer().valid(24,48,72).default(24),
  voteDuration: Joi.number().integer().valid(6,12,24).default(6),
  playerLimit: Joi.number().min(1).required()
});

const joinGameSchema = Joi.object({
  gameId: Joi.number().integer().min(1).optional(),
  joinCode: Joi.string().trim().uppercase().optional(),
}); 

const submitDrawingSchema = Joi.array().items(
  Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    timestamp: Joi.date()
  })
).min(2).required(); 

const validateCreateGame = (req, res, next) => {
    const { error, value } = createGameSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });
    req.body = value; 
    next();
};

const validateJoinGame = (req, res, next) => {
    const { error, value } = joinGameSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.message });
    req.body = value;
    next();
};

const validateSubmitDrawing = (req, res, next) => {
    const dataToValidate = req.body.coordinates || req.body;
    const { error, value } = submitDrawingSchema.validate(dataToValidate);
    if (error) return res.status(400).json({ success: false, message: error.message });
    next();
};

module.exports = {
  validateCreateGame,
  validateJoinGame,
  validateSubmitDrawing,
}