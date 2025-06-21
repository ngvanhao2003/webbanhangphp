const getAllPostsSchema = require('./post.getall.schema');
const getOnePostSchema = require('./post.getone.schema');
const getBySlugSchema = require('./post.getbyslug.schema');
const getByCategorySchema = require('./post.getbycategory.schema');
const getByTagSchema = require('./post.getbytag.schema');
const searchPostsSchema = require('./post.search.schema');
const createPostSchema = require('./post.create.schema');
const updatePostSchema = require('./post.update.schema');
const deletePostSchema = require('./post.delete.schema');

module.exports = {
    getAllPostsSchema,
    getOnePostSchema,
    getBySlugSchema,
    getByCategorySchema,
    getByTagSchema,
    searchPostsSchema,
    createPostSchema,
    updatePostSchema,
    deletePostSchema
};