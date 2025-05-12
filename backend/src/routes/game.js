import express from 'express';
import { placeBet, initGame, selectRoom, testJoin, testMoveTo, testMoveBack } from '../controllers/game.js';
import { protect } from '../utils/auth.js';

const router = express.Router();
//初始化游戏信息
router.post('/init', initGame);

router.post('/bet', protect, placeBet);
router.post('/selectRoom', protect, selectRoom);


router.get('/testJoin/:id', testJoin);
router.get('/testMoveTo/:id', testMoveTo);
router.get('/testMoveBack', testMoveBack);

export default router;