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
                privacy: isPrivate ? "PRIVATE" : "PUBLIC",
                joinCode: joinCode,
                pictionaryWord: pictionaryWord,
                status: "ACTIVE",
                
                participants: {
                    create: {
                        userId: Number(creatorId)
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

async function join(req, res, next) {
    try {
        const { gameId, joinCode } = req.body;
        const userId = req.user.id;

        let game = null;

        if (joinCode) {
            game = await prisma.game.findUnique({
                where: { joinCode: joinCode }
            });
        } else if (gameId) {
            game = await prisma.game.findUnique({
                where: { id: Number(gameId) }
            });
        }

        if (!game) {
            return res.status(404).json({ message: "Game lobby not found "});
        }
        
        const today = new Date();
        if (today > game.endDate) {
            return res.status(400).json({ message: "This game has already finished "})
        }

        const participantCheck = await prisma.participant.findFirst({
            where: {
                gameId: game.id,
                userId: Number(userId)
            }
        });

        if (participantCheck) {
            return res.status(400).json({ message: "You are already in this game lobby" })
        }

        const newParticipant = await prisma.participant.create({
            data: {
                gameId: game.id,
                userId: Number(userId)
            }
        });

        return res.status(201).json({
            success: true, 
            message: "Successfully joined the game lobby",
            data: newParticipant
        });

    } catch (error) {
        next(error)
    }
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