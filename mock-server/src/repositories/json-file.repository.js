const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'json');

/**
 * Reads a JSON file from data/json/<filename>. Returns `fallback` if the
 * file doesn't exist yet (first run) — this is the ONLY place that should
 * know about the on-disk file layout. Services and routes never touch
 * fs directly.
 */
function readJsonFile(filename, fallback) {
    const filePath = path.join(DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return fallback;
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : fallback;
}

/**
 * Writes data back to data/json/<filename>, creating the data directory
 * if it doesn't exist yet.
 */
function writeJsonFile(filename, data) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
    readJsonFile,
    writeJsonFile,
};