const topicService = require('../services/topic.service');

function getAll(req, res) {
    topicService.getAllTopics()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function getPublished(req, res) {
    topicService.getPublishedTopics()
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
    
    topicService.getTopicById(id)
        .then((result) => {
            if (!result) {
                res.status(404).send({ error: 'Topic not found' });
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
    
    topicService.getTopicBySlug(slug)
        .then((result) => {
            if (!result) {
                res.status(404).send({ error: 'Topic not found' });
                return;
            }
            
            // Increment view count
            return topicService.incrementViewCount(result.id)
                .then((updatedTopic) => {
                    res.send(updatedTopic);
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
    
    topicService.getTopicsByCategory(categoryId)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function searchTopics(req, res) {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        res.status(400).send({ error: 'Search query is required' });
        return;
    }
    
    topicService.searchTopics(q)
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function createTopic(req, res) {
    const data = req.body;
    topicService.createTopic(data)
        .then((result) => {
            const id = result._id;
            return topicService.getTopicById(id);
        })
        .then((item) => {
            if (item) {
                res.send(item);
            } else {
                res.status(404).send({ error: 'Topic not found' });
            }
        })
        .catch((err) => {
            console.error('Database error:', err);
            if (err.code === 11000) {
                res.status(400).send({ error: 'A topic with this slug already exists' });
            } else {
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });
}

function updateTopic(req, res) {
    const id = req.params.id;
    const data = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }

    // Update timestamp
    data.updated_at = new Date();

    // Call service to update topic
    topicService.updateTopic(id, data)
        .then((updatedTopic) => {
            if (!updatedTopic) {
                res.status(404).send({ error: 'Topic not found' });
                return;
            }

            // Get updated topic information
            return topicService.getTopicById(id);
        })
        .then((item) => {
            if (item) {
                res.send(item);
            } else {
                res.status(404).send({ error: 'Topic not found after update' });
            }
        })
        .catch((err) => {
            console.error('Error updating topic:', err.message);
            if (err.code === 11000) {
                res.status(400).send({ error: 'A topic with this slug already exists' });
            } else {
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });
}

function deleteTopic(req, res) {
    const id = req.params.id;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }

    // Check if topic exists before deleting
    topicService.getTopicById(id)
        .then((topic) => {
            if (!topic) {
                res.status(404).send({ error: 'Topic not found' });
                return;
            }

            // If topic exists, proceed with deletion
            return topicService.deleteTopic(id);
        })
        .then((deleted) => {
            if (deleted) {
                res.send({ 
                    success: true,
                    message: 'Topic deleted successfully', 
                    deleted 
                });
            }
        })
        .catch((err) => {
            console.error('Error deleting topic:', err.message);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

module.exports = {
    getAll,
    getPublished,
    getOne,
    getBySlug,
    getByCategory,
    searchTopics,
    createTopic,
    updateTopic,
    deleteTopic
};