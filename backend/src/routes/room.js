
import express from 'express';
import { getRooms, joinRoom, leaveRoom } from '../controllers/room.js';
import { protect } from '../utils/auth.js';

const router = express.Router();
router.get('/', getRooms);
router.post('/join', protect, joinRoom);
router.post('/leave', protect, leaveRoom);

export default router;