const getByOrderSchema = {
    description: 'Get order details by order ID',
    tags: ['order_detail'],
    summary: 'Get order details by order ID',
    params: {
        type: 'object',
        required: ['orderId'],
        properties: {
            orderId: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    order: { type: 'string' },
                    product: { type: 'string' },
                    quantity: { type: 'number' },
                    price: { type: 'number' },
                    size: { type: 'string' }, // Added size field
                    name: { type: 'string' },
                    subtotal: { type: 'number' },
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
                message: 'Invalid order ID format'
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
                message: 'No order details found for this order'
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

module.exports = getByOrderSchema;