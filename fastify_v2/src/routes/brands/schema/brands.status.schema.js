const updateBrandStatusSchema = {
    description: 'Update status of a brand',
    tags: ['brand'],
    summary: 'Update status of a brand',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Brand ID' }
        }
    },
    body: {
        type: 'object',
        required: ['status'],
        properties: {
            status: { type: 'number', enum: [0, 1] }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                status: { type: 'number' }
            }
        },
        400: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            }
        },
        404: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            }
        },
        500: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            }
        }
    }
};

module.exports = updateBrandStatusSchema;
