require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required in .env');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos, intenta de nuevo en 15 minutos' },
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

app.set('io', io);

app.use('/auth', require('./routes/auth'));
app.use('/lists', require('./routes/lists'));

app.get('/', (req, res) => res.json({ message: 'Grocerati API' }));

io.on('connection', (socket) => {
  socket.on('join-list', (listId) => {
    socket.join(`list:${listId}`);
  });
  socket.on('leave-list', (listId) => {
    socket.leave(`list:${listId}`);
  });
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
