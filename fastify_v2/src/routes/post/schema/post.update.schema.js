const updatePostSchema = {
    description: 'Update a post',
    tags: ['post'],
    summary: 'Update an existing post',
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
            summary: { type: 'string' },
            featured_image: { type: 'string' },
            author: { type: 'string' },
            categories: { 
                type: 'array',
                items: { type: 'string' }
            },
            tags: { 
                type: 'array',
                items: { type: 'string' }
            },
            status: { 
                type: 'string',
                enum: ['draft', 'published', 'archived']
            },
            is_featured: { type: 'boolean' }
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

module.exports = updatePostSchema;