const createBrandSchema = {
    description: 'Create a new brand',
    tags: ['brand'],
    summary: 'Create a new brand',
    consumes: ['multipart/form-data'], // <-- Cực kỳ quan trọng
    // body: {
    //     type: 'object',
    //     required: ['name', 'slug', 'status'],
    //     properties: {
    //         name: { type: 'string' },
    //         slug: { type: 'string' },
    //         description: { type: 'string' },
    //         logo: { type: 'string' },
    //         website: { type: 'string' },
    //         country_of_origin: { type: 'string' },
    //         founded_year: { type: 'number' },
    //         status: { type: 'number' }
    //     }
    // },
    response: {
        200: {
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

module.exports = createBrandSchema;