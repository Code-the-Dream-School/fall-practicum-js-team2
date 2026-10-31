const express = require("express");
const gameController = require("../controllers/game.controller");

const router = express.Router();

router.post("/", gameController.create);
router.post("/:id", gameController.join);
router.post("/:id/start", gameController.startGame);
router.post("/:id/submit", gameController.submitDrawing);
router.get("/", gameController.getOpenGames);
router.get("/:id", gameController.getGameStatus);
router.patch("/:id", gameController.update);
router.delete("/:id", gameController.closePrivateGame);

module.exports = router;