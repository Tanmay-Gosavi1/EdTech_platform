const express = require('express');
const aiRouter = express.Router();

const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { askCourseDoubt } = require('../controllers/aiController.js');

aiRouter.post('/doubt', authMiddleware, askCourseDoubt);

module.exports = aiRouter;
