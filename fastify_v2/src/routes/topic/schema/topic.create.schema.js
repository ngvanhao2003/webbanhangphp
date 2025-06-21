const createTopicSchema = {
    description: 'Create a new topic',
    tags: ['topic'],
    summary: 'Create a new topic',
    body: {
        type: 'object',
        required: ['title', 'slug', 'content', 'author', 'status'],
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

module.exports = createTopicSchema;