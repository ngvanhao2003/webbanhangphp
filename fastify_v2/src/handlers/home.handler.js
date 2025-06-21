const bannerService = require('../services/banner.service');
const categoryService = require('../services/categories.service');
const productService = require('../services/product.service');
const orderService = require('../services/order.service');

/**
 * Lấy tất cả dữ liệu cần thiết cho trang chủ
 */
async function getHomePageData(request, reply) {
  try {
    // Lấy banner hoạt động
    const banners = await bannerService.getActiveBanners();

    // Lấy danh mục nổi bật (các danh mục chính và có status = 1)
    const featuredCategories = await categoryService.getFeaturedCategories();

    // Lấy sản phẩm mới (10 sản phẩm mới nhất)
    const newProducts = await productService.getAllProducts(1, 10, { created_at: -1 });

    // Lấy sản phẩm bán chạy
    const bestSellingProducts = await productService.getBestSellingProducts(10);

    return reply.code(200).send({
      success: true,
      data: {
        banners,
        featuredCategories,
        newProducts: newProducts.items,
        bestSellingProducts
      }
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Lấy chỉ banner hiển thị
 */
async function getActiveBanners(request, reply) {
  try {
    const banners = await bannerService.getActiveBanners();
    return reply.code(200).send({
      success: true,
      data: banners
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Lấy chỉ danh mục nổi bật
 */
async function getFeaturedCategories(request, reply) {
  try {
    const featuredCategories = await categoryService.getFeaturedCategories();
    return reply.code(200).send({
      success: true,
      data: featuredCategories
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Lấy chỉ sản phẩm mới
 */
async function getNewProducts(request, reply) {
  try {
    const { limit = 10 } = request.query;
    const newProducts = await productService.getAllProducts(1, parseInt(limit), { created_at: -1 });
    return reply.code(200).send({
      success: true,
      data: newProducts.items
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

/**
 * Lấy sản phẩm bán chạy
 */
async function getBestSelling(request, reply) {
  try {
    const { limit = 10 } = request.query;
    const bestSellingProducts = await productService.getBestSellingProducts(parseInt(limit));
    return reply.code(200).send({
      success: true,
      data: bestSellingProducts
    });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
}

module.exports = {
  getHomePageData,
  getActiveBanners,
  getFeaturedCategories,
  getNewProducts,
  getBestSelling
};