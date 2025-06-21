const getOneBannerSchema = {
    description: 'Get details of a single banner by ID',
    tags: ['banner'],
    summary: 'Retrieve a single banner by ID',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Banner ID' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                image: { type: 'string' },
                link_url: { type: 'string' },
                position: { type: 'number' },
                status: { type: 'number' },
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
                message: 'Banner not found'
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

module.exports = getOneBannerSchema;