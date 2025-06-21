const Brand = require('../model/brand.model');
const Category = require('../model/categories.model');
const productService = require('../services/product.service');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const util = require('util');
const pipeline = util.promisify(require('stream').pipeline);
const mongoose = require('mongoose');

/**
 * Lấy tất cả sản phẩm
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Danh sách sản phẩm và thông tin phân trang
 */
async function getAll(request, reply) {
  try {
    const { page = 1, limit = 10, sort = 'created_at:desc', name, category, brand, status = 'all' } = request.query;

    // Xây dựng filter object
    let filter = {};
    if (status !== 'all') filter.status = Number(status);
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (category) {
      // Nếu là ObjectId thì filter luôn
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = new mongoose.Types.ObjectId(category);
      } else {
        // Nếu là tên, tìm id của category theo category_name
        const categoryDoc = await Category.findOne({ category_name: { $regex: category, $options: 'i' } });
        if (categoryDoc) {
          filter.category = categoryDoc._id;
        } else {
          // Không tìm thấy category, trả về rỗng để không lọc ra sản phẩm nào
          filter.category = null;
        }
      }
    }
    if (brand) {
      // Nếu là ObjectId thì filter luôn
      if (mongoose.Types.ObjectId.isValid(brand)) {
        filter.brand = new mongoose.Types.ObjectId(brand);
      } else {
        // Nếu là tên, tìm id của brand trước
        const brandDoc = await Brand.findOne({ name: { $regex: brand, $options: 'i' } });
        if (brandDoc) {
          filter.brand = brandDoc._id;
        } else {
          // Không tìm thấy brand, trả về rỗng
          filter.brand = null;
        }
      }
    }

    // Tạo đối tượng sắp xếp
    let sortObj = {};
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj[field] = order === 'desc' ? -1 : 1;
    } else {
      sortObj = { created_at: -1, _id: 1 };
    }

    // Gọi service để lấy dữ liệu
    const products = await productService.getAllProducts(
      parseInt(page),
      parseInt(limit),
      sortObj,
      status,
      filter // truyền filter xuống service
    );

    return reply.code(200).send({
      success: true,
      data: products.items,
      pagination: {
        total: products.totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: products.totalPages
      }
    });
  } catch (error) {
    return reply.code(500).send({ success: false, error: error.message });
  }
}

/**
 * Lấy thông tin chi tiết một sản phẩm
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Thông tin chi tiết sản phẩm
 */
async function getOne(request, reply) {
  try {
    const { id } = request.params;
    
    // Kiểm tra định dạng ID hợp lệ (MongoDB ObjectId)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return reply.code(400).send({ 
        success: false,
        error: 'Invalid ID format'
      });
    }
    
    // Gọi service để lấy thông tin chi tiết sản phẩm
    const product = await productService.getProductById(id);
    
    if (!product) {
      return reply.code(404).send({
        success: false,
        error: 'Product not found'
      });
    }
    
    return reply.code(200).send({
      success: true,
      data: product
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
 * Tạo mới sản phẩm
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Sản phẩm mới được tạo
 */
async function createProduct(request, reply) {
  try {
    // Sử dụng request.parts() để xử lý multipart
    const parts = request.parts();
    const data = {};
    let imageFilePath = null;

    for await (const part of parts) {
      if (part.file) {
        // Lưu file hình ảnh vào thư mục uploads
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Đặt tên file an toàn
        const filename = `${Date.now()}-${part.filename.replace(/\s+/g, '_')}`;
        const filepath = path.join(uploadDir, filename);

        // Lưu file vào ổ đĩa
        await pipeline(part.file, fs.createWriteStream(filepath));

        // Lưu đường dẫn ảnh vào `imageFilePath`
        imageFilePath = `/uploads/${filename}`;
      } else {
        // Xử lý các trường khác
        data[part.fieldname] = part.value;
      }
    }

    // Kiểm tra và chuyển `variants` từ chuỗi JSON
    if (data.variants) {
      try {
        data.variants = JSON.parse(data.variants);
      } catch (e) {
        return reply.code(400).send({
          success: false,
          error: 'Variants phải là chuỗi JSON hợp lệ',
        });
      }
    } else {
      return reply.code(400).send({
        success: false,
        error: 'Missing variants',
      });
    }

    // Validate các trường bắt buộc
    const { name, description, price, category, brand, status, variants } = data;
    if (!name || !description || !price || !category || !brand || status === undefined || !Array.isArray(variants) || variants.length === 0) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required fields or variants'
      });
    }

    // Validate biến thể
    for (const v of variants) {
      if (!v.color || !v.size || typeof v.stock !== 'number') {
        return reply.code(400).send({
          success: false,
          error: 'Each variant must have color, size, stock (number)'
        });
      }
    }

    // Tạo sản phẩm mới
    const newProduct = await productService.createProduct({
      name,
      description,
      price: Number(price),
      sale_price: data.sale_price ? Number(data.sale_price) : null, // Thêm giá khuyến mãi nếu có
      category,
      brand,
      image: imageFilePath,
      status: Number(status),
      variants,
    });

    return reply.code(201).send({ success: true, data: newProduct });
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
 * Cập nhật sản phẩm
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Sản phẩm đã được cập nhật
 */
async function updateProduct(request, reply) {
  try {
    const { id } = request.params;
    const parts = request.parts();

    const data = {};
    let imageFilePath = null;

    for await (const part of parts) {
      if (part.file) {
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

    console.log('Parsed data:', data);
    console.log('Image file path:', imageFilePath);

    if (!data.variants) {
      return reply.code(400).send({ success: false, error: 'Thiếu trường variants' });
    }

    try {
      data.variants = JSON.parse(data.variants);
    } catch (err) {
      return reply.code(400).send({ success: false, error: 'Variants phải là JSON hợp lệ' });
    }

    const requiredFields = ['name', 'description', 'detail', 'price', 'category', 'brand', 'status'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return reply.code(400).send({ success: false, error: `Thiếu trường bắt buộc: ${field}` });
      }
    }

    if (!Array.isArray(data.variants) || data.variants.length === 0) {
      return reply.code(400).send({ success: false, error: 'Variants không hợp lệ hoặc rỗng' });
    }

    for (const v of data.variants) {
      if (!v.color || !v.size || typeof v.stock !== 'number') {
        return reply.code(400).send({ success: false, error: 'Mỗi variant phải có color, size, stock (number)' });
      }
    }

    if (!imageFilePath && data.image) {
      imageFilePath = data.image;
    }

    const price = Number(data.price);
    const status = Number(data.status);

    const updated = await productService.updateProduct(id, {
      name: data.name,
      description: data.description,
      detail: data.detail || null,  // thêm dòng này
      price: Number(data.price),
      sale_price: data.sale_price ? Number(data.sale_price) : null,  // thêm dòng này
      category: data.category,
      brand: data.brand,
      status: Number(data.status),
      image: imageFilePath,
      variants: data.variants,
    });

    if (!updated) {
      return reply.code(404).send({ success: false, error: 'Không tìm thấy sản phẩm để cập nhật' });
    }

    return reply.code(200).send({ success: true, data: updated });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ success: false, error: 'Lỗi máy chủ nội bộ', message: error.message });
  }
}


/**
 * Cập nhật trạng thái sản phẩm
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Sản phẩm đã được cập nhật
 */
async function updateProductStatus(request, reply) {
  try {
    const { id } = request.params;
    const { status } = request.body;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return reply.code(400).send({ success: false, error: 'Invalid ID format' });
    }
    if (![0, 1].includes(status)) {
      return reply.code(400).send({ success: false, error: 'Status must be 0 hoặc 1' });
    }
    const updated = await productService.updateProduct(id, { status });
    if (!updated) {
      return reply.code(404).send({ success: false, error: 'Product not found' });
    }
    return reply.code(200).send({ success: true, data: updated });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ success: false, error: 'Internal Server Error', message: error.message });
  }
}

/**
 * Search and filter products
 * @param {Object} request - The request object
 * @param {Object} reply - The reply object
 * @returns {Promise<Object>} - The response object
 */
async function searchProducts(request, reply) {
  try {
    const { name, minPrice, maxPrice, category, brand, size, color, sort, page = 1, limit = 10 } = request.query;
    
    // Build filters object
    const filters = {};
    
    // Add filters if they exist
    if (name) filters.name = name;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (size) filters.size = size;
    if (color) filters.color = color;
    
    // Prepare sort object
    let sortObj = {};
    if (sort) {
      const [field, direction] = sort.split(':');
      sortObj[field] = direction === 'desc' ? -1 : 1;
    } else {
      sortObj = { created_at: -1 }; // Default sort by creation date
    }
    
    // Use productService instead of direct DB access
    const result = await productService.searchProducts(
      filters,
      sortObj,
      parseInt(page),
      parseInt(limit)
    );
    
    return reply.code(200).send({
      success: true,
      data: result.items,
      pagination: {
        total: result.totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: result.totalPages
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
 * Lấy danh sách sản phẩm theo danh mục
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Danh sách sản phẩm theo danh mục
 */

async function getProductsByCategory(request, reply) {
  try {
    const { categoryId } = request.params;
    const { page = 1, limit = 10 } = request.query;

    // Validate categoryId...

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Truy vấn và populate category, brand
    const products = await Product.find({ category: categoryId })
      .populate('category')  // <-- populate để lấy thông tin danh mục
      .populate('brand')     // <-- populate để lấy thông tin thương hiệu
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .exec();

    // Tính tổng số sản phẩm, trang...
    const totalItems = await Product.countDocuments({ category: categoryId });

    // Trả về dữ liệu
    return reply.code(200).send({
      success: true,
      data: products,
      pagination: {
        total: totalItems,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalItems / limitNumber),
      },
    });
  } catch (error) {
    // Xử lý lỗi...
    return reply.code(500).send({
      success: false,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}

/**
 * Lấy sản phẩm theo danh mục
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Danh sách sản phẩm theo danh mục
 */
async function getByCategory(request, reply) {
  try {
    const { categoryId } = request.params;
    const { page = 1, limit = 10, sort = 'created_at:desc' } = request.query;
    
    // Kiểm tra định dạng ID danh mục hợp lệ
    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return reply.code(400).send({ 
        success: false,
        error: 'Invalid category ID format'
      });
    }
    
    // Chuyển đổi tham số phân trang sang số nguyên
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Tạo đối tượng sắp xếp
    let sortObj = {};
    if (sort) {
      const [field, direction] = sort.split(':');
      sortObj[field] = direction === 'desc' ? -1 : 1;
    } else {
      sortObj = { created_at: -1 }; // Mặc định sắp xếp theo ngày tạo giảm dần
    }
    
    // Gọi service để lấy dữ liệu
    const products = await productService.getProductsByCategory(categoryId, pageNumber, limitNumber, sortObj);
    
    return reply.code(200).send({
      success: true,
      data: products.items,
      pagination: {
        total: products.totalItems,
        page: pageNumber,
        limit: limitNumber,
        pages: products.totalPages
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
 * Lọc và sắp xếp sản phẩm theo danh mục
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Danh sách sản phẩm đã lọc
 */
async function filterByCategory(request, reply) {
  try {
    const { categoryId } = request.params;
    const { minPrice, maxPrice, brand, size, color, sort, page = 1, limit = 10 } = request.query;
    
    // Kiểm tra định dạng ID danh mục hợp lệ
    if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return reply.code(400).send({ 
        success: false,
        error: 'Invalid category ID format'
      });
    }
    
    // Xây dựng đối tượng filter
    const filters = {
      category: categoryId
    };
    
    // Thêm các điều kiện lọc nếu có
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (brand) filters.brand = brand;
    if (size) filters.size = size;
    if (color) filters.color = color;
    
    // Tạo đối tượng sắp xếp
    let sortObj = {};
    if (sort) {
      const [field, direction] = sort.split(':');
      sortObj[field] = direction === 'desc' ? -1 : 1;
    } else {
      sortObj = { created_at: -1 }; // Mặc định sắp xếp theo ngày tạo giảm dần
    }
    
    // Gọi service để lọc sản phẩm
    const products = await productService.searchProducts(
      filters,
      sortObj,
      parseInt(page),
      parseInt(limit)
    );
    
    return reply.code(200).send({
      success: true,
      data: products.items,
      pagination: {
        total: products.totalItems,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: products.totalPages
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
 * Xóa sản phẩm theo ID
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Kết quả xóa sản phẩm
 */
async function deleteProduct(request, reply) {
  try {
    const { id } = request.params;
    // Kiểm tra định dạng ID hợp lệ (MongoDB ObjectId)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return reply.code(400).send({ success: false, error: 'Invalid ID format' });
    }
    const deleted = await productService.deleteProduct(id);
    if (!deleted) {
      return reply.code(404).send({ success: false, error: 'Product not found' });
    }
    return reply.code(200).send({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ success: false, error: 'Internal Server Error', message: error.message });
  }
}

/**
 * Nhập khẩu sản phẩm từ file Excel
 * @param {Object} request - Request object
 * @param {Object} reply - Reply object
 * @returns {Promise<Object>} - Kết quả nhập khẩu
 */
async function importExcel(request, reply) {
  try {
    const products = request.body;
    if (!Array.isArray(products) || products.length === 0) {
      return reply.code(400).send({ success: false, error: 'No data to import' });
    }

    const categoryCache = {};
    const brandCache = {};
    let importCount = 0;

    for (const prod of products) {
      try {
        // Xử lý category
        let categoryId = null;
        const catName = prod.category?.trim();
        if (catName) {
          if (categoryCache[catName.toLowerCase()]) {
            categoryId = categoryCache[catName.toLowerCase()];
          } else {
            let category = await Category.findOne({ category_name: new RegExp(`^${catName}$`, 'i') });
            if (!category) {
              try {
                category = await Category.create({
                  category_name: catName,
                  slug: catName.toLowerCase().replace(/\s+/g, '-'),
                  status: 1,
                  sort_order: 0
                });
              } catch (err) {
                // Nếu bị trùng unique, lấy lại bản ghi đã có
                if (err.code === 11000) {
                  category = await Category.findOne({ category_name: new RegExp(`^${catName}$`, 'i') });
                } else {
                  throw err;
                }
              }
            }
            categoryId = category._id;
            categoryCache[catName.toLowerCase()] = categoryId;
          }
        }

        // Xử lý brand
        let brandId = null;
        const brandName = prod.brand?.trim();
        if (brandName) {
          if (brandCache[brandName.toLowerCase()]) {
            brandId = brandCache[brandName.toLowerCase()];
          } else {
            let brand = await Brand.findOne({ name: new RegExp(`^${brandName}$`, 'i') });
            if (!brand) {
              try {
                brand = await Brand.create({
                  name: brandName,
                  slug: brandName.toLowerCase().replace(/\s+/g, '-')
                });
              } catch (err) {
                if (err.code === 11000) {
                  brand = await Brand.findOne({ name: new RegExp(`^${brandName}$`, 'i') });
                } else {
                  throw err;
                }
              }
            }
            brandId = brand._id;
            brandCache[brandName.toLowerCase()] = brandId;
          }
        }

        // Chuẩn hóa dữ liệu sản phẩm
        const productData = {
          ...prod,
          brand: brandId,
          category: categoryId,
        };
        await productService.createProduct(productData);
        importCount++;
      } catch (err) {
        // Log lỗi từng sản phẩm, nhưng không throw để không làm hỏng toàn bộ import
        console.error("Import sản phẩm lỗi:", err.message);
      }
    }
    return reply.code(201).send({ success: true, imported: importCount });
  } catch (error) {
    console.error('Import Excel error:', error);
    return reply.code(500).send({ success: false, error: error.message });
  }
}

module.exports = {
  getAll,
  getOne,
  createProduct,
  updateProduct,
  searchProducts,
  getProductsByCategory,
  getByCategory,
  filterByCategory,
  updateProductStatus,
  deleteProduct,
  importExcel,
};
