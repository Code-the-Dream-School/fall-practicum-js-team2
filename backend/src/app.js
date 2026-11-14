const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const helloRoutes = require('./routes/hello.routes');
const gameRouter = require("./routes/game.routes");

const app = express();

// Security & best‑practice middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.use('/api/hello', helloRoutes);
app.use('/api/games', gameRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

module.exports = app;
