const updateTopicSchema = {
    description: 'Update a topic',
    tags: ['topic'],
    summary: 'Update an existing topic',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        properties: {
            title: { type: 'string' },
            slug: { type: 'string' },
            content: { type: 'string' },
            featuredImage: { type: 'string' },
            author: { type: 'string' },
            tags: { 
                type: 'array',
                items: { type: 'string' }
            },
            category: { type: 'string' },
            status: { type: 'number', enum: [0, 1] }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                slug: { type: 'string' },
                content: { type: 'string' },
                featuredImage: { type: 'string' },
                author: { type: 'string' },
                tags: { 
                    type: 'array',
                    items: { type: 'string' }
                },
                category: { type: 'string' },
                status: { type: 'number' },
                viewCount: { type: 'number' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        },
        400: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid request body'
            }
        },
        404: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                statusCode: 404,
                error: 'Not Found',
                message: 'Topic not found'
            }
        },
        500: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'An unexpected error occurred'
            }
        }
    }
};

module.exports = updateTopicSchema;