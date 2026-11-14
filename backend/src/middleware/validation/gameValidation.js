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