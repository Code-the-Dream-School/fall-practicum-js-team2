const crypto = require('crypto');
const { createGameSchema } = require("../middleware/validation/gameValidation");
const prisma = require("../config/prisma");

async function create(req, res, next) {
    try {
        const { error, value } = createGameSchema.validate(req.body, { abortEarly: false });
        if (error) return res.status(400).json({ message: error.message });

        const { durationInDays, isPrivate } = value;
        const creatorId = req.user.id;

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + durationInDays);

        let joinCode = null;
        if (isPrivate) {
            joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        }

        //@@TODO change this with the pictionary word dictionary later
        const pictionaryWord = "Rectangle";

        const newGame = await prisma.game.create({
            data: {
                startDate,
                endDate,
                isPrivate,
                joinCode,
                creatorId,
                pictionaryWord: pictionaryWord,
                status: "ACTIVE",
                
                participants: {
                    create: {
                        userId: creatorId
                    },
                },
            },
            include: {
                participants: true,
            },
        });

        return res.status(201).json({
            success: true, 
            message: 'Game lobby created successfully',
            data: newGame,
        });

    } catch (error) {
        next(error);
    }
}

async function join(req, res) {

}

async function startGame(req, res) {

}

async function submitDrawing(req, res) {

}

async function getOpenGames(req, res) {

}

async function getGameStatus(req, res) {

}

async function update(req, res) {

}

async function closePrivateGame(req, res) {

}

module.exports = {
    create,
    join,
    startGame,
    submitDrawing,
    getOpenGames,
    getGameStatus,
    update,
    closePrivateGame,
}