import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { initSocketServer } from './websocket/socketHandler.js';
import http from 'http';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/room.js';
import gameRoutes from './routes/game.js';
import cron from 'node-cron';
import { addBotToRoom, addBotToWait } from './bot.js';
import { initUserInfo } from './user.js';

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

// 每秒执行的任务
let isTaskRunning = false;
// cron.schedule('*/5 * * * * *', async () => {
//   if (isTaskRunning) {
//     console.log('上次任务尚未完成，跳过本次执行');
//     return;
//   }

//   isTaskRunning = true;
//   const startTime = Date.now();
//   try {
//     console.log('任务开始:', new Date().toLocaleTimeString());
//     await addBotToRoom();
//   } catch (error) {
//     console.error('任务执行失败:', error);
//   } finally {
//     isTaskRunning = false;
//     console.log(`添加机器人到room，任务完成，耗时 ${Date.now() - startTime}ms`);
//   }
// });

let isTaskRunningWait = false;
cron.schedule('*/2 * * * * *', async () => {
  if (isTaskRunningWait) {
    console.log('上次任务尚未完成，跳过本次执行');
    return;
  }

  isTaskRunningWait = true;
  const startTime = Date.now();
  try {
    console.log('任务开始:', new Date().toLocaleTimeString());
    await addBotToWait();
  } catch (error) {
    console.error('任务执行失败:', error);
  } finally {
    isTaskRunningWait = false;
    console.log(`添加机器人到等待区，任务完成，耗时 ${Date.now() - startTime}ms`);
  }
});

initUserInfo();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket running on: ws://localhost:${PORT}`);
});
