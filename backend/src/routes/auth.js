import express from 'express';
import {register,login} from '../controllers/auth.js';
import { protect } from '../utils/auth.js';

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;