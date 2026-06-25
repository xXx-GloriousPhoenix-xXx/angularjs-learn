const path = require('path');
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./src/routes/auth.routes');
const accountRoutes = require('./src/routes/account.routes');
const postRoutes = require('./src/routes/post.routes');
const { IMAGES_DIR } = require('./src/utils/avatar-upload');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/account/me/avatar', express.static(IMAGES_DIR));

// ─── Swagger ──────────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mock Server API',
            version: '1.0.0',
            description: 'File-backed mock server with auth, account, and post endpoints',
        },
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer' },
            },
            schemas: {
                Profile: {
                    type: 'object',
                    properties: {
                        id:                  { type: 'string' },
                        username:            { type: 'string', example: 'james_smith1' },
                        avatarUrl:           { type: 'string', format: 'uri', nullable: true },
                        subscriptionsAmount: { type: 'integer', example: 42 },
                        firstName:           { type: 'string', example: 'James' },
                        lastName:            { type: 'string', example: 'Smith' },
                        description:         { type: 'string' },
                        isActive:            { type: 'boolean' },
                        stack:               { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js'] },
                        city:                { type: 'string', example: 'New York' },
                        registerDate:        { type: 'string', format: 'date' },
                    },
                },
                Post: {
                    type: 'object',
                    properties: {
                        id:           { type: 'string', example: 'post-1719234000-42' },
                        authorId:     { type: 'string', example: 'james_smith1' },
                        author:       { $ref: '#/components/schemas/Profile' },
                        content:      { type: 'string', example: 'Just shipped a new feature!' },
                        parentId:     { type: 'string', nullable: true, example: null },
                        likesCount:   { type: 'integer', example: 5 },
                        isLikedByMe:  { type: 'boolean' },
                        repliesCount: { type: 'integer', example: 3 },
                        createdAt:    { type: 'string', format: 'date-time' },
                    },
                },
                TokenPair: {
                    type: 'object',
                    properties: {
                        access_token:  { type: 'string' },
                        refresh_token: { type: 'string' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                    },
                },
            },
        },
    },
    apis: ['./src/docs/*.js'], // <-- swagger comments now live here, not in routes
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/account', accountRoutes);
app.use('/posts', postRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`  Swagger UI: http://localhost:${PORT}/docs`);
    console.log(`  POST   http://localhost:${PORT}/auth/register`);
    console.log(`  POST   http://localhost:${PORT}/auth/login`);
    console.log(`  POST   http://localhost:${PORT}/auth/refresh`);
    console.log(`  POST   http://localhost:${PORT}/auth/logout`);
    console.log(`  GET    http://localhost:${PORT}/account/me            (auth required)`);
    console.log(`  PATCH  http://localhost:${PORT}/account/me            (auth required)`);
    console.log(`  POST   http://localhost:${PORT}/account/me/avatar     (auth required)`);
    console.log(`  GET    http://localhost:${PORT}/account/accounts      (auth required)`);
    console.log(`  GET    http://localhost:${PORT}/posts                 (auth required)`);
    console.log(`  POST   http://localhost:${PORT}/posts                 (auth required)`);
    console.log(`  POST   http://localhost:${PORT}/posts/:id/like        (auth required)`);
    console.log(`  DELETE http://localhost:${PORT}/posts/:id/like        (auth required)`);
});