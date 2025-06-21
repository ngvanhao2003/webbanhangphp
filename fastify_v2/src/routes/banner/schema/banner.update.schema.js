const updateBannerSchema = {
    description: 'Update one banner',
    tags: ['banner'],
    summary: 'Update one banner',
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
    //         title: { type: 'string' },
    //         image: { type: 'string' },
    //         link_url: { type: 'string' },
    //         position: { type: 'number' },
    //         status: { type: 'number' }
    //     }
    // },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                image_url: { type: 'string' },
                link_url: { type: 'string' },
                position: { type: 'number' },
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
                message: 'Internal server error'
            }
        }
    }
};

module.exports = updateBannerSchema;