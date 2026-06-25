/**
 * @openapi
 * /account/me:
 *   get:
 *     tags: [Account]
 *     summary: Get current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Profile' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /account/me:
 *   patch:
 *     tags: [Account]
 *     summary: Update current user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:   { type: string }
 *               lastName:    { type: string }
 *               description: { type: string }
 *               stack:
 *                 type: array
 *                 items: { type: string }
 *               city:        { type: string }
 *               avatarUrl:   { type: string }
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Profile' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /account/me/avatar:
 *   post:
 *     tags: [Account]
 *     summary: Upload (or replace) the current user's avatar image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated profile, including the new avatarUrl
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Profile' }
 *       400:
 *         description: No file uploaded, or file is not an image
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /account/accounts:
 *   get:
 *     tags: [Account]
 *     summary: Search/filter real registered profiles
 *     description: |
 *       The "name" param fuzzily matches firstName, lastName, OR username
 *       (typo-tolerant trigram matching, not just exact substring).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema: { type: string }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: registerDate
 *         schema: { type: string, format: date }
 *         description: Exact match, format YYYY-MM-DD
 *       - in: query
 *         name: stack
 *         schema: { type: string }
 *         description: Comma-separated list of required skills
 *       - in: query
 *         name: pageNum
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated, filtered profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Profile' }
 *                 itemCount: { type: integer, example: 42 }
 *                 pageNum:   { type: integer, example: 1 }
 *                 pageSize:  { type: integer, example: 10 }
 *                 pageCount: { type: integer, example: 5 }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */