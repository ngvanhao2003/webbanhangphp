const getBySlugSchema = {
    description: 'Get details of a single topic by slug',
    tags: ['topic'],
    summary: 'Retrieve a single topic by slug',
    params: {
        type: 'object',
        required: ['slug'],
        properties: {
            slug: { type: 'string', description: 'Topic slug' }
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

module.exports = getBySlugSchema;