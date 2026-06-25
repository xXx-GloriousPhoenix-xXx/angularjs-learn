const { Router } = require('express');
const profileService = require('../services/profile.service');
const profileSearchService = require('../services/profile-search.service');
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../utils/avatar-upload');

const router = Router();

router.get('/me', requireAuth, (req, res) => {
    const profile = profileService.getOrCreateProfile(req.username);
    res.json(profile);
});

router.patch('/me', requireAuth, (req, res) => {
    const updated = profileService.patchProfile(req.username, req.body || {});
    res.json(updated);
});

router.post('/me/avatar', requireAuth, (req, res) => {
    uploadAvatar.single('avatar')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded (expected field name "avatar")' });
        }

        const avatarUrl = `${req.protocol}://${req.get('host')}/account/me/avatar/${req.file.filename}`;
        const updated = profileService.patchProfile(req.username, { avatarUrl });

        res.json(updated);
    });
});

router.get('/accounts', requireAuth, (req, res) => {
    const result = profileSearchService.filterProfiles({
        ...req.query,
        excludeUsername: req.username,
    });
    res.json(result);
});

module.exports = router;