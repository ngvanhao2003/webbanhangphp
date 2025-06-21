const deleteOrderSchema = {
    description: 'Delete an order',
    tags: ['order'],
    summary: 'Delete an order',
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
                        customer: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                email: { type: 'string' }
                            }
                        },
                        totalAmount: { type: 'number' },
                        status: { type: 'string' }
                    }
                }
            },
            example: {
                success: true,
                message: 'Order deleted successfully'
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

module.exports = deleteOrderSchema;