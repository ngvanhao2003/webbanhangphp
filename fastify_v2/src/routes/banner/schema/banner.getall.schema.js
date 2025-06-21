const getAllBannersSchema = {
    description: 'Get all banners',
    tags: ['banner'],
    summary: 'Get all banners',
    response: {
        200: {
            type: 'array',
            items: {
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
                message: 'Invalid query parameters'
            }
        }
    }
};

module.exports = getAllBannersSchema;