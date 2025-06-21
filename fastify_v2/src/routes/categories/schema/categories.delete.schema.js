const {response} = require("./categories.delete.schema");


const delCategorySchema = {
    description: 'Delete a category',
    tags: ['category'],
    summary: 'Delete a category',
    params: {
        type: 'object',
        properties: {
            id: { type: 'string'},
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string'},
                category_name: { type: 'string'},
                slug: { type: 'string'},
                sort_order: { type: 'number'},
                parent: { type: 'string'},
                status: { type: 'number'},
                created_at: { type: 'string', format: 'date-time'},
            },
            example: {
                id: { type: 'string'},
                category_name: { type: 'string'},
                slug: { type: 'string'},
                sort_order: { type: 'number'},
                parent: { type: 'string'},
                status: { type: 'number'},
                created_at: { type: 'string', format: 'date-time'},
            }
        },
        400: {
            type: 'object',
            properties: {
                statusCode: { type: 'number'},
                error: { type: 'string'},
                message: { type: 'string'},
            },
            example: {
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid query parameter',
            }
        },
        403: {
            type: 'object',
            properties: {
                statusCode: { type: 'number'},
                error: { type: 'string'},
                message: { type: 'string'},
            },
            example: {
                statusCode: 403,
                error: 'Forbidden',
                message: 'You do not have permission to access this resource',
            }
        },
        404: {
            type: 'object',
            properties: {
                statusCode: { type: 'number'},
                error: { type: 'string'},
                message: { type: 'string'},
            },
            example: {
                statusCode: 404,
                error: 'Not Found',
                message: 'Category not found',
            }
        },
        500: {
            type: 'object',
            properties: {
                statusCode: { type: 'number'},
                error: { type: 'string'},
                message: { type: 'string'},
            },
            example: {
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'An unexpected error occurred',
            }
        }

    }
};

module.exports = delCategorySchema;