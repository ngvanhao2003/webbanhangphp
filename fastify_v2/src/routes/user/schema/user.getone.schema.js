
const getOneUserSchema = {
    description: 'Get details of a single user by ID',
    tags: ['user'],
    summary: 'Retrieve a single user by ID',
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string', description: 'User ID' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                full_name: { type: 'string' },
                avatar: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
                gender: { type: 'string', enum: ['Nam', 'Nữ', 'Khác'] },
                dob: { type: 'string', format: 'date' },
                role: { type: 'string' },
                status: { type: 'number' },
                last_login: { type: 'string', format: 'date-time' },
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
                message: 'User not found'
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

module.exports = getOneUserSchema;