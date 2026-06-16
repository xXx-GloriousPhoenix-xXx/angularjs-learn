const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ─── In-memory stores ────────────────────────────────────────────────────────
const users         = new Map(); // username     -> { username, email, passwordHash }
const accessTokens  = new Map(); // accessToken  -> username
const refreshTokens = new Map(); // refreshToken -> username

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function issueTokenPair(username) {
    const access_token  = generateToken();
    const refresh_token = generateToken();
    accessTokens.set(access_token, username);
    refreshTokens.set(refresh_token, username);
    return { access_token, refresh_token };
}

// ─── Profile data ─────────────────────────────────────────────────────────────
const firstNames   = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const lastNames    = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const cities       = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
const allStacks    = ['Python', 'Docker', 'Django', 'TypeScript', 'Angular', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Kubernetes', 'Go', 'Rust', 'Java', 'Spring', 'MongoDB'];
const descriptions = [
    'The skills list we discussed above is the core of a resume, but it\'s not the only part. You can also tell a little about yourself in the traditional sense — this section can be added to your cover letter.',
    'Passionate developer with a love for clean code and elegant solutions. Always looking for new challenges and opportunities to grow professionally.',
    'Full-stack engineer with experience in building scalable web applications. Open to collaboration and excited about open source projects.',
    'Backend specialist focused on high-performance systems. Enjoy solving complex architectural problems and optimizing database queries.',
    'Frontend enthusiast who cares deeply about UX and accessibility. Believe that great design and great code go hand in hand.',
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset(arr, min = 2, max = 5) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

function generateProfile(id) {
    const firstName = randomItem(firstNames);
    const lastName  = randomItem(lastNames);
    return {
        id,
        username:            `${firstName.toLowerCase()}_${lastName.toLowerCase()}${id}`,
        avatarUrl:           `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        subscriptionsAmount: Math.floor(Math.random() * 1000),
        firstName,
        lastName,
        description:         randomItem(descriptions),
        isActive:            Math.random() > 0.3,
        stack:               randomSubset(allStacks),
        city:                randomItem(cities),
    };
}

// ─── Auth middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
    const raw = req.headers['token'] || req.headers['authorization'];
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

    if (!token || !accessTokens.has(token)) {
        return res.status(401).json({ error: 'Unauthorized: invalid or missing token' });
    }
    req.username = accessTokens.get(token);
    next();
}

// ─── Auth routes ──────────────────────────────────────────────────────────────
const authRouter = express.Router();

// POST /auth/register — { username, email, password }
authRouter.post('/register', (req, res) => {
    console.debug('/register request');
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'username, email and password are required' });
    }

    if (users.has(username)) {
        return res.status(409).json({ error: 'Username already taken' });
    }

    users.set(username, { username, email, passwordHash: hashPassword(password) });

    return res.status(201).json({ message: 'User registered successfully' });
});

// POST /auth/login — { username, password } → { access_token, refresh_token }
authRouter.post('/login', (req, res) => {
    console.debug('/login request');
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'username and password are required' });
    }

    const user = users.get(username);
    if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    return res.json(issueTokenPair(username));
});

// POST /auth/refresh — { refresh_token } → { access_token, refresh_token }
authRouter.post('/refresh', (req, res) => {
    console.debug('/refresh request');
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: 'refresh_token is required' });
    }

    const username = refreshTokens.get(refresh_token);
    if (!username) {
        return res.status(401).json({ error: 'Invalid or expired refresh_token' });
    }

    refreshTokens.delete(refresh_token);

    return res.json(issueTokenPair(username));
});

// POST /auth/logout — header: token
authRouter.post('/logout', requireAuth, (req, res) => {
    console.debug('/logout request');
    const token = req.headers['token'] || req.headers['authorization'];
    accessTokens.delete(token);
    return res.json({ message: 'Logged out successfully' });
});

app.use('/auth', authRouter);

// ─── Account routes ───────────────────────────────────────────────────────────
const accountRouter = express.Router();

accountRouter.get('/test_account', (req, res) => {
    console.debug('/account/test_account request');
    const profiles = Array.from({ length: 5 }, (_, i) => generateProfile(i + 1));
    res.json(profiles);
});

accountRouter.get('/:id', (req, res) => {
    console.debug('/account/:id request');
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    res.json(generateProfile(id));
});

accountRouter.get('/me', requireAuth, (req, res) => {
    console.debug('/account/me request');
    const user = users.get(req.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(generateProfile(req.username));
});

app.use('/account', accountRouter);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`  GET  http://localhost:${PORT}/account/test_account`);
    console.log(`  POST http://localhost:${PORT}/auth/register`);
    console.log(`  POST http://localhost:${PORT}/auth/login`);
    console.log(`  POST http://localhost:${PORT}/auth/refresh`);
    console.log(`  POST http://localhost:${PORT}/auth/logout`);
});