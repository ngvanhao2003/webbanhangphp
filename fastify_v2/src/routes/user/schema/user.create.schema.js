
const createUserSchema = {
    description: 'Create a new user',
    tags: ['user'],
    summary: 'Create a new user',
    body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            full_name: { type: 'string' },
            avatar: { type: 'string' },
            role: { 
                type: 'string',
                enum: ['user', 'admin', 'editor'],
                default: 'user'
            },
            status: { type: 'number', default: 1 }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                full_name: { type: 'string' },
                avatar: { type: 'string' },
                role: { type: 'string' },
                status: { type: 'number' },
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
        409: {
            type: 'object',
            properties: {
                statusCode: { type: 'number' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                statusCode: 409,
                error: 'Conflict',
                message: 'Username or email already exists'
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

module.exports = createUserSchema;