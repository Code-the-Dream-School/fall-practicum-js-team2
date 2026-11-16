const crypto = require('crypto');
const prisma = require("../config/prisma");
const { PICTIONARY_WORDS } = require("../utils/pictionaryWords");

async function create(req, res, next) {
    try {
        const { 
            lobbyName, 
            drawingPrompt, 
            difficulty,
            privacy, 
            gameDuration, 
            voteDuration, 
            playerLimit 
        } = req.body;

        const creatorId = req.userId;

        const startDate = new Date();
        //convert hours to milliseconds (hours * 60 * 60 * 1000)
        const endDate = new Date(startDate.getTime() + gameDuration * 60 * 60 * 1000);
        const voteEndDate = new Date(endDate.getTime() + voteDuration * 60 * 60 * 1000);

        let joinCode = null;
        if (privacy === "PRIVATE") {
            joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        }

        const finalPlayerLimit = privacy === "SOLO" ? 1 : playerLimit;

        const wordPool = PICTIONARY_WORDS[difficulty] || PICTIONARY_WORDS.EASY;
        const randomPrompt = wordPool[Math.floor(Math.random() * wordPool.length)];
        const finalPrompt = drawingPrompt || randomPrompt;
        
        const newGame = await prisma.game.create({
            data: {
                lobbyName,
                startDate,
                endDate,
                voteEndDate,
                privacy,
                joinCode,
                pictionaryWord: finalPrompt,
                maxParticipants: finalPlayerLimit,
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

//Weekly public lobby, dev created
async function createWeekly(req, res, next) {
    try {
        const { 
            lobbyName, 
            drawingPrompt, 
            difficulty, 
            playerLimit 
        } = req.body;
        
        const startDate = new Date();
        //end date is 6 days
        const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
        const voteEndDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);

        const wordPool = PICTIONARY_WORDS[difficulty] || PICTIONARY_WORDS.EASY;
        const randomPrompt = wordPool[Math.floor(Math.random() * wordPool.length)];
        const finalPrompt = drawingPrompt || randomPrompt;

        const newGame = await prisma.game.create({
            data: {
                lobbyName,
                startDate,
                endDate,
                voteEndDate,
                privacy: "PUBLIC",
                pictionaryWord: finalPrompt,
                maxParticipants: playerLimit,
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
        next (error);
    }
}

async function join(req, res, next) {
    try {
        const { gameId, joinCode } = req.body;
        const userId = req.userId;

        let game = null;

        if (joinCode) {
            game = await prisma.game.findUnique({
                where: { joinCode: joinCode },
                include: { _count: { select: { participants: true } } }
            });
        } else if (gameId) {
            game = await prisma.game.findUnique({
                where: { id: Number(gameId) },
                include: { _count: { select: { participants: true } } }
            });
        }

        if (!game) {
            return res.status(404).json({ message: "Game lobby not found "});
        }
        
        const today = new Date();
        if (today > game.endDate) {
            return res.status(400).json({ message: "This game has already finished "})
        }

        if (game.privacy === "PRIVATE" && game.joinCode !== joinCode) {
            return res.status(403).json({ 
                message: "Invalid or missing join code for this private game" 
            });
        }

        if (game.privacy === "SOLO") {
            return res.status(403).json({
                message: "Cannot join solo game"
            });
        }

        if (game._count.participants >= game.maxParticipants) {
            return res.status(400).json({ message: "This game lobby is already full" });
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
        const userId = Number(req.userId);
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
                coordinates: coordinates,
                submittedAt: new Date(),
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

async function getDrawings(req, res, next) {
    try {
        const gameId = Number(req.params.id);
        const userId = Number(req.userId);

        const participant = await prisma.participant.findFirst({
            where: {
                gameId: gameId,
                userId: Number(userId)
            }
        });

        if (!participant) {
            return res.status(403).json({ message: "Cannot view drawings of games you are not in" });
        }

        const drawings = await prisma.drawing.findMany({
            where: {
                participant: {
                    gameId
                }
            },
            include: {
                participant: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            data: drawings
        })
    } catch (error) {
        next(error);
    }
}

async function getVotes(req, res, next) {
    try {
        const gameId = Number(req.params.id);
        const userId = Number(req.userId);

        const participant = await prisma.participant.findFirst({
            where: {
                gameId: gameId,
                userId: Number(userId)
            }
        });

        if (!participant) {
            return res.status(403).json({ message: "Cannot view votes of games you are not in" });
        }

        const votes = await prisma.participant.findMany({
            where: {
                gameId
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        received: true
                    }
                }
            },
            orderBy: {
                received: {
                    _count: "desc"
                }
            }
        });

        return res.status(200).json({
            success: true,
            data: votes
        });
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const gameId = Number(req.params.id);
        const userId = Number(req.userId);

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
                success: false,
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
    createWeekly,
    join,
    submitDrawing,
    getOpenGames,
    getGameStatus,
    getDrawings,
    getVotes,
    update,
}