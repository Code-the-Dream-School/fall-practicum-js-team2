const express = require("express");
const router = express.Router();

const { 
    create, 
    join,
    submitDrawing,
    getOpenGames,
    getGameStatus,
    update,
} = require("../controllers/game.controller");

const { 
    validateCreateGame,
    validateJoinGame,
    validateSubmitDrawing, 
} = require('../middleware/validation/gameValidation');

// Temporary mock authentication middleware for testing without a user controller
function mockAuthenticate(req, res, next) {
    req.user = { id: 1 }; 
    next();
}

router.post("/create", mockAuthenticate, validateCreateGame, create);
router.post("/join", mockAuthenticate, validateJoinGame, join);
router.post("/:id/submit", mockAuthenticate, validateSubmitDrawing, submitDrawing);
router.get("/", getOpenGames);
router.get("/:id", getGameStatus);
router.patch("/:id", mockAuthenticate, update);

module.exports = router;