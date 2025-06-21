const productSchema = require('./schema');  // Đảm bảo schema là mô hình của Product
const createProductSchema = require('../../routes/product/schema/product.create.schema');  // Đảm bảo đường dẫn đúng/
const productsHandler = require('../../handlers/products.handler');  // Chuyển từ categories.handler sang products.handler
const updateProductSchema = require('../../routes/product/schema/product.update.schema');
const productHandler = require('../../handlers/products.handler');



module.exports = function(fastify, opts, done) {
  // Lấy tất cả sản phẩm
  fastify.get('/api/products', { schema: productSchema.getAllProductSchema }, productsHandler.getAll);
  
  // API tìm kiếm và lọc sản phẩm - Di chuyển lên trước route với tham số động
  fastify.get('/api/products/search', { schema: productSchema.searchProductsSchema }, productsHandler.searchProducts);
  
  // Lấy sản phẩm theo danh mục
  fastify.get('/api/categories/:categoryId/products', { schema: productSchema.getProductsByCategorySchema }, productsHandler.getByCategory);
  // API lấy danh sách sản phẩm theo danh mục
  fastify.get('/api/products/category/:categoryId', productHandler.getProductsByCategory);
  
  // Sắp xếp và lọc sản phẩm trong danh mục
  fastify.get('/api/categories/:categoryId/products/filter', { schema: productSchema.filterProductsByCategorySchema }, productsHandler.filterByCategory);
  
  // Lấy thông tin chi tiết một sản phẩm theo ID
  fastify.get('/api/products/:id', { schema: productSchema.getOneProductSchema }, productsHandler.getOne);
  
  // Tạo mới một sản phẩm
fastify.post('/api/products', {
  schema: {
    requestBody: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              price: { type: 'number' },
              image: { type: 'string', format: 'binary' }
            },
            required: ['name', 'price', 'image']
          }
        }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          imageUrl: { type: 'string' }
        }
      }
    },
    tags: ['product'],
  }
}, productsHandler.createProduct);



  // Cập nhật sản phẩm
fastify.put('/api/products/:id',{ schema: { params: updateProductSchema.params } }, // chỉ validate params id
productsHandler.updateProduct
);
  
  // Cập nhật trạng thái sản phẩm
  fastify.patch('/api/products/:id/status', { schema: productSchema.productStatusSchema }, productsHandler.updateProductStatus);
  
  // Xóa sản phẩm
  fastify.delete('/api/products/:id', productsHandler.deleteProduct);
  
  // Nhập khẩu sản phẩm từ file Excel
fastify.post('/api/products/import-excel', productsHandler.importExcel);



  done();
}
