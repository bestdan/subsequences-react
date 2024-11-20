const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/', sessionController.createSession);
router.get('/:id', sessionController.getSession);
router.post('/:id/join', sessionController.joinSession);
router.put('/:id/state', sessionController.updateGameState);

module.exports = router; 