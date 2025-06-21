const categoriesService = require('../services/categories.service');
const ExcelJS = require('exceljs');
const Product = require('../model/product.model'); // Thêm dòng này ở đầu file

async function exportExcel(request, reply) {
    try {
        const categories = await categoriesService.getAll();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Categories');
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 10 },
            { header: 'Tên danh mục', key: 'category_name', width: 32 },
            { header: 'Slug', key: 'slug', width: 24 },
            { header: 'Trạng thái', key: 'status', width: 18 },
            { header: 'Ngày tạo', key: 'created_at', width: 24 },
        ];
        categories.forEach((cat, idx) => {
            worksheet.addRow({
                stt: idx + 1,
                category_name: cat.category_name,
                slug: cat.slug,
                status: cat.status === 1 ? 'Hoạt động' : 'Chưa hoạt động',
                created_at: cat.created_at,
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();

        reply
            .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            .header('Content-Disposition', 'attachment; filename="categories.xlsx"')
            .send(buffer);
    } catch (err) {
        reply.code(500).send({ message: 'Export failed', error: err.message });
    }
}

async function importExcel(request, reply) {
    try {
        const data = await request.file();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.read(data.file);

        const worksheet = workbook.worksheets[0];
        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Bỏ qua header
            const [stt, category_name, slug, status, created_at] = row.values.slice(1);
            if (category_name && slug) {
                const statusStr = (status || '').toString().trim().toLowerCase();
                let statusValue = 0;
                if (statusStr === 'hoạt động' || statusStr === 'hoat dong') statusValue = 1;

                rows.push({
                    category_name: category_name.trim(),
                    slug: slug.trim(),
                    status: statusValue,
                    created_at: created_at || new Date(),
                    sort_order: stt || rowNumber - 1 // Gán sort_order từ STT hoặc số dòng
                });
            }
        });

        // Lưu từng danh mục vào DB, kiểm tra trùng tên trước khi tạo
        const Category = require('../model/categories.model');
        let importCount = 0;
        for (const cat of rows) {
            // Chuẩn hóa tên để kiểm tra trùng (không phân biệt hoa thường, loại bỏ khoảng trắng thừa)
            const existed = await Category.findOne({ 
                category_name: new RegExp(`^${cat.category_name.replace(/\s+/g, ' ').trim()}$`, 'i')
            });
            if (!existed) {
                await categoriesService.createCategory(cat);
                importCount++;
            }
            // Nếu đã tồn tại thì bỏ qua, không tạo mới
        }

        reply.send({ message: 'Import thành công', count: importCount });
    } catch (err) {
        console.error('Import Excel error:', err);
        reply.code(500).send({ message: 'Import thất bại', error: err.message });
    }
}

function getAll(req, res) {
    categoriesService.getAll()
    .then((result) => {
        res.send(result);
    })
    .catch((err) => {
        console.error('Database error:', err);
        res.status(500).send({error: 'Internal Server Error'});
    });
}

function getOne(req, res) {
    const id = req.params.id; // Thay slug bằng id
    
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' }); // Trả về lỗi 400 nếu id không hợp lệ
        return;
    }  
      
    categoriesService.getOne(id)
    .then((result) => {
        if (!result) {
            res.status(404).send({ error: 'Not found' });
            return;
        }
        res.send(result); // Không cần [0] nếu result là đối tượng
    })
    .catch((err) => {
        console.error('Database error:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    });
}

function createCategory(req, res) {
    const data = req.body;
    categoriesService.createCategory(data)
        .then((result) => {
            const id = result._id; // Sử dụng _id thay vì insertId
            return categoriesService.getOne(id);
        })
        .then((item) => {
            if (item) {
                res.send(item); // Gửi toàn bộ đối tượng
            } else {
                res.status(404).send({ error: 'Category not found' });
            }
        })
        .catch((err) => {
            console.error('Database error:', err);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function updateCategory(req, res) {
    const id = req.params.id;
    const data = req.body;

    // Kiểm tra ID hợp lệ
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }

    // Gọi service để cập nhật danh mục
    categoriesService.updateCategory(data, id)
        .then((updatedCategory) => {
            if (!updatedCategory) {
                res.status(404).send({ error: 'Category not found' });
                return;
            }

            // Lấy lại thông tin danh mục sau khi cập nhật
            return categoriesService.getOne(id);
        })
        .then((item) => {
            if (item) {
                res.send(item); // Gửi toàn bộ đối tượng đã cập nhật
            } else {
                res.status(404).send({ error: 'Category not found after update' });
            }
        })
        .catch((err) => {
            console.error('Error updating category:', err.message);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

function delCategory(req, res) {
    const id = req.params.id;

    // Kiểm tra ID hợp lệ
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).send({ error: 'Invalid ID format' });
        return;
    }

    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    Product.findOne({ category: id })
        .then((product) => {
            if (product) {
                res.status(400).send({ error: 'Không thể xóa danh mục vì còn sản phẩm thuộc danh mục này.' });
                return;
            }
            // Gọi service để kiểm tra danh mục trước khi xóa
            return categoriesService.getOne(id);
        })
        .then((category) => {
            if (!category) {
                res.status(404).send({ error: 'Category not found' });
                return;
            }
            // Nếu danh mục tồn tại, tiếp tục xóa
            return categoriesService.delCategory(id);
        })
        .then((deleted) => {
            if (deleted && !deleted.error) {
                res.send({ message: 'Category deleted successfully', deleted });
            }
        })
        .catch((err) => {
            if (!res.headersSent) {
                console.error('Error deleting category:', err.message);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });
}

function updateCategoryStatus(req, res) {
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
    categoriesService.updateCategoryStatus(id, status)
        .then((updated) => {
            if (!updated) {
                res.status(404).send({ error: 'Category not found' });
                return;
            }
            res.send({ id, status: updated.status });
        })
        .catch((err) => {
            console.error('Error updating category status:', err.message);
            res.status(500).send({ error: 'Internal Server Error' });
        });
}

module.exports = {
    getAll,
    createCategory,
    getOne,
    updateCategory,
    delCategory,
    updateCategoryStatus,
    exportExcel,
    importExcel, // thêm dòng này
};