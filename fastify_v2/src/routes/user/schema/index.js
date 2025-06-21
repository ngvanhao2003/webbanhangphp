
const getAllUsersSchema = require("./user.getall.schema");
const getOneUserSchema = require("./user.getone.schema");
const createUserSchema = require("./user.create.schema");
const updateUserSchema = require("./user.update.schema");
const deleteUserSchema = require("./user.delete.schema");
const loginUserSchema = require("./user.login.schema");

module.exports = {
    getAllUsersSchema,
    getOneUserSchema,
    createUserSchema,
    updateUserSchema,
    deleteUserSchema,
    loginUserSchema
};