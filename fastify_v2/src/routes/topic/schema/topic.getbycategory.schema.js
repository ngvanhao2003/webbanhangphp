const getByCategorySchema = {
    description: 'Get topics by category ID',
    tags: ['topic'],
    summary: 'Retrieve topics belonging to a specific category',
    params: {
        type: 'object',
        required: ['categoryId'],
        properties: {
            categoryId: { type: 'string', description: 'Category ID' }
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
                message: 'Invalid category ID format'
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

module.exports = getByCategorySchema;