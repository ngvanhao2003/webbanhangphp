const updateOrderStatusSchema = {
    description: 'Update order status',
    tags: ['order'],
    summary: 'Update order status',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        required: ['status'],
        properties: {
            status: { 
                type: 'string',
                enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
            }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                status: { type: 'string' },
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
                message: 'Invalid status value'
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
                message: 'Order not found'
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

module.exports = updateOrderStatusSchema;