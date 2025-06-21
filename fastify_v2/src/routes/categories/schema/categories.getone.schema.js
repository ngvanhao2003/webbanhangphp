const { response } = require("./categories.getall.schema");

const getOneCategorySchema = {
    description: 'Get details of a single category by ID',
    tags: ['category'],
    summary: 'Retrieve a single category by ID',
    params: {
        type: 'object',
        required: ['id'], // Thay 'slug' bằng 'id'
        properties: {
            id: { type: 'string', description: 'Category ID' } // Thay đổi từ 'slug' thành 'id'
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
                parent: { type: ['string', 'null'] }, // Sửa lại đúng kiểu MongoDB
                status: { type: 'number' },
                created_at: { type: 'number' }
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

module.exports = getOneCategorySchema;