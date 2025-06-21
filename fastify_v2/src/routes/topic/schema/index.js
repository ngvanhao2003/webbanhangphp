const getAllTopicsSchema = require('./topic.getall.schema');
const getOneTopicSchema = require('./topic.getone.schema');
const getBySlugSchema = require('./topic.getbyslug.schema');
const getByCategorySchema = require('./topic.getbycategory.schema');
const searchTopicsSchema = require('./topic.search.schema');
const createTopicSchema = require('./topic.create.schema');
const updateTopicSchema = require('./topic.update.schema');
const deleteTopicSchema = require('./topic.delete.schema');

module.exports = {
    getAllTopicsSchema,
    getOneTopicSchema,
    getBySlugSchema,
    getByCategorySchema,
    searchTopicsSchema,
    createTopicSchema,
    updateTopicSchema,
    deleteTopicSchema
};