const getOneOrderSchema = {
    description: 'Get details of a single order by ID',
    tags: ['order'],
    summary: 'Retrieve a single order by ID',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'Order ID' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                customer: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        address: { type: 'string' }
                    }
                },
                items: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            product: { type: 'string' },
                            quantity: { type: 'number' },
                            price: { type: 'number' },
                            name: { type: 'string' }
                        }
                    }
                },
                totalAmount: { type: 'number' },
                status: { type: 'string' },
                paymentMethod: { type: 'string' },
                paymentStatus: { type: 'string' },
                shippingMethod: { type: 'string' },
                trackingNumber: { type: 'string' },
                notes: { type: 'string' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
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

module.exports = getOneOrderSchema;