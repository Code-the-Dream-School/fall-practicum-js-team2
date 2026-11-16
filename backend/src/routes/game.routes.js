const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth.middleware");

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

router.post("/create", requireAuth, validateCreateGame, create);
router.post("/join", requireAuth, validateJoinGame, join);
router.post("/:id/submit", requireAuth, validateSubmitDrawing, submitDrawing);
router.patch("/:id", requireAuth, update);
router.get("/:id/drawings", requireAuth, getDrawings);
router.get("/:id/votes", requireAuth, getVotes);

router.get("/", getOpenGames);
router.get("/:id", getGameStatus);

module.exports = router;