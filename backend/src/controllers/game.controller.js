const crypto = require('crypto');
const { createGameSchema, joinGameSchema } = require("../middleware/validation/gameValidation");
const prisma = require("../config/prisma");

async function create(req, res, next) {
    try {
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

async function submitDrawing(req, res, next) {
    try {
        const gameId = Number(req.params.id);
        const userId = Number(req.user.id);
        const { coordinates } = req.body;

        const game = await prisma.game.findUnique({
            where: { id : gameId }
        });

        if (!game) {
            return res.status(404).json({ message: "Game lobby not found" });
        }

        let today = new Date();
        if(today > game.endDate || game.status !== "ACTIVE") {
            return res.status(400).json({ message: "This game has already finished" });
        }

        const participant = await prisma.participant.findFirst({
            where: {
                gameId: gameId,
                userId: Number(userId)
            }
        });

        if (!participant) {
            return res.status(403).json({ message: "You must join this lobby before submitting a drawing" });
        }

        const existingDrawing = await prisma.drawing.findFirst({
            where: {
                participantId: participant.id
            }
        });

        if (existingDrawing) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted a drawing for this round"
            });
        }

        const newDrawing = await prisma.drawing.create({
            data: {
                participantId: participant.id,
                coordinates: coordinates
            }
        })

        return res.status(201).json({
            success: true,
            message: "Drawing has been submitted successfully",
            data: newDrawing
        });

    } catch (error) {
        next(error);
    }
}

async function getOpenGames(req, res, next) {
    try {
        const today = new Date();
        
        const openGames = await prisma.game.findMany({
            where: {
                status: "ACTIVE",
                privacy: "PUBLIC",
                endDate: {
                    gt: today
                }
            },
            orderBy: {
                endDate: 'asc'
            }
        });

        return res.status(200).json({
            success:true, 
            data: openGames
        });

    } catch (error) {
        next(error);
    }
}

//get game information (eg partipants, status, privacy, etc)
async function getGameStatus(req, res, next) {
    try{
        const gameId = Number(req.params.id);
        
        const game = await prisma.game.findUnique({
            where: {
                id: gameId 
            },
            include: {
                status: true,
                privacy: true,
                participants: true
            }
        });

        if (!game) {
            return res.status(404).json({ message: "Game lobby not found" });
        }

        return res.status(200).json({
            success: true, 
            data: game
        });

    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const gameId = Number(req.params.id);
        const userId = Number(req.user.id);

        const { status, endDate, pictionaryWord } = req.body;

        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: {
                participants: {
                    orderBy: {
                        id: 'asc'
                    }
                }
            }
        });

        if (!game) {
            return res.status(404).json({
                success: false,
                message: "Game lobby not found"
            })
        }

        //First participant is the creator
        const creatorParticipant = game.participants[0];
        if (!creatorParticipant || creatorParticipant.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "Forbidden, only the game owner can make changes to this lobby"
            });
        }

        if (game.status != "ACTIVE") {
            return res.status(400).json({
                sucess: false,
                message: "Cannot update a game that is no longer active"
            });
        }

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (endDate !== undefined) updateData.endDate = endDate;
        if (pictionaryWord !== undefined) updateData.pictionaryWord = pictionaryWord;

        const updatedGame = await prisma.game.update({
            where: { id: gameId },
            data: updateData
        });

        return res.status(200).json({
            success: true,
            message: "Game lobby updated successfully",
            data: updatedGame
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    create,
    join,
    submitDrawing,
    getOpenGames,
    getGameStatus,
    update,
}