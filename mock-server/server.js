const express      = require('express');
const cors         = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const authRouter    = require('./src/routes/auth');
const accountRouter = require('./src/routes/account');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ─── Swagger ──────────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title:       'Mock Server API',
            version:     '1.0.0',
            description: 'In-memory mock server with auth and account endpoints',
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
                        avatarUrl:           { type: 'string', format: 'uri' },
                        subscriptionsAmount: { type: 'integer', example: 42 },
                        firstName:           { type: 'string', example: 'James' },
                        lastName:            { type: 'string', example: 'Smith' },
                        description:         { type: 'string' },
                        isActive:            { type: 'boolean' },
                        stack:               { type: 'array', items: { type: 'string' }, example: ['React', 'Node.js'] },
                        city:                { type: 'string', example: 'New York' },
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
    apis: ['./src/routes/*.js'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth',    authRouter);
app.use('/account', accountRouter);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`  Swagger UI: http://localhost:${PORT}/docs`);
    console.log(`  GET  http://localhost:${PORT}/account/test_account`);
    console.log(`  GET  http://localhost:${PORT}/account/subscribers  (auth required)`);
    console.log(`  POST http://localhost:${PORT}/auth/register`);
    console.log(`  POST http://localhost:${PORT}/auth/login`);
    console.log(`  POST http://localhost:${PORT}/auth/refresh`);
    console.log(`  POST http://localhost:${PORT}/auth/logout`);
});