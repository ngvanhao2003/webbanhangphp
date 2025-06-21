const topicSchema = require('./schema');
const topicHandler = require('../../handlers/topic.handler');

module.exports = function(fastify, opts, done) {
    // GET all topics (admin)
    fastify.get('/', { schema: topicSchema.getAllTopicsSchema }, topicHandler.getAll);
    
    // GET published topics
    fastify.get('/published', { schema: topicSchema.getAllTopicsSchema }, topicHandler.getPublished);
    
    // GET topics by category
    fastify.get('/category/:categoryId', { schema: topicSchema.getByCategorySchema }, topicHandler.getByCategory);
    
    // Search topics
    fastify.get('/search', { schema: topicSchema.searchTopicsSchema }, topicHandler.searchTopics);
    
    // GET topic by ID
    fastify.get('/:id', { schema: topicSchema.getOneTopicSchema }, topicHandler.getOne);
    
    // GET topic by slug
    fastify.get('/slug/:slug', { schema: topicSchema.getBySlugSchema }, topicHandler.getBySlug);
    
    // POST create a new topic
    fastify.post('/', { schema: topicSchema.createTopicSchema }, topicHandler.createTopic);
    
    // PUT update topic
    fastify.put('/:id', { schema: topicSchema.updateTopicSchema }, topicHandler.updateTopic);
    
    // DELETE topic
    fastify.delete('/:id', { schema: topicSchema.deleteTopicSchema }, topicHandler.deleteTopic);
    
    done();
};