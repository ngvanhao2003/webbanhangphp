const Post = require('../model/post.model');

class PostService {
  async getAllPosts() {
    return await Post.find()
      .sort({ created_at: -1 })
      .populate('categories');
  }

  async getPublishedPosts() {
    return await Post.find({ status: 'published' })
      .sort({ published_at: -1 })
      .populate('categories');
  }

  async getFeaturedPosts() {
    return await Post.find({ 
      status: 'published',
      is_featured: true 
    })
      .sort({ published_at: -1 })
      .populate('categories');
  }

  async getPostById(id) {
    return await Post.findById(id).populate('categories');
  }

  async getPostBySlug(slug) {
    return await Post.findOne({ slug }).populate('categories');
  }

  async createPost(postData) {
    // If post is published, set published_at date
    if (postData.status === 'published' && !postData.published_at) {
      postData.published_at = new Date();
    }
    
    const post = new Post(postData);
    return await post.save();
  }

  async updatePost(id, postData) {
    // If post status is changing to published and no published date, set it
    if (postData.status === 'published') {
      const currentPost = await Post.findById(id);
      if (currentPost.status !== 'published' || !currentPost.published_at) {
        postData.published_at = new Date();
      }
    }
    
    // Update the updated_at timestamp
    postData.updated_at = Date.now();
    
    return await Post.findByIdAndUpdate(
      id,
      postData,
      { new: true, runValidators: true }
    ).populate('categories');
  }

  async incrementViewCount(id) {
    return await Post.findByIdAndUpdate(
      id,
      { $inc: { view_count: 1 } },
      { new: true }
    ).populate('categories');
  }

  async deletePost(id) {
    return await Post.findByIdAndDelete(id);
  }
  
  async getPostsByCategory(categoryId) {
    return await Post.find({ 
      categories: categoryId,
      status: 'published' 
    })
      .sort({ published_at: -1 })
      .populate('categories');
  }
  
  async searchPosts(searchTerm) {
    return await Post.find({
      $and: [
        { status: 'published' },
        {
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { content: { $regex: searchTerm, $options: 'i' } },
            { summary: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
          ]
        }
      ]
    })
      .sort({ published_at: -1 })
      .populate('categories');
  }
  
  async getPostsByTag(tag) {
    return await Post.find({
      status: 'published',
      tags: { $in: [new RegExp(tag, 'i')] }
    })
      .sort({ published_at: -1 })
      .populate('categories');
  }
}

module.exports = new PostService();