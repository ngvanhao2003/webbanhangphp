const bannerSchema = require('./schema');
const bannerHandler = require('../../handlers/banner.handler');

module.exports = function(fastify, opts, done) {
    // GET all banners
    fastify.get('/', { schema: bannerSchema.getAllBannersSchema }, bannerHandler.getAll);
    
    fastify.get('/banner/:position',bannerHandler.getBannerByPositionHandler); // Endpoint lấy banner theo position

    // GET active banners
    fastify.get('/active', { schema: bannerSchema.getAllBannersSchema }, bannerHandler.getActive);
    
    // GET banner by ID
    fastify.get('/:id', { schema: bannerSchema.getOneBannerSchema }, bannerHandler.getOne);
    
    fastify.post('/', { schema: bannerSchema.createBannerSchema }, bannerHandler.createBanner); // Thêm mới (có schema validate multipart)

    fastify.put('/:id', { schema: bannerSchema.updateBannerSchema }, bannerHandler.updateBanner); // Sửa
    
    fastify.delete('/:id', { schema: bannerSchema.deleteBannerSchema }, bannerHandler.deleteBanner); // Xóa
    
    done();
};