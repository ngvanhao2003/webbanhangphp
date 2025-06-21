const searchPostsSchema = {
    description: 'Search posts',
    tags: ['post'],
    summary: 'Search posts by query',
    querystring: {
        type: 'object',
        required: ['q'],
        properties: {
            q: { type: 'string', description: 'Search query' }
        }
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    slug: { type: 'string' },
                    summary: { type: 'string' },
                    featured_image: { type: 'string' },
                    author: { type: 'string' },
                    categories: {
                        type: 'array',
                        items: { type: 'object' }
                    },
                    tags: { 
                        type: 'array',
                        items: { type: 'string' }
                    },
                    status: { type: 'string' },
                    view_count: { type: 'number' },
                    is_featured: { type: 'boolean' },
                    published_at: { type: 'string', format: 'date-time' },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' }
                }
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
                message: 'Search query is required'
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

module.exports = searchPostsSchema;