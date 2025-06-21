const brandSchema = require('./schema');
const brandHandler = require('../../handlers/brands.handler');
module.exports = function(fastify, opts, done) {
    fastify.get('/api/brands', { schema: brandSchema.getAllBrandsSchema }, brandHandler.getAll);

    fastify.post('/api/brands', { schema: brandSchema.createBrandSchema }, brandHandler.createBrand);

    fastify.get('/api/brands/:id', { schema: brandSchema.getOneBrandSchema }, brandHandler.getOne);

    fastify.put('/api/brands/:id', { schema: brandSchema.updateBrandSchema }, brandHandler.updateBrand);

    fastify.delete('/api/brands/:id', { schema: brandSchema.deleteBrandSchema }, brandHandler.deleteBrand);

    fastify.patch('/api/brands/:id/status', { schema: brandSchema.updateBrandStatusSchema }, brandHandler.updateBrandStatus);

    // Thêm sau các route khác
    fastify.post('/api/brands/upload-logo', async (req, res) => {
        if (!req.isMultipart()) {
            return res.status(400).send({ error: 'Not multipart/form-data' });
        }
        const parts = req.parts();
        const fs = require('fs');
        const path = require('path');
        const util = require('util');
        const pipeline = util.promisify(require('stream').pipeline);

        let logoUrl = '';
        for await (const part of parts) {
            if (part.file && part.fieldname === 'logo') {
                const uploadDir = path.join(__dirname, '../../../uploads');
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

                const filename = Date.now() + '-' + part.filename.replace(/\s+/g, '_');
                const filepath = path.join(uploadDir, filename);

                await pipeline(part.file, fs.createWriteStream(filepath));
                logoUrl = `/uploads/${filename}`;
            }
        }
        if (logoUrl) {
            return res.send({ url: logoUrl });
        }
        return res.status(400).send({ error: 'No logo file uploaded' });
    });

    done();
};