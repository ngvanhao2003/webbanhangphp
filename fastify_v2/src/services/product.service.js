const Product = require('../model/product.model');
const Order = require('../model/order.model');
const OrderDetail = require('../model/order_detail.model');

/**
 * Lấy tất cả sản phẩm với phân trang và sắp xếp
 * @param {Number} page - Số trang hiện tại
 * @param {Number} limit - Số sản phẩm trên mỗi trang
 * @param {Object} sortOptions - Tùy chọn sắp xếp
 * @returns {Promise<Object>} - Danh sách sản phẩm và thông tin phân trang
 */
// Sửa lại getAllProducts nhận status từ controller
async function getAllProducts(page = 1, limit = 10, sortOptions = { created_at: -1, _id: 1 }, status = 'all', filter = {}) {
  try {
    const skip = (page - 1) * limit;
    let query = { ...filter };
    // Nếu status truyền vào là 'all' thì bỏ qua, còn lại thì đã có trong filter

    const items = await Product.find(query)
      .populate('category')
      .populate('brand')
      .sort({ created_at: -1, _id: 1 }) // Sắp xếp mới nhất lên đầu
      .limit(limit)
      .skip(skip)
      .exec();

    const totalItems = await Product.countDocuments(query);

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Lấy thông tin chi tiết một sản phẩm theo ID
 * @param {String} id - ID của sản phẩm
 * @returns {Promise<Object>} - Thông tin chi tiết sản phẩm
 */
async function getProductById(id) {
  try {
    return await Product.findById(id)
      .populate('category')
      .populate('brand')
      .exec();
  } catch (error) {
    throw error;
  }
}

/**
 * Tạo mới sản phẩm
 * @param {Object} productData - Dữ liệu sản phẩm mới
 * @returns {Promise<Object>} - Sản phẩm vừa được tạo
 */
async function createProduct(productData) {
  try {
    const product = new Product(productData);
    return await product.save();
  } catch (error) {
    throw error;
  }
}

/**
 * Cập nhật thông tin sản phẩm
 * @param {String} id - ID của sản phẩm cần cập nhật
 * @param {Object} productData - Dữ liệu cập nhật
 * @returns {Promise<Object>} - Sản phẩm sau khi cập nhật
 */
async function updateProduct(id, productData) {
  try {
    // Cập nhật thời gian cập nhật mới nhất
    productData.updated_at = Date.now();
    
    return await Product.findByIdAndUpdate(
      id, 
      productData,
      { new: true } // Trả về sản phẩm sau khi cập nhật
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Tìm kiếm và lọc sản phẩm
 * @param {Object} filters - Các điều kiện lọc
 * @param {Object} sortOptions - Tùy chọn sắp xếp
 * @param {Number} page - Số trang hiện tại
 * @param {Number} limit - Số sản phẩm trên mỗi trang
 * @returns {Promise<Object>} - Danh sách sản phẩm và thông tin phân trang
 */
async function searchProducts(filters, sortOptions = { created_at: -1 }, page = 1, limit = 10) {
  try {
    // Xây dựng query dựa trên các filter
    const query = { status: 1 };
    
    if (filters.name) {
      query.name = { $regex: filters.name, $options: 'i' };
    }
    
    if (filters.minPrice || filters.maxPrice) {
      query.price = {};
      if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
      if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
    }
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.brand) {
      query.brand = filters.brand;
    }
    
    // Lọc theo biến thể (color, size) nếu có
    if (filters.color) {
      query['variants.color'] = filters.color;
    }
    if (filters.size) {
      query['variants.size'] = filters.size;
    }
    
    // Tính toán số sản phẩm cần bỏ qua
    const skip = (page - 1) * limit;
    
    // Thực hiện truy vấn với phân trang và sắp xếp
    const items = await Product.find(query)
      .populate('category')
      .populate('brand')
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .exec();
      
    // Đếm tổng số sản phẩm để tính toán thông tin phân trang
    const totalItems = await Product.countDocuments(query);
    
    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Lấy danh sách sản phẩm bán chạy nhất
 * @param {Number} limit - Số lượng sản phẩm cần lấy
 * @returns {Promise<Array>} - Danh sách sản phẩm bán chạy
 */
async function getBestSellingProducts(limit = 10) {
  try {
    const bestSelling = await Order.aggregate([
      // Chỉ lấy đơn hàng đã hoàn thành
      { $match: { order_status: 'completed' } },
      // Kết nối với bảng chi tiết đơn hàng
      { $lookup: {
          from: 'order_details',
          localField: '_id',
          foreignField: 'order_id',
          as: 'details'
        }
      },
      // Mở rộng mảng chi tiết
      { $unwind: '$details' },
      // Nhóm theo sản phẩm và tính tổng số lượng đã bán
      { $group: {
          _id: '$details.product_id',
          totalSold: { $sum: '$details.quantity' }
        }
      },
      // Sắp xếp theo số lượng giảm dần
      { $sort: { totalSold: -1 } },
      // Giới hạn số lượng kết quả
      { $limit: limit }
    ]);

    const productIds = bestSelling.map(item => item._id);
    
    // Lấy thông tin chi tiết các sản phẩm
    const products = await Product.find({ 
      _id: { $in: productIds },
      status: 1 
    })
      .populate('category')
      .populate('brand');
    
    // Sắp xếp theo thứ tự bán chạy
    const sortedProducts = [];
    for (const item of bestSelling) {
      const product = products.find(p => p._id.toString() === item._id.toString());
      if (product) {
        sortedProducts.push({
          ...product.toObject(),
          totalSold: item.totalSold
        });
      }
    }
    
    return sortedProducts;
  } catch (error) {
    throw error;
  }
}

/**
 * Lấy sản phẩm theo danh mục
 * @param {String} categoryId - ID của danh mục
 * @param {Number} page - Số trang hiện tại
 * @param {Number} limit - Số sản phẩm trên mỗi trang
 * @param {Object} sortOptions - Tùy chọn sắp xếp
 * @returns {Promise<Object>} - Danh sách sản phẩm và thông tin phân trang
 */
async function getProductsByCategory(categoryId, page = 1, limit = 10, sortOptions = { created_at: -1 }) {
  try {
    // Tính toán số sản phẩm cần bỏ qua
    const skip = (page - 1) * limit;

    // Tạo điều kiện truy vấn
    const query = {
      status: 1,
      category: categoryId
    };

    // Thực hiện truy vấn với phân trang và sắp xếp
    const items = await Product.find(query)
      .populate('category')
      .populate('brand')
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .exec();

    // Đếm tổng số sản phẩm để tính toán thông tin phân trang
    const totalItems = await Product.countDocuments(query);

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Xóa sản phẩm theo ID
 * @param {String} id - ID của sản phẩm cần xóa
 * @returns {Promise<Object|null>} - Sản phẩm đã bị xóa hoặc null nếu không tìm thấy
 */
async function deleteProduct(id) {
  try {
    return await Product.findByIdAndDelete(id);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  searchProducts,
  getBestSellingProducts,
  getProductsByCategory,
  deleteProduct,
};
