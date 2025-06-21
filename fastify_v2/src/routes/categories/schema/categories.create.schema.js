const { response } = require("./categories.getall.schema");

const createCategorySchema = {
    description: 'Create a new categories',
    tags: ['category'],
    summary: 'Create a new categories',
    body: {
        type: 'object',
        required: ['category_name', 'slug', 'sort_order', 'status'],
        properties: {
            category_name: { type: 'string' },
            slug: { type: 'string' },
            sort_order: { type: 'number' },
            parent: { type: 'string' },
            status: { type: 'number' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                category_name: { type: 'string' },
                slug: { type: 'string' },
                sort_order: { type: 'number' },
                parent: { type: 'string' },
                status: { type: 'number' },
                created_at: { type: 'string', format: 'date-time' }
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
        403: {
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
                message: 'Category not found'
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

module.exports = createCategorySchema;