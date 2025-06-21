const createOrderDetailSchema = {
    description: 'Create a new order detail',
    tags: ['order_detail'],
    summary: 'Create a new order detail',
    body: {
        type: 'object',
        required: ['product', 'quantity', 'price', 'name', 'size'],  // Đảm bảo size là bắt buộc
        properties: {
        product: { type: 'string' },
        quantity: { type: 'number', minimum: 1 },
        price: { type: 'number' },
        name: { type: 'string' },
        size: { type: 'string' },  // size là trường bắt buộc
        subtotal: { type: 'number' },
        paymentMethod: { type: 'string' },
        },
    },
    response: {
        200: {  
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

module.exports = createOrderDetailSchema;