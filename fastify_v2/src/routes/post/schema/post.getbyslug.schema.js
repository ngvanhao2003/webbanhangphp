const getBySlugSchema = {
    description: 'Get details of a single post by slug',
    tags: ['post'],
    summary: 'Retrieve a single post by slug',
    params: {
        type: 'object',
        required: ['slug'],
        properties: {
            slug: { type: 'string', description: 'Post slug' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                slug: { type: 'string' },
                summary: { type: 'string' },
                content: { type: 'string' },
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
                message: 'Post not found'
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