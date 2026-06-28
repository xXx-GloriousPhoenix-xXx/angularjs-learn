const { Router } = require('express');
const chatService = require('../services/chat.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.get('/', requireAuth, (req, res) => {
    try {
        const chats = chatService.getUserChats(req.username);
        res.json(chats);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.post('/:username', requireAuth, (req, res) => {
    try {
        const chat = chatService.getOrCreateChat(req.username, req.params.username);
        // Возвращаем чат (можно просто id)
        res.json({ chatId: chat.id, participants: chat.participants });
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.get('/:chatId/messages', requireAuth, (req, res) => {
    try {
        const page = chatService.getMessages(
            req.params.chatId,
            parseInt(req.query.pageNum, 10) || 1,
            parseInt(req.query.pageSize, 10) || 50
        );
        res.json(page);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.post('/:chatId/messages', requireAuth, (req, res) => {
    try {
        const { text } = req.body || {};
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Message text is required' });
        }
        const message = chatService.sendMessage(req.params.chatId, req.username, text);
        res.status(201).json(message);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

module.exports = router;