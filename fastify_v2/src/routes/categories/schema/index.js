const createCategorySchema = require("./categories.create.schema");
const getAllCategoriesSchema = require("./categories.getall.schema");
const getOneCategorySchema = require("./categories.getone.schema");
const updateCategorySchema = require("./categories.update.schema");
const delCategorySchema = require("./categories.delete.schema");
const updateCategoryStatusSchema = require("./categories.status.schema");

module.exports = {
    getAllCategoriesSchema,
    createCategorySchema,
    getOneCategorySchema,
    updateCategorySchema,
    delCategorySchema,
    updateCategoryStatusSchema,
}