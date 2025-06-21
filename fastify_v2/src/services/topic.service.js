const Topic = require('../model/topic.model');

class TopicService {
  async getAllTopics() {
    return await Topic.find().sort({ created_at: -1 });
  }

  async getPublishedTopics() {
    return await Topic.find({ status: 1 }).sort({ created_at: -1 });
  }

  async getTopicById(id) {
    return await Topic.findById(id);
  }

  async getTopicBySlug(slug) {
    return await Topic.findOne({ slug });
  }

  async createTopic(topicData) {
    const topic = new Topic(topicData);
    return await topic.save();
  }

  async updateTopic(id, topicData) {
    // Update the updated_at timestamp
    topicData.updated_at = Date.now();
    
    return await Topic.findByIdAndUpdate(
      id,
      topicData,
      { new: true, runValidators: true }
    );
  }

  async incrementViewCount(id) {
    return await Topic.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  }

  async deleteTopic(id) {
    return await Topic.findByIdAndDelete(id);
  }
  
  async getTopicsByCategory(categoryId) {
    return await Topic.find({ 
      category: categoryId,
      status: 1 
    }).sort({ created_at: -1 });
  }
  
  async searchTopics(searchTerm) {
    return await Topic.find({
      $and: [
        { status: 1 },
        {
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
          ]
        }
      ]
    }).sort({ created_at: -1 });
  }
}

module.exports = new TopicService();