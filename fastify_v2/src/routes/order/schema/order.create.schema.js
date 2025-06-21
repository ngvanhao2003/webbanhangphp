const createOrderSchema = {
    description: 'Create a new order',
    tags: ['order'],
    summary: 'Create a new order',
    body: {
        type: 'object',
        required: ['customer', 'items', 'paymentMethod'],
        properties: {
            customer: {
                type: 'object',
                required: ['name', 'email', 'phone', 'address'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    address: { type: 'string' }
                }
            },
            items: {
                type: 'array',
                minItems: 1,
                items: {
                    type: 'object',
                    required: ['product', 'quantity'],
                    properties: {
                        product: { type: 'string' },
                        quantity: { type: 'number', minimum: 1 }
                    }
                }
            },
            paymentMethod: { 
                type: 'string', 
                enum: ['cash', 'credit_card', 'bank_transfer'] 
            },
            shippingMethod: { type: 'string' },
            notes: { type: 'string' }
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

module.exports = createOrderSchema;