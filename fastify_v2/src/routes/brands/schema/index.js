const getAllBrandsSchema = require('./brands.getall.schema');
const getOneBrandSchema = require('./brands.getone.schema');
const createBrandSchema = require('./brands.create.schema');
const updateBrandSchema = require('./brands.update.schema');
const deleteBrandSchema = require('./brands.delete.schema');
const updateBrandStatusSchema = require('./brands.status.schema');

module.exports = {
    getAllBrandsSchema,
    getOneBrandSchema,
    createBrandSchema,
    updateBrandSchema,
    deleteBrandSchema,
    updateBrandStatusSchema
};