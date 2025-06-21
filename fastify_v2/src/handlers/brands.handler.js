const brandService = require('../services/brand.service');
const fs = require('fs');
const path = require('path');
const util = require('util');
const pipeline = util.promisify(require('stream').pipeline);
const Product = require('../model/product.model');

function getAll(req, res) {
  brandService.getAllBrands()
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

  brandService.getBrandById(id)
    .then((result) => {
      if (!result) {
        res.status(404).send({ error: 'Brand not found' });
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

  brandService.getBrandBySlug(slug)
    .then((result) => {
      if (!result) {
        res.status(404).send({ error: 'Brand not found' });
        return;
      }
      res.send(result);
    })
    .catch((err) => {
      console.error('Database error:', err);
      res.status(500).send({ error: 'Internal Server Error' });
    });
}

// Sửa hàm createBrand xử lý multipart/form-data upload file
async function createBrand(req, res) {
  try {
    const data = {};
    let logoUrl = '';

    if (!req.isMultipart()) {
      // Nếu không phải multipart, lấy dữ liệu json bình thường
      Object.assign(data, req.body);
    } else {
      const parts = req.parts();

      for await (const part of parts) {
        if (part.file) {
          // Nhận file logo
          if (part.fieldname === 'logo') {
            const uploadDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const filename = Date.now() + '-' + part.filename.replace(/\s+/g, '_');
            const filepath = path.join(uploadDir, filename);

            await pipeline(part.file, fs.createWriteStream(filepath));

            // Lưu đường dẫn public để lưu vào db
            logoUrl = `/uploads/${filename}`;
          }
        } else {
          // Trường dữ liệu text
          data[part.fieldname] = part.value;
        }
      }
    }

    if (logoUrl) data.logo = logoUrl;
    if (data.status) data.status = Number(data.status);

    const result = await brandService.createBrand(data);
    const id = result._id;
    const item = await brandService.getBrandById(id);
    if (item) {
      res.send(item);
    } else {
      res.status(404).send({ error: 'Brand not found' });
    }
  } catch (err) {
    console.error('Error in createBrand:', err);
    if (err.code === 11000) {
      res.status(400).send({ error: 'Brand with this name or slug already exists' });
    } else {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}

async function updateBrand(req, res) {
  const id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400).send({ error: 'Invalid ID format' });
    return;
  }

  try {
    const data = {};
    let logoUrl = '';

    if (!req.isMultipart()) {
      // Nếu không phải multipart, lấy dữ liệu json bình thường
      Object.assign(data, req.body);
    } else {
      const parts = req.parts();

      for await (const part of parts) {
        if (part.file) {
          // Nhận file logo
          if (part.fieldname === 'logo') {
            const uploadDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const filename = Date.now() + '-' + part.filename.replace(/\s+/g, '_');
            const filepath = path.join(uploadDir, filename);

            await pipeline(part.file, fs.createWriteStream(filepath));

            // Lưu đường dẫn public để lưu vào db
            logoUrl = `/uploads/${filename}`;
          }
        } else {
          // Trường dữ liệu text
          data[part.fieldname] = part.value;
        }
      }
    }

    if (logoUrl) data.logo = logoUrl;
    data.updated_at = new Date();

    const updatedBrand = await brandService.updateBrand(id, data);
    if (!updatedBrand) {
      res.status(404).send({ error: 'Brand not found' });
      return;
    }

    const item = await brandService.getBrandById(id);
    if (item) {
      res.send(item);
    } else {
      res.status(404).send({ error: 'Brand not found after update' });
    }
  } catch (err) {
    console.error('Error updating brand:', err);
    if (err.code === 11000) {
      res.status(400).send({ error: 'Brand with this name or slug already exists' });
    } else {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}

function deleteBrand(req, res) {
  const id = req.params.id;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400).send({ error: 'Invalid ID format' });
    return;
  }

  // Kiểm tra xem có sản phẩm nào thuộc thương hiệu này không
  Product.countDocuments({ brand: id })
    .then(count => {
      if (count > 0) {
        res.status(400).send({ error: 'Không thể xóa: Thương hiệu này đang được sử dụng trong sản phẩm.' });
        return;
      }
      return brandService.getBrandById(id);
    })
    .then((brand) => {
      if (!brand) {
        res.status(404).send({ error: 'Brand not found' });
        return;
      }
      return brandService.deleteBrand(id);
    })
    .then((deleted) => {
      if (deleted) {
        res.send({ success: true, message: 'Brand deleted successfully', deleted });
      }
    })
    .catch((err) => {
      console.error('Error deleting brand:', err.message);
      res.status(500).send({ error: 'Internal Server Error' });
    });
}

function updateBrandStatus(req, res) {
  const id = req.params.id;
  const { status } = req.body;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400).send({ error: 'Invalid ID format' });
    return;
  }
  if (typeof status !== 'number' || ![0, 1].includes(status)) {
    res.status(400).send({ error: 'Invalid status value' });
    return;
  }
  brandService.updateBrand(id, { status })
    .then((updated) => {
      if (!updated) {
        res.status(404).send({ error: 'Brand not found' });
        return;
      }
      res.send({ id, status: updated.status });
    })
    .catch((err) => {
      console.error('Error updating brand status:', err.message);
      res.status(500).send({ error: 'Internal Server Error' });
    });
}

module.exports = {
  getAll,
  getOne,
  getBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
  updateBrandStatus
};
