
const getAllUsersSchema = {
    description: 'Get all users',
    tags: ['user'],
    summary: 'Get all users',
    response:{
        200:{
            type:'array',
            items:{
                type:'object',                      
                properties:{
                    id:{type:'string'},
                    username:{type:'string'},
                    email:{type:'string'},
                    full_name:{type:'string'},
                    avatar:{type:'string'},
                    role:{type:'string'},
                    phone:{type:'string'},
                    gender:{type:'string', enum:['Nam', 'Nữ', 'Khác']},
                    dob:{type:'string', format: 'date'},
                    address:{type:'string'},
                    status:{type:'number'},
                    last_login:{type:'string', format: 'date-time'},
                    created_at:{type:'string', format: 'date-time'},
                    updated_at:{type:'string', format: 'date-time'}
                }
            }
        },
        400:{
            type:'object',
            properties:{
                statusCode: {type:'number'},
                error: {type:'string'},
                message: {type:'string'}
            },
            example:{
                statusCode: 400,
                error: 'Bad Request',
                message: 'Invalid query parameters'
            }
        }
    }
}

module.exports = getAllUsersSchema;