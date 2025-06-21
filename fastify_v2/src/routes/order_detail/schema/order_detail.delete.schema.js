const deleteOrderDetailSchema = {
    description: 'Delete an order detail',
    tags: ['order_detail'],
    summary: 'Delete an order detail',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                deleted: { 
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        order: { type: 'string' },
                        product: { type: 'string' },
                        quantity: { type: 'number' },
                        price: { type: 'number' },
                        name: { type: 'string' },
                        subtotal: { type: 'number' }
                    }
                }
            },
            example: {
                success: true,
                message: 'Order detail deleted successfully'
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
                message: 'Invalid ID format'
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
                message: 'Order detail not found'
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

module.exports = deleteOrderDetailSchema;