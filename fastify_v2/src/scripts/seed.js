/**
 * Script tạo dữ liệu mẫu cho shop bán quần áo
 */
const mongoose = require('mongoose');
const Category = require('../model/categories.model');
const Brand = require('../model/brand.model');
const Product = require('../model/product.model');

// Kết nối với cơ sở dữ liệu MongoDB
const connectToDB = async () => {
  try {
    // Sử dụng biến môi trường hoặc có thể thay thế bằng URL MongoDB thực tế của bạn
    await mongoose.connect('mongodb://localhost:27017/fastify', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Kết nối thành công với MongoDB.');
  } catch (error) {
    console.error('Kết nối thất bại:', error.message);
    process.exit(1);
  }
};

// Xóa dữ liệu hiện tại
const clearData = async () => {
  try {
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    console.log('Đã xóa dữ liệu hiện tại');
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu:', error.message);
  }
};

// Tạo dữ liệu danh mục
const seedCategories = async () => {
  try {
    const categories = [
      {
        category_name: 'Áo',
        slug: 'ao',
        sort_order: 1,
        parent: null,
        status: 1,
      },
      {
        category_name: 'Quần',
        slug: 'quan',
        sort_order: 2,
        parent: null,
        status: 1,
      },
      {
        category_name: 'Váy',
        slug: 'vay',
        sort_order: 3,
        parent: null,
        status: 1,
      },
      {
        category_name: 'Áo phông',
        slug: 'ao-phong',
        sort_order: 1,
        status: 1,
      },
      {
        category_name: 'Áo sơ mi',
        slug: 'ao-so-mi',
        sort_order: 2,
        status: 1,
      },
      {
        category_name: 'Áo khoác',
        slug: 'ao-khoac',
        sort_order: 3,
        status: 1,
      },
      {
        category_name: 'Quần jeans',
        slug: 'quan-jeans',
        sort_order: 1,
        status: 1,
      },
      {
        category_name: 'Quần shorts',
        slug: 'quan-shorts',
        sort_order: 2,
        status: 1,
      },
      {
        category_name: 'Quần âu',
        slug: 'quan-au',
        sort_order: 3,
        status: 1,
      },
      {
        category_name: 'Váy ngắn',
        slug: 'vay-ngan',
        sort_order: 1,
        status: 1,
      },
      {
        category_name: 'Váy dài',
        slug: 'vay-dai',
        sort_order: 2,
        status: 1,
      },
      {
        category_name: 'Đầm',
        slug: 'dam',
        sort_order: 3,
        status: 1,
      }
    ];

    // Tạo trước các danh mục chính
    const mainCategories = await Category.create(categories.slice(0, 3));
    
    // Tạo danh mục con với tham chiếu đến danh mục cha
    const subCategories = categories.slice(3);

    // Gán danh mục con cho danh mục Áo
    for (let i = 0; i < 3; i++) {
      subCategories[i].parent = mainCategories[0]._id;
    }

    // Gán danh mục con cho danh mục Quần
    for (let i = 3; i < 6; i++) {
      subCategories[i].parent = mainCategories[1]._id;
    }

    // Gán danh mục con cho danh mục Váy
    for (let i = 6; i < 9; i++) {
      subCategories[i].parent = mainCategories[2]._id;
    }

    await Category.create(subCategories);
    console.log('Đã tạo dữ liệu danh mục thành công');
    return { mainCategories, allCategories: [...mainCategories, ...await Category.find({ parent: { $ne: null } })] };
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu danh mục:', error.message);
    return { mainCategories: [], allCategories: [] };
  }
};

// Tạo dữ liệu thương hiệu
const seedBrands = async () => {
  try {
    const brands = [
      {
        name: 'Uniqlo',
        slug: 'uniqlo',
        description: 'Thương hiệu thời trang nổi tiếng đến từ Nhật Bản',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UNIQLO_logo.svg/1200px-UNIQLO_logo.svg.png',
        website: 'https://www.uniqlo.com',
        country_of_origin: 'Nhật Bản',
        founded_year: 1949,
        status: 1,
      },
      {
        name: 'Zara',
        slug: 'zara',
        description: 'Thương hiệu thời trang nhanh hàng đầu thế giới từ Tây Ban Nha',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Zara_Logo.svg/1200px-Zara_Logo.svg.png',
        website: 'https://www.zara.com',
        country_of_origin: 'Tây Ban Nha',
        founded_year: 1975,
        status: 1,
      },
      {
        name: 'H&M',
        slug: 'h-and-m',
        description: 'Thương hiệu thời trang bình dân nổi tiếng từ Thụy Điển',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1200px-H%26M-Logo.svg.png',
        website: 'https://www.hm.com',
        country_of_origin: 'Thụy Điển',
        founded_year: 1947,
        status: 1,
      },
      {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Thương hiệu thể thao nổi tiếng thế giới từ Đức',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1200px-Adidas_Logo.svg.png',
        website: 'https://www.adidas.com',
        country_of_origin: 'Đức',
        founded_year: 1949,
        status: 1,
      },
      {
        name: 'Nike',
        slug: 'nike',
        description: 'Thương hiệu thể thao hàng đầu thế giới từ Mỹ',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png',
        website: 'https://www.nike.com',
        country_of_origin: 'Mỹ',
        founded_year: 1964,
        status: 1,
      }
    ];

    const createdBrands = await Brand.create(brands);
    console.log('Đã tạo dữ liệu thương hiệu thành công');
    return createdBrands;
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu thương hiệu:', error.message);
    return [];
  }
};

// Tạo dữ liệu sản phẩm
const seedProducts = async (categories, brands) => {
  try {
    // Hàm tạo mã màu ngẫu nhiên
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    // Hàm tạo giá tiền ngẫu nhiên trong khoảng
    const getRandomPrice = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
    };

    // Hàm tạo số lượng tồn kho ngẫu nhiên
    const getRandomStock = () => {
      return Math.floor(Math.random() * 100) + 10;
    };

    // Danh sách kích thước phổ biến
    const commonSizes = ['S', 'M', 'L', 'XL'];
    const pantsAndSkirtsSize = ['28', '29', '30', '31', '32', '33', '34'];

    // Lấy danh sách sub-categories
    const subCategories = categories.filter(cat => cat.parent !== null);

    // Tạo mảng sản phẩm
    let products = [];

    // Tạo sản phẩm cho từng danh mục con
    for (const category of subCategories) {
      // Xác định kích thước phù hợp với loại sản phẩm
      let sizesArr;
      if (category.slug.includes('quan')) {
        sizesArr = pantsAndSkirtsSize;
      } else {
        sizesArr = commonSizes;
      }

      // Tạo 5 sản phẩm cho mỗi danh mục con
      for (let i = 1; i <= 5; i++) {
        // Chọn ngẫu nhiên một thương hiệu
        const brand = brands[Math.floor(Math.random() * brands.length)];
        // Chọn ngẫu nhiên 1 size
        const size = sizesArr[Math.floor(Math.random() * sizesArr.length)];
        // Tạo tên sản phẩm dựa trên danh mục và thương hiệu
        const name = `${brand.name} ${category.category_name} #${i}`;
        products.push({
          name,
          description: `Sản phẩm ${category.category_name.toLowerCase()} chất lượng cao từ thương hiệu ${brand.name}. Phù hợp với nhiều phong cách thời trang khác nhau, từ đi làm đến đi chơi.`,
          price: getRandomPrice(100, 2000),
          stock: getRandomStock(),
          category: category._id,
          brand: brand._id,
          imageUrl: `https://loremflickr.com/320/240/fashion,${category.category_name.toLowerCase()}/all`,
          status: 1,
          size: size,
          color: getRandomColor(), // Màu sắc sản phẩm (mới thêm)
        });
      }
    }

    await Product.create(products);
    console.log(`Đã tạo ${products.length} sản phẩm thành công`);
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu sản phẩm:', error.message);
  }
};

// Chạy tất cả các hàm seed
const seedData = async () => {
  await connectToDB();
  await clearData();
  const { allCategories } = await seedCategories();
  const brands = await seedBrands();
  await seedProducts(allCategories, brands);
  
  console.log('Tạo dữ liệu mẫu hoàn tất!');
  process.exit();
};

// Thực thi hàm seedData
seedData();