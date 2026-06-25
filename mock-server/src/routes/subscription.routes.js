const { Router } = require('express');
const subscriptionService = require('../services/subscription.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.get('/', requireAuth, (req, res) => {
    try {
        const page = subscriptionService.getSubscribers(
            req.username, 
            req.query.pageNum, 
            req.query.pageSize
        );
        res.json(page);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.get('/following', requireAuth, (req, res) => {
    try {
        const list = subscriptionService.getFollowing(req.username);
        res.json(list);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.post('/:username', requireAuth, (req, res) => {
    try {
        const updatedProfile = subscriptionService.toggleSubscribe({
            followerUsername: req.username,
            followingUsername: req.params.username,
            subscribe: true
        });
        res.json({ success: true, profile: updatedProfile });
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.delete('/:username', requireAuth, (req, res) => {
    try {
        const updatedProfile = subscriptionService.toggleSubscribe({
            followerUsername: req.username,
            followingUsername: req.params.username,
            subscribe: false
        });
        res.json({ success: true, profile: updatedProfile });
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

router.get('/:username', requireAuth, (req, res) => {
    try {
        const page = subscriptionService.getSubscribers(
            req.params.username,
            req.query.pageNum,
            req.query.pageSize
        );
        res.json(page);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.message });
    }
});

module.exports = router;