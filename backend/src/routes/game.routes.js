const express = require("express");
const router = express.Router();

const { 
    create, 
    join,
    startGame,
    submitDrawing,
    getOpenGames,
    getGameStatus,
    update,
    closePrivateGame 
} = require("../controllers/game.controller");

const { 
    validateCreateGame,
    validateJoinGame 
} = require('../middleware/validation/gameValidation');

router.post("/create", validateCreateGame, create);
router.post("/join", validateJoinGame, join);
router.post("/:id/start", startGame);
router.post("/:id/submit", submitDrawing);
router.get("/", getOpenGames);
router.get("/:id", getGameStatus);
router.patch("/:id", update);
router.delete("/:id", closePrivateGame);

module.exports = router;