const getAllProductSchema = require('./product.getall.schema');
const getOneProductSchema = require('./product.getone.schema');
const createProductSchema = require('./product.create.schema');
const updateProductSchema = require('./product.update.schema');
const searchProductsSchema = require('./product.search.schema');
const productStatusSchema = require('./product.status.schema');

// Thêm các schema thiếu
const getProductsByCategorySchema = {
    description: 'Get products by category',
    tags: ['product'],
    summary: 'Get all products in a specific category',
    params: {
        type: 'object',
        required: ['categoryId'],
        properties: {
            categoryId: { type: 'string' }
        }
    },
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
                            detail: { type: 'string' }, // Product details
                            price: { type: 'number' },
                            // ... other product properties
                        }
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
        }
    }
};

const filterProductsByCategorySchema = {
    description: 'Filter products by category with additional criteria',
    tags: ['product'],
    summary: 'Filter products within a category by price, brand, etc.',
    params: {
        type: 'object',
        required: ['categoryId'],
        properties: {
            categoryId: { type: 'string' }
        }
    },
    querystring: {
        type: 'object',
        properties: {
            minPrice: { type: 'string', description: 'Minimum price' },
            maxPrice: { type: 'string', description: 'Maximum price' },
            brand: { type: 'string', description: 'Brand ID' },
            size: { type: 'string', description: 'Size value to filter' },
            color: { type: 'string', description: 'Color value to filter' },
            sort: { type: 'string', description: 'Sort field and direction' },
            page: { type: 'integer', description: 'Page number for pagination', default: 1 },
            limit: { type: 'integer', description: 'Number of items per page', default: 10 }
        }
    },
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
                            detail: { type: 'string' }, // Product details
                            price: { type: 'number' },
                            color: { type: 'string' },
                            // ... other product properties
                        }
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
        }
    }
};

module.exports = {
    getAllProductSchema,
    getOneProductSchema,
    createProductSchema,
    updateProductSchema,
    searchProductsSchema,
    getProductsByCategorySchema,
    filterProductsByCategorySchema,
    productStatusSchema
};