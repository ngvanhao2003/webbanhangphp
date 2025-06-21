const postService = require('../services/post.service');

function getAll(req, res) {
    postService.getAllPosts()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function getPublished(req, res) {
    postService.getPublishedPosts()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function getFeatured(req, res) {
    postService.getFeaturedPosts()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function getOne(req, res) {
    const id = req.params.id;
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }
    
    postService.getPostById(id)
        .then((result) => {
            if (!result) {
                res.status(404).send({ error: 'Post not found' });
                return;
            }
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function getBySlug(req, res) {
    const slug = req.params.slug;
    
    postService.getPostBySlug(slug)
        .then((result) => {
            if (!result) {
                res.status(404).send({ error: 'Post not found' });
                return;
            }
            
            // Increment view count
            return postService.incrementViewCount(result.id)
                .then((updatedPost) => {
                    res.send(updatedPost);
                });
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function getByCategory(req, res) {
    const categoryId = req.params.categoryId;
    
    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid category ID format' });
        return;
    }
    
    postService.getPostsByCategory(categoryId)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function getByTag(req, res) {
    const tag = req.params.tag;
    
    if (!tag || tag.trim() === '') {
        res.status(400).send({ error: 'Tag parameter is required' });
        return;
    }
    
    postService.getPostsByTag(tag)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function searchPosts(req, res) {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        res.status(400).send({ error: 'Search query is required' });
        return;
    }
    
    postService.searchPosts(q)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function createPost(req, res) {
    const data = req.body;
    postService.createPost(data)
        .then((result) => {
            const id = result._id;
            return postService.getPostById(id);
        })
        .then((item) => {
            if (item) {
                res.send(item);
            } else {
                res.status(404).send({ error: 'Post not found' });
            }
        })
        .catch((err) => {
            console.error('Database error:', err);
            if (err.code === 11000) {
                res.status(400).send({ error: 'A post with this slug already exists' });
            } else {
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });
}

function updatePost(req, res) {
    const id = req.params.id;
    const data = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }

    // Call service to update post
    postService.updatePost(id, data)
        .then((updatedPost) => {
            if (!updatedPost) {
                res.status(404).send({ error: 'Post not found' });
                return;
            }

            res.send(updatedPost);
        })
        .catch((err) => {
            console.error('Error updating post:', err.message);
            if (err.code === 11000) {
                res.status(400).send({ error: 'A post with this slug already exists' });
            } else {
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });
}

function deletePost(req, res) {
    const id = req.params.id;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }

    // Check if post exists before deleting
    postService.getPostById(id)
        .then((post) => {
            if (!post) {
                res.status(404).send({ error: 'Post not found' });
                return;
            }

            // If post exists, proceed with deletion
            return postService.deletePost(id);
        })
        .then((deleted) => {
            if (deleted) {
                res.send({ 
                    success: true,
                    message: 'Post deleted successfully', 
                    deleted 
                });
            }
        })
        .catch((err) => {
            console.error('Error deleting post:', err.message);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

module.exports = {
    getAll,
    getPublished,
    getFeatured,
    getOne,
    getBySlug,
    getByCategory,
    getByTag,
    searchPosts,
    createPost,
    updatePost,
    deletePost
};