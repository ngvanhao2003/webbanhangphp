const Category = require('../model/categories.model');

const getAll = async () => {
    try {
        const categories = await Category.find();
        return categories.length === 0 ? null : categories;
    } catch (err) {
        throw err;
    }
};

const createCategory = async ({ category_name, slug, sort_order, parent, status }) => {
    try {
        console.log('Data received for category creation:', { category_name, slug, sort_order, parent, status });

        const category = new Category({
            category_name,
            slug,
            sort_order,
            parent: parent || null, // Default to null if parent is not provided
            status,
            created_at: new Date()
        });

        const result = await category.save();
        console.log('Category created successfully:', result);
        return result;
    } catch (err) {
        console.error('Error inserting category:', err); // Log the full error
        throw new Error('Error inserting category: ' + err.message);
    }
};

const getOne = async (id) => {
    try {
        const category = await Category.findById(id); // Tìm theo id
        return category || null; // Trả về null nếu không tìm thấy
    } catch (err) {
        console.error('Error fetching category:', err); // Log lỗi chi tiết
        throw new Error('Error fetching category: ' + err.message); // Ném lỗi để handler xử lý
    }
};


const updateCategory = async ({ category_name, slug, sort_order, parent, status }, id) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!id) {
            throw new Error('ID is required');
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            {
                category_name,
                slug,
                sort_order,
                parent: parent || null,
                status
            },
            { new: true, runValidators: true } // Trả về bản ghi sau khi cập nhật
        );

        if (!updatedCategory) {
            return { message: 'Category not found' }; // Trả về thông báo nếu không tìm thấy
        }

        return updatedCategory; // Trả về dữ liệu đã cập nhật
    } catch (err) {
        console.error('Error updating category:', err.message); // Log lỗi chi tiết
        throw new Error('Error updating category: ' + err.message); // Ném lỗi để handler xử lý
    }
};

const updateCategoryStatus = async (id, status) => {
    try {
        if (!id) throw new Error('ID is required');
        const updated = await Category.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );
        return updated;
    } catch (err) {
        console.error('Error updating category status:', err.message);
        throw new Error('Error updating category status: ' + err.message);
    }
};

const delCategory = async (id) => {
    try {
        // Kiểm tra ID hợp lệ
        if (!id) {
            throw new Error('ID is required');
        }

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return { message: 'Category not found' }; // Trả về thông báo nếu không tìm thấy
        }

        return { message: 'Category deleted successfully', deletedCategory }; // Trả về thông báo và dữ liệu đã xóa
    } catch (err) {
        console.error('Error deleting category:', err.message); // Log lỗi chi tiết
        throw new Error('Error deleting category: ' + err.message); // Ném lỗi để handler xử lý
    }
};

/**
 * Lấy danh mục nổi bật (các danh mục chính có status = 1)
 * @returns {Promise<Array>} - Danh sách danh mục nổi bật
 */
const getFeaturedCategories = async () => {
    try {
        // Lấy các danh mục chính (parent = null) và có trạng thái hoạt động (status = 1)
        const categories = await Category.find({ 
            parent: null,
            status: 1
        }).sort({ sort_order: 1 });

        // Với mỗi danh mục chính, lấy thêm danh sách danh mục con
        const result = [];
        
        for (const category of categories) {
            const children = await Category.find({
                parent: category._id,
                status: 1
            }).sort({ sort_order: 1 });
            
            result.push({
                ...category.toObject(),
                children: children
            });
        }
        
        return result;
    } catch (err) {
        console.error('Error fetching featured categories:', err.message);
        throw new Error('Error fetching featured categories: ' + err.message);
    }
};

module.exports = {
    getAll,
    createCategory,
    getOne,
    updateCategory,
    delCategory,
    getFeaturedCategories,
    updateCategoryStatus
};