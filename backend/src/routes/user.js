const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const validator = require('../middlewares/validator');

// 验证中间件示例
const createUserSchema = {
  body: {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 3 },
      email: { type: 'string', format: 'email' }
    },
    required: ['username', 'email']
  }
};

router.get('/status', protect, getGameStatus);

module.exports = router;