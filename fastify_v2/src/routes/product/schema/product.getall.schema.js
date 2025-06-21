const getAllProductSchema = {
    description: 'Get all products',
    tags: ['product'],
    summary: 'Get all products',
    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            detail: { type: 'string' }, // Chi tiết sản phẩm
                            price: { type: 'number' },
                            sale_price: { type: 'number' },
                            stock: { type: 'number' },
                            category: { 
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    category_name: { type: 'string' }
                                },
                                additionalProperties: true
                            },
                            image: { type: 'string' },
                            size: { type: 'string' }, // Kích thước sản phẩm
                            color: { type: 'string' }, // Màu sắc sản phẩm
                            status: { type: 'number' },
                            created_at: { type: 'string', format: 'date-time' },
                            variants: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        color: { type: 'string' },
                                        size: { type: 'string' },
                                        stock: { type: 'number' }
                                    }
                                }
                            }
                        },
                        additionalProperties: true
                    }
                },
                pagination: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        pages: { type: 'number' }
                    }
                }
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' },
                message: { type: 'string' }
            }
        },
        500: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' },
                message: { type: 'string' }
            }
        }
    }
};

module.exports = getAllProductSchema;
