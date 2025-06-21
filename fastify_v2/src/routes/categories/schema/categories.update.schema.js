const updateCategorySchema = {
    description: 'Update one category',
    tags: ['category'],
    summary: 'Update one category',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        required: ['category_name', 'slug', 'sort_order', 'parent', 'status'],
        properties: {
            category_name: { type: 'string' },
            slug: { type: 'string' },
            sort_order: { type: 'number' },
            parent: { type: ['string', 'null'] },
            status: { type: 'number' }
        }
    },
    responses: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                category_name: { type: 'string' },
                slug: { type: 'string' },
                sort_order: { type: 'number' },
                parent: { type: 'number' },
                status: { type: 'number' },
                created_at: { type: 'number'}
            }
        },
        400:{
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid query parameters'
            }
        },
        403:{
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                statusCode: 403,
                error: 'Forbidden',
                message: 'Access denied'
            }
        },
        500:{
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'Internal server error'
            }
        }
    }
}

module.exports = updateCategorySchema;