const bannerService = require('../services/banner.service');
const fs = require('fs');
const path = require('path');
const util = require('util');
const pipeline = util.promisify(require('stream').pipeline);

/**
 * GET /api/banners
 */
async function getBannerByPositionHandler(req, reply) {
  const position = req.params.position;
  try {
    const banner = await bannerService.getBannerByPosition(position);
    if (!banner) {
      return reply.status(404).send({ error: 'Banner không tìm thấy' });
    }
    return reply.send(banner);
  } catch (error) {
    return reply.status(500).send({ error: 'Lỗi khi lấy dữ liệu banner' });
  }
}

async function getAll(request, reply) {
  try {
    const result = await bannerService.getAllBanners();
    reply.send(result);
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
}

/**
 * GET /api/banners/active
 */
async function getActive(request, reply) {
  try {
    const result = await bannerService.getActiveBanners();
    reply.send(result);
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
}

/**
 * GET /api/banners/:id
 */
async function getOne(request, reply) {
  const id = request.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return reply.code(400).send({ error: 'Invalid ID format' });
  }
  try {
    const result = await bannerService.getBannerById(id);
    if (!result) {
      return reply.code(404).send({ error: 'Banner not found' });
    }
    reply.send(result);
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
}

/**
 * POST /api/banners
 * (multipart/form-data)
 */
async function createBanner(request, reply) {
  try {
    // Dùng multipart của fastify
    const parts = request.parts();
    const data = {};
    let imageFilePath = null;

    for await (const part of parts) {
      if (part.file) {
        if (part.fieldname !== 'image') continue;
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const filename = `${Date.now()}-${part.filename.replace(/\s+/g, '_')}`;
        const filepath = path.join(uploadDir, filename);
        await pipeline(part.file, fs.createWriteStream(filepath));
        imageFilePath = `/uploads/${filename}`;
      } else {
        data[part.fieldname] = part.value;
      }
    }

    const { title, link_url, position, status } = data;
    if (!title || !position || status === undefined || !imageFilePath) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required fields: title, position, status, image',
      });
    }

    const bannerData = {
      title,
      image: imageFilePath,
      link_url: link_url || '',
      position: Number(position),
      status: Number(status),
    };

    const newBanner = await bannerService.createBanner(bannerData);

    reply.code(201).send({
      success: true,
      data: newBanner,
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}

/**
 * PUT /api/banners/:id
 */
async function updateBanner(request, reply) {
  const id = request.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return reply.code(400).send({ error: 'Invalid ID format' });
  }

  try {
    const parts = request.parts();
    const data = {};
    let imageFilePath = null;

    for await (const part of parts) {
      if (part.file) {
        if (part.fieldname !== 'image') continue;
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const filename = `${Date.now()}-${part.filename.replace(/\s+/g, '_')}`;
        const filepath = path.join(uploadDir, filename);
        await pipeline(part.file, fs.createWriteStream(filepath));
        imageFilePath = `/uploads/${filename}`;
      } else {
        data[part.fieldname] = part.value;
      }
    }

    data.updated_at = new Date();

    if (imageFilePath) {
      data.image = imageFilePath;
    }

    const updatedBanner = await bannerService.updateBanner(id, data);
    if (!updatedBanner) {
      return reply.code(404).send({ error: 'Banner not found' });
    }
    const item = await bannerService.getBannerById(id);
    reply.send(item);
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
}


/**
 * DELETE /api/banners/:id
 */
async function deleteBanner(request, reply) {
  const id = request.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return reply.code(400).send({ error: 'Invalid ID format' });
  }
  try {
    const banner = await bannerService.getBannerById(id);
    if (!banner) {
      return reply.code(404).send({ error: 'Banner not found' });
    }
    const deleted = await bannerService.deleteBanner(id);
    reply.send({
      success: true,
      message: 'Banner deleted successfully',
      deleted
    });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getAll,
  getActive,
  getOne,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannerByPositionHandler,
};
