/**
 * Smoke test for the game endpoints (and 404 middleware).
 *
 * Boots the real Express app on a random port, creates two throwaway users,
 * runs the game lifecycle checks against DATABASE_URL, and cleans up
 * all test records in the finally block.
 *
 * Usage:  npm run smoke:game 
 * can use command below to reduce terminal clutter: 
 * npm run smoke:game | grep -vE "^prisma:query|^(GET|POST|PUT|PATCH|DELETE) "
 */
const app = require('../src/app');
const prisma = require('../src/config/prisma');

const run = `smoke${Date.now()}`;
const hostUser = {
  name: 'Game Host',
  email: `${run}-host@example.com`,
  password: 'sup3r-secret',
};
const playerTwo = {
  name: 'Player Two',
  email: `${run}-p2@example.com`,
  password: 'sup3r-secret',
};

let passed = 0;
let failed = 0;
let createdGameId = null;

function check(label, ok, extra = '') {
  if (ok) {
    passed += 1;
    console.log(`  ok   ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${label} ${extra}`);
  }
}

async function main() {
  const server = app.listen(0);
  const rootUrl = `http://127.0.0.1:${server.address().port}`;

  const call = async (path, { method = 'GET', body, token } = {}) => {
    const res = await fetch(rootUrl + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  try {
    console.log('game smoke test');

    // Setup: Register two throwaway users to get valid JWTs
    const hostReg = await call('/api/auth/register', { method: 'POST', body: hostUser });
    const p2Reg = await call('/api/auth/register', { method: 'POST', body: playerTwo });
    const hostToken = hostReg.data.token;
    const p2Token = p2Reg.data.token;

    check('setup registered host & player 2', Boolean(hostToken && p2Token));

    const publicGamePayload = {
        lobbyName: "Public Lobby With Easy Word",
        difficulty: "EASY",
        privacy: "PUBLIC",
        gameDuration: 24,
        voteDuration: 6,
        playerLimit: 6
    };

    const privateGamePayload = {
        lobbyName: "Private Lobby With Custom Word",
        drawingPrompt: "Fish",
        privacy: "Private",
        gameDuration: 48,
        voteDuration: 12,
        playerLimit: 12
    }

    const soloGamePayload = {
        lobbyName: "Solo Lobby With Hard Word",
        difficulty: "HARD",
        privacy: "SOLO",
        gameDuration: 72,
        voteDuration: 24,
        playerLimit: 1
    }

    const updatePayload = {
        lobbyName: "Updated name",
        status: "COMPLETED",
        pictionaryWord: "Triangle",
        maxParticipants: 2000
    }

    // Auth protection check
    const unauthCreate = await call('/api/games/create', {
      method: 'POST',
      body: publicGamePayload,
    });
    check('POST /api/games without token returns 401', unauthCreate.status === 401, `got ${unauthCreate.status}`);

    // Create a public game lobby
    const createRes = await call('/api/games/create', {
      method: 'POST',
      token: hostToken,
      body: publicGamePayload,
    });
    createdGameId = createRes.data.data.id;
    check(
      'POST /api/games creates a public game (201 + id)',
      createRes.status === 201 && Boolean(createdGameId),
      `got ${createRes.status}`
    );

    // Create a private game lobby with custom word
    const createPrivateRes = await call('/api/games/create', {
      method: 'POST',
      token: hostToken,
      body: privateGamePayload,
    });
    createdPrivateGameId = createPrivateRes.data.data.id;
    createdPrivateGameJoinCode = createPrivateRes.data.data.joinCode;
    check(
      'POST /api/games creates a private game (201 + id)',
      createPrivateRes.status === 201 && Boolean(createdPrivateGameId),
      `got ${createPrivateRes.status}`
    );

    // Create a solo game lobby
    const createSoloRes = await call('/api/games/create', {
      method: 'POST',
      token: hostToken,
      body: soloGamePayload,
    });
    createdSoloGameId = createSoloRes.data.data.id;
    check(
      'POST /api/games creates a private game (201 + id)',
      createSoloRes.status === 201 && Boolean(createdSoloGameId),
      `got ${createSoloRes.status}`
    );

    // Player 2 joins the public game
    if (createdGameId) {
      const joinRes = await call(`/api/games/join`, {
        method: 'POST',
        token: p2Token,
        body: { gameId: createdGameId },
      });
      check('POST /api/games/:id/join allows player 2 to join public game', joinRes.status === 200 || joinRes.status === 201, `got ${joinRes.status}`);
    }

    // Player 2 joins private game
    if (createPrivateRes) {
        const joinPrivateRes = await call(`/api/games/join`, {
            method: 'POST',
            token: p2Token,
            body: { 
                gameId: createdPrivateGameId, 
                joinCode: createPrivateRes.data.data.joinCode
            } 
        });
        check('POST /api/games/:id/join allows player 2 to join private game', joinPrivateRes.status === 200 || joinPrivateRes.status === 201, `got ${joinPrivateRes.status}`);
    }

    // Player 2 tries to join solo game
    if (createSoloRes) {
        const joinSoloRes = await call(`/api/games/join`, {
            method: 'POST',
            token: p2Token,
            body: {
                gameId: createdSoloGameId, 
            }
        });
        check('POST /api/games/:id/join does not allow player 2 to join solo game', joinSoloRes.status === 403, `got ${joinSoloRes.status}`);
    }

    // List public games
    const listRes = await call('/api/games', { token: p2Token });
    const gamesList = Array.isArray(listRes.data.data) 
        ? listRes.data.data 
        : listRes.data.games || [];
    check(
      'GET /api/games lists the new open game',
      listRes.status === 200 && gamesList.some((g) => g.id === createdGameId),
      `got ${listRes.status}`
    );

    // Get public game status
    const statusRes = await call(`/api/games/${createdGameId}`);
    check('GET /api/games/:id returns game status', statusRes.status === 200, `got ${statusRes.status}`);

    // Get drawings of joined game
    const drawingRes = await call(`/api/games/${createdGameId}/drawings`, { token: hostToken });
    check('GET /api/games/:id/drawings', drawingRes.status === 200, `got ${drawingRes.status}`);

    // Get votes of joined game
    const voteRes = await call(`/api/games/${createdGameId}/votes`, { token: hostToken });
    check('GET /api/games/:id/votes', voteRes.status === 200, `got ${voteRes.status}`);

    // Get game from join code
    const joinCodeRes = await call(`/api/games/code/${createdPrivateGameJoinCode}`, { token: p2Token });
    check(`Get /api/games/code/:joincode returns game`, joinCodeRes.status === 200, `got ${joinCodeRes.status}`);

    // update the game
    if (createdGameId) {
        // Non-host
        const nonHostUpdate = await call(`/api/games/${createdGameId}`, {
            method: 'PATCH', 
            token: p2Token,
            body: { lobbyName: "This should not work"},
        });
        check(
            'PATCH /api/games/:id block non host from updating game (403)',
            nonHostUpdate.status === 403, `got ${nonHostUpdate.status}`
        );
        // Host
        const updateRes = await call(`/api/games/${createdGameId}`, {
            method: 'PATCH',
            token: hostToken,
            body: updatePayload
        });
        check(
            'PATCH /api/games/:id host updates game (200)',
            updateRes.status === 200, `got ${updateRes.status}`
        );
        // Check game fields
        const updatedGame = await prisma.game.findUnique({
            where: { id: createdGameId},
        });
        check(
            'checking game fields updated correctly',
            updatedGame.lobbyName === "Updated name" &&
            updatedGame.pictionaryWord === "Triangle" &&
            updatedGame.status === "COMPLETED" &&
            updatedGame.maxParticipants === 2000 
        );
    }

    // Verify 404 notFound middleware
    const missingRoute = await call('/api/games/nonexistent/route-check', { token: hostToken });
    check(
      'unknown route triggers 404 notFound middleware',
      missingRoute.status === 404 && missingRoute.data.error === 'Route not found',
      `got ${missingRoute.status}`
    );
  } finally {
    // Delete the game first so foreign key constraints don't block user deletion
    await prisma.game.deleteMany({
      where: { 
        lobbyName: {
            in: [
                'Public Lobby With Easy Word',
                'Private Lobby With Custom Word',
                'Solo Lobby With Hard Word',
            ]
        } 
      },
    }).catch(() => {});
    await prisma.user.deleteMany({ where: { email: { contains: run } } });
    await prisma.$disconnect();
    server.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});