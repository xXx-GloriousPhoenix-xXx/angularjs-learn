const path = require('path');
const fs = require('fs');
const multer = require('multer');

const IMAGES_DIR = path.join(__dirname, '..', '..', 'data', 'images');

// Make sure the images folder exists before multer tries to write into it
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, IMAGES_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '';
        const uniqueName = `${req.username}-${Date.now()}${ext}`;
        cb(null, uniqueName);
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
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { uploadAvatar, IMAGES_DIR };