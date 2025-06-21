const updateCategoryStatusSchema = {
    description: 'Update status of a category',
    tags: ['category'],
    summary: 'Update status of a category',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Category ID' }
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
        }
    }
};

module.exports = updateCategoryStatusSchema;
