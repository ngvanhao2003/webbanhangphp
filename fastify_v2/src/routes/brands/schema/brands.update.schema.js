const updateBrandSchema = {
    description: 'Update one brand',
    tags: ['brand'],
    summary: 'Update one brand',
    consumes: ['multipart/form-data'], // <-- Cực kỳ quan trọng
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    // body: {
    //     type: 'object',
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
                message: 'Invalid query parameters'
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
                message: 'Brand not found'
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
                message: 'Internal server error'
            }
        }
    }
};

module.exports = updateBrandSchema;