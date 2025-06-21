const postSchema = require('./schema');
const postHandler = require('../../handlers/post.handler');

module.exports = function(fastify, opts, done) {
    // GET all posts (admin)
    fastify.get('/', { schema: postSchema.getAllPostsSchema }, postHandler.getAll);
    
    // GET published posts
    fastify.get('/published', { schema: postSchema.getAllPostsSchema }, postHandler.getPublished);
    
    // GET featured posts
    fastify.get('/featured', { schema: postSchema.getAllPostsSchema }, postHandler.getFeatured);
    
    // GET posts by category
    fastify.get('/category/:categoryId', { schema: postSchema.getByCategorySchema }, postHandler.getByCategory);
    
    // GET posts by tag
    fastify.get('/tag/:tag', { schema: postSchema.getByTagSchema }, postHandler.getByTag);
    
    // Search posts
    fastify.get('/search', { schema: postSchema.searchPostsSchema }, postHandler.searchPosts);
    
    // GET post by ID
    fastify.get('/:id', { schema: postSchema.getOnePostSchema }, postHandler.getOne);
    
    // GET post by slug
    fastify.get('/slug/:slug', { schema: postSchema.getBySlugSchema }, postHandler.getBySlug);
    
    // POST create a new post
    fastify.post('/', { schema: postSchema.createPostSchema }, postHandler.createPost);
    
    // PUT update post
    fastify.put('/:id', { schema: postSchema.updatePostSchema }, postHandler.updatePost);
    
    // DELETE post
    fastify.delete('/:id', { schema: postSchema.deletePostSchema }, postHandler.deletePost);
    
    done();
};