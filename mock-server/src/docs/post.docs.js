/**
 * @openapi
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get posts (top-level feed, or replies to a specific post)
 *     description: |
 *       Omit `parentId` to get top-level feed posts. Pass `parentId` to get
 *       the DIRECT replies to that post only (not the whole nested tree —
 *       the client recursively calls this again for any reply that itself
 *       has repliesCount > 0).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema: { type: string }
 *         description: If provided, returns direct replies to this post id. Omit for top-level feed posts.
 *       - in: query
 *         name: pageNum
 *         schema: { type: integer, default: 1, minimum: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Post' }
 *                 itemCount: { type: integer, example: 15 }
 *                 pageNum:   { type: integer, example: 1 }
 *                 pageSize:  { type: integer, example: 10 }
 *                 pageCount: { type: integer, example: 2 }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post, or a reply to an existing post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 example: Just shipped a new feature!
 *               parentId:
 *                 type: string
 *                 nullable: true
 *                 description: Omit or set to null for a top-level post; set to a post id to create a reply.
 *     responses:
 *       201:
 *         description: The created post
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Post' }
 *       400:
 *         description: Missing content, or parentId does not exist
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
 * /posts/{id}/like:
 *   post:
 *     tags: [Posts]
 *     summary: Like a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated post with new like state
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Post' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /posts/{id}/like:
 *   delete:
 *     tags: [Posts]
 *     summary: Unlike a post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated post with new like state
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Post' }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */