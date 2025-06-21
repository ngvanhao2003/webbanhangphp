const getAllOrderDetailsSchema = {
    description: 'Get all order details',
    tags: ['order_detail'],
    summary: 'Get all order details',
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

module.exports = getAllOrderDetailsSchema;