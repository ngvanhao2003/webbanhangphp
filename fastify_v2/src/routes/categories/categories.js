const categorySchema = require('./schema');
const categoriesHandler = require('../../handlers/categories.handler');

module.exports = function(fastify, otps, done){
    fastify.get('/api/categories',{schema: categorySchema.getAllCategoriesSchema}, categoriesHandler.getAll);

    fastify.post('/api/categories',{schema: categorySchema.createCategorySchema}, categoriesHandler.createCategory);

    fastify.get('/api/categories/:id',{schema: categorySchema.getOneCategorySchema}, categoriesHandler.getOne);
    
    fastify.put('/api/categories/:id',{schema: categorySchema.updateCategorySchema}, categoriesHandler.updateCategory);

    fastify.delete('/api/categories/:id',{schema: categorySchema.delCategorySchema}, categoriesHandler.delCategory);

    fastify.patch('/api/categories/:id/status', { schema: categorySchema.updateCategoryStatusSchema }, categoriesHandler.updateCategoryStatus);

    fastify.get('/api/categories/export', categoriesHandler.exportExcel);

    fastify.post('/api/categories/import', categoriesHandler.importExcel);


    done();
}