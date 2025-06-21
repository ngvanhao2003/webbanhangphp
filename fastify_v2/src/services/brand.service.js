const Brand = require('../model/brand.model');

class BrandService {
  async getAllBrands() {
    return await Brand.find().sort({ name: 1 });
  }

  async getBrandById(id) {
    return await Brand.findById(id);
  }

  async getBrandBySlug(slug) {
    return await Brand.findOne({ slug });
  }

  async createBrand(brandData) {
    const brand = new Brand(brandData);
    return await brand.save();
  }

  async updateBrand(id, brandData) {
    // Update the updated_at timestamp
    brandData.updated_at = Date.now();
    
    return await Brand.findByIdAndUpdate(
      id,
      brandData,
      { new: true, runValidators: true }
    );
  }

  async deleteBrand(id) {
    return await Brand.findByIdAndDelete(id);
  }
}

module.exports = new BrandService();