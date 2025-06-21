const homeHandler = require('../../handlers/home.handler');

module.exports = function(fastify, opts, done) {
  // API lấy dữ liệu trang chủ (banner, danh mục nổi bật, sản phẩm mới)
  fastify.get('/api/home', homeHandler.getHomePageData);

  // API lấy chỉ banner hiển thị
  fastify.get('/api/home/banners', homeHandler.getActiveBanners);

  // API lấy chỉ danh mục nổi bật
  fastify.get('/api/home/featured-categories', homeHandler.getFeaturedCategories);

  // API lấy chỉ sản phẩm mới
  fastify.get('/api/home/new-products', homeHandler.getNewProducts);

  // API lấy sản phẩm bán chạy
  fastify.get('/api/home/best-selling', homeHandler.getBestSelling);

  done();
};