const getAllBrandsSchema = {
    description: 'Get all brands',
    tags: ['brand'],
    summary: 'Get all brands',
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    slug: { type: 'string' },
                    description: { type: 'string' },
                    logo: { type: 'string' },
                    website: { type: 'string' },
                    country_of_origin: { type: 'string' },
                    founded_year: { type: 'number' },
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

module.exports = getAllBrandsSchema;