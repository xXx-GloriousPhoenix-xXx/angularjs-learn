const fs     = require('fs');
const path   = require('path');
const multer = require('multer');

const IMAGES_DIR = path.join(__dirname, '..', 'data', 'images');

function ensureImagesDir() {
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
}
ensureImagesDir();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureImagesDir();
        cb(null, IMAGES_DIR);
    },
    filename: (req, file, cb) => {
        // req.username is set by requireAuth, which always runs before this middleware.
        const ext = path.extname(file.originalname) || '.jpg';
        const safeName = `${req.username}-${Date.now()}${ext}`;
        cb(null, safeName);
    },
});

function imageFileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
}

const uploadAvatar = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB cap
});

module.exports = { uploadAvatar, IMAGES_DIR };