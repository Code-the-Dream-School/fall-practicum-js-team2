const express = require("express");
const router = express.Router();

const { 
    create, 
    join,
    submitDrawing,
    getOpenGames,
    getGameStatus,
    update,
    closePrivateGame 
} = require("../controllers/game.controller");

const { 
    validateCreateGame,
    validateJoinGame,
    validateSubmitDrawing, 
} = require('../middleware/validation/gameValidation');

router.post("/create", validateCreateGame, create);
router.post("/join", validateJoinGame, join);
router.post("/:id/submit", validateSubmitDrawing, submitDrawing);
router.get("/", getOpenGames);
router.get("/:id", getGameStatus);
router.patch("/:id", update);
router.delete("/:id", closePrivateGame);

module.exports = router;