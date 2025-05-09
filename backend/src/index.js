import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { initSocketServer } from './websocket/socketHandler.js';
import http from 'http';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/room.js';
import gameRoutes from './routes/game.js';

const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/game', gameRoutes);

initSocketServer(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket running on: ws://localhost:${PORT}`);
});
