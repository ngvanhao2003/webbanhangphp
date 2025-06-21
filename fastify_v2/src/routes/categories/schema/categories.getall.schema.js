const getAllCategoriesSchema = {
    description: 'Get all categories',
    tags: ['category'],
    summary: 'Get all categories',
    response:{
        200:{
            type:'array',
            items:{
                type:'object',                      
                properties:{
                    id:{type:'string'},                                                                                                                                                                                     
                    category_name:{type:'string'},
                    slug:{type:'string'},
                    sort_order:{type:'number'},
                    parent:{type:'string'},
                    status:{type:'string'},
                    created_at:{type:'number'}
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

module.exports = getAllCategoriesSchema;