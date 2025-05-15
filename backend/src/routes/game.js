import express from 'express';
import { placeBet, initGame, selectRoom,getGameRewards, testJoin, testMoveTo, testMoveBack, testGameEnd,testCalculateRewards } from '../controllers/game.js';
import { protect } from '../utils/auth.js';

const router = express.Router();
//初始化游戏信息
router.post('/init', initGame);

router.post('/bet', protect, placeBet);
router.post('/selectRoom', protect, selectRoom);
// router.post('/game_rewards', protect, getGameRewards);
router.post('/game_rewards', getGameRewards);


router.get('/testJoin/:id', testJoin);
router.get('/testMoveTo/:id', testMoveTo);
router.get('/testMoveBack', testMoveBack);
router.get('/testGameEnd', testGameEnd);
router.get('/testCalculateRewards', testCalculateRewards);

export default router;