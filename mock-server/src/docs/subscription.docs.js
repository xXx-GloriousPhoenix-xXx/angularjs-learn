/**
 * @openapi
 * /subscribers:
 * get:
 * tags: [Subscribers]
 * summary: Get a list of my subscribers
 * description: Returns profiles of users who are following the currently authenticated user.
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: List of subscribers profiles
 * content:
 * application/json:
 * schema:
 * type: array
 * items: { $ref: '#/components/schemas/Profile' }
 * 401:
 * description: Unauthorized
 * content:
 * application/json:
 * schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /subscribers/following:
 * get:
 * tags: [Subscribers]
 * summary: Get a list of users I am following
 * description: Returns profiles of users whom the currently authenticated user follows.
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: List of following users profiles
 * content:
 * application/json:
 * schema:
 * type: array
 * items: { $ref: '#/components/schemas/Profile' }
 * 401:
 * description: Unauthorized
 * content:
 * application/json:
 * schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /subscribers/{username}:
 * post:
 * tags: [Subscribers]
 * summary: Subscribe to a user
 * description: Subscribes the current authenticated user to the user specified by username.
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: username
 * required: true
 * schema: { type: string }
 * description: Username of the user to subscribe to.
 * responses:
 * 200:
 * description: Successfully subscribed. Returns the updated profile of the followed user.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * profile: { $ref: '#/components/schemas/Profile' }
 * 400:
 * description: Bad request (e.g., trying to subscribe to yourself)
 * content:
 * application/json:
 * schema: { $ref: '#/components/schemas/Error' }
 * 401:
 * description: Unauthorized
 * content:
 * application/json:
 * schema: { $ref: '#/components/schemas/Error' }
 * 404:
 * description: User not found
 * content:
 * application/json:
 * schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @openapi
 * /subscribers/{username}:
 * delete:
 * tags: [Subscribers]
 * summary: Unsubscribe from a user
 * description: Unsubscribes the current authenticated user from the user specified by username.
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: username
 * required: true
 * schema: { type: string }
 * description: Username of the user to unsubscribe from.
 * responses:
 * 200:
 * description: Successfully unsubscribed. Returns the updated profile of the unfollowed user.
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * success: { type: boolean, example: true }
 * profile: { $ref: '#/components/schemas/Profile' }
 * 400:
 * description: Bad request
 * content:
 * application/json:
 * schema: { $ref: '#/components/schemas/Error' }
 * 401:
 * description: Unauthorized
 * content:
 * application/json:
 * schema: { $ref: '#/components/schemas/Error' }
 * 404:
 * description: User not found
 * content:
 * application/json:
 * schema: { $ref: '#/components/schemas/Error' }
 */