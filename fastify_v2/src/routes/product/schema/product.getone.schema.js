const getOneProductSchema = {
    description: 'Get details of a single product by ID',
    tags: ['product'],  // Chuyển từ category sang product
    summary: 'Retrieve a single product by ID',
    params: {
        type: 'object',
        required: ['id'], // Sử dụng 'id' để truy vấn sản phẩm
        properties: {
            id: { type: 'string', description: 'Product ID' }  // Chuyển slug thành id
        }
    },    response: {
        200: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },                   // Trạng thái của request
                data: {                                         // Dữ liệu sản phẩm
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },                // MongoDB ID
                        id: { type: 'string' },                  // ID ảo từ virtual property
                        name: { type: 'string' },                // Tên sản phẩm
                        description: { type: 'string' },         // Mô tả sản phẩm
                        detail: { type: 'string' },              // Chi tiết sản phẩm
                        price: { type: 'number' },               // Giá sản phẩm
                        sale_price: { type: 'number' }, // Giá khuyến mãi (nếu có)
                        stock: { type: 'number' },               // Số lượng tồn kho
                        category: {                              // Thông tin danh mục
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                _id: { type: 'string' },
                                category_name: { type: 'string' },
                                slug: { type: 'string' }
                            }
                        },
                        brand: {                                 // Thông tin thương hiệu
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                _id: { type: 'string' },
                                name: { type: 'string' },
                                slug: { type: 'string' }
                            }
                        },
                        image: { type: 'string' },            // Hình ảnh của sản phẩm
                        status: { type: 'number' },              // Trạng thái sản phẩm
                        size: { type: 'string' },                // Kích thước sản phẩm
                        color: { type: 'string' },               // Màu sắc sản phẩm
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
                        },
                        created_at: { type: 'string', format: 'date-time' },  // Thời gian tạo
                        updated_at: { type: 'string', format: 'date-time' },  // Thời gian cập nhật
                        __v: { type: 'number' }                  // Version key của MongoDB
                    }
                }
            }
        },        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' }
            },
            example: {
                success: false,
                error: 'Invalid ID format'
            }
        },
        404: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' }
            },
            example: {
                success: false,
                error: 'Product not found'
            }
        },
        500: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string' },
                message: { type: 'string' }
            },
            example: {
                success: false,
                error: 'Internal Server Error',
                message: 'An unexpected error occurred'
            }
        }
    }
};

module.exports = getOneProductSchema;
