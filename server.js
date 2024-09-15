const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());
const port = 3000;
const cors = require('cors');
const allowedOrigins = ['http://127.0.0.1:3001', 'https://onrender.com', 'http://127.0.0.1:3000', 'https://dadobonzio.github.io'];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error('Not allowed by CORS: ' + origin));
        }
    }
}));
//{"name": "Game1", "p": [{"name":"player1", "score": 0}, {"name":"player2", "score": 0}]}

app.get('/games', (req, res) => {
    validateDir();
    res.json(getGames());
});

app.get('/game', (req, res) => {
    const { game } = req.query;
    res.json(getGame(game));
})

app.get('/game/player', (req, res) => {
    const { game, player } = req.query;
    res.json(getPlayerScore(game, player));
})

app.post('/game', (req, res) => {
    var game = req.body;
    res.json(setGame(game));
})

app.post('/game/player', (req, res) => {
    validateDir();
    const { game, player, score } = req.query;
    res.json(setPlayerScore(game, player, score));
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

function validateDir() {
    if (!fs.existsSync("./games")) {
        fs.mkdirSync("./games");
    }
}

function getGames() {
    var games = fs.readdirSync("./games");
    var gamejs = [];
    games.forEach(game => {
        gamejs.push(JSON.parse(fs.readFileSync("./games/" + game, 'utf8')));
    });
    return gamejs;
}

function getGame(game) {
    if (!fs.existsSync("./games/" + game + ".json", 'utf8'))
        return null;
    return JSON.parse(fs.readFileSync("./games/" + game + ".json", 'utf8'));
}

function getPlayerScore(game, player) {
    var gamejs = getGames().filter(g => g.name === game)[0];
    if (!gamejs)
        return null;
    var player = gamejs.p.filter(p => p.name === player)[0];
    if (!player)
        return null;
    return player.score;
}

function setGame(game) {
    validateDir();
    fs.writeFileSync("./games/" + game.name + ".json", JSON.stringify(game));
    return getGame(game.name);
}

function setPlayerScore(game, player, score) {
    var gamejs = getGame(game);
    if (!gamejs) {
        setGame({ name: game, p: [{ name: player, score: score }] });
        return;
    }
    var playerjs = gamejs.p.filter(p => p.name === player)[0];
    if (!playerjs) {
        gamejs.p.push({ name: player, score: score });
    }
    else {
        playerjs.score = score;
    }
    return setGame(gamejs);
}