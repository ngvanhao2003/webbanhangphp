const Banner = require('../model/banner.model');

class BannerService {
  async getBannerByPosition(position) {
  return Banner.findOne({ position, status: 1 }); // Lấy banner tại vị trí 1 và trạng thái là active
}
  async getAllBanners() {
    try {
      return await Banner.find().sort({ sort_order: 1 });
    } catch (error) {
      throw error;
    }
  }

  async getActiveBanners() {
    try {
      return await Banner.find({ status: 1 }).sort({ sort_order: 1 });
    } catch (error) {
      throw error;
    }
  }

  async getBannerById(id) {
    try {
      return await Banner.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async createBanner(bannerData) {
    try {
      const banner = new Banner(bannerData);
      return await banner.save();
    } catch (error) {
      throw error;
    }
  }

  async updateBanner(id, bannerData) {
    try {
      bannerData.updated_at = Date.now();
      return await Banner.findByIdAndUpdate(
        id,
        bannerData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteBanner(id) {
    try {
      return await Banner.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BannerService();