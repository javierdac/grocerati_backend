require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('../config/db');

const app = express();

app.use(cors());
app.use(express.json());

// DB connection middleware (cached for serverless)
let isConnected = false;
app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos, intenta de nuevo en 15 minutos' },
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

app.use('/auth', require('../routes/auth'));
app.use('/lists', require('../routes/lists'));

app.get('/', (req, res) => res.json({ message: 'Grocerati API' }));

module.exports = app;
