const express = require("express");
const router = express.Router();

const { 
    create, 
    join,
    submitDrawing,
    getOpenGames,
    getGameStatus,
    getDrawings,
    getVotes,
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
router.get("/:id/drawings", getDrawings);
router.get("/:id/votes", getVotes);
router.patch("/:id", mockAuthenticate, update);

module.exports = router;