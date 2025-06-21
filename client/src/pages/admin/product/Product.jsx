import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "../../../axios";
import * as XLSX from "xlsx"; // Import thư viện xlsx
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Helper: Chuẩn hóa tiếng Việt không dấu và thường
function normalizeVN(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

export default function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const baseUrl = "http://localhost:3000";
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    featuredProducts: 0,
  });

  // Thêm state cho filter
  const [filterName, setFilterName] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fileInputRef = useRef(null);

  // Format tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lấy sản phẩm theo trang, lấy đủ tất cả trạng thái
const fetchProducts = async (page = 1) => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");

    setProducts([]);

    // Gộp filter vào query string
    const params = new URLSearchParams({
      page,
      limit: 10,
      status: filterStatus || "all",
    });
    if (filterName) params.append("name", filterName);
    if (filterCategory) params.append("category", filterCategory);
    if (filterBrand) params.append("brand", filterBrand);

    const response = await axios.get(`/api/products?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data || !response.data.success) {
      throw new Error("Dữ liệu trả về không hợp lệ");
    }

    const productList = response.data.data || [];
    setProducts(productList);

    const pages = response.data.pagination?.pages || Math.ceil((response.data.pagination?.total || productList.length) / 10);
    setTotalPages(pages);

    setCurrentPage(page);

    setStats({
      totalProducts: response.data.pagination?.total || productList.length,
      activeProducts: productList.filter((p) => p.status === 1).length,
      inactiveProducts: productList.filter((p) => p.status === 0).length,
      featuredProducts: productList.filter((p) => p.featured || p.is_featured).length,
    });

    setLoading(false);
  } catch (error) {
    setError(error.message);
    setProducts([]);
    setLoading(false);
  }
};

  useEffect(() => {
    fetchProducts(currentPage);
  }, []);

  useEffect(() => {
  setCurrentPage(1);
  fetchProducts(1); // Gọi lại API với trang 1
  }, [filterName, filterCategory, filterBrand, filterStatus]);

  // Chuyển trang
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page);
  };
  const handleExportToExcel = async () => {
    try {
      // Hiển thị thông báo đang xuất file (có thể dùng state hoặc toast)
      // setExporting(true);

      const token = localStorage.getItem("adminToken");
      // Lấy tất cả sản phẩm (không phân trang)
      const response = await axios.get("/api/products?limit=10000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allProducts = response.data.data || [];

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh_sach_san_pham");

      worksheet.addRow([
        "STT",
        "Tên sản phẩm",
        "Ảnh",
        "Giá bán",
        "Giá KM",
        "Trạng thái",
        "Danh mục",
        "Thương hiệu",
        "Tồn kho",
        "Ngày tạo",
      ]);

      // Helper tải ảnh về dạng buffer
      const fetchImageBuffer = async (url) => {
        try {
          const res = await fetch(url, { mode: "cors" });
          const contentType = res.headers.get("content-type");
          // LỖI: Câu này sai cú pháp, gây lỗi khi chạy!
          // const ext = contentType && contentType.includes("png") ? "png" : "jpeg" : "jpg" : "webp";
          // Đúng phải là:
          let ext = "jpeg";
          if (contentType) {
            if (contentType.includes("png")) ext = "png";
            else if (contentType.includes("jpg")) ext = "jpg";
            else if (contentType.includes("webp")) ext = "webp";
          }
          return { buffer: await res.arrayBuffer(), ext };
        } catch {
          return null;
        }
      };

      // Duyệt từng sản phẩm và thêm vào sheet
      for (let idx = 0; idx < allProducts.length; idx++) {
        const product = allProducts[idx];
        const imageUrl = product.image && product.image.startsWith("http")
          ? product.image
          : `http://localhost:3000${product.image || ""}`;

        worksheet.addRow([
          idx + 1,
          product.name,
          "", // Ảnh sẽ chèn sau
          product.price,
          product.sale_price,
          product.status === 1 ? "Đang bán" : "Ngừng bán",
          product.category?.category_name || product.category?.name || "N/A",
          product.brand?.name || "N/A",
          Array.isArray(product.variants)
            ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
            : (product.stock ?? product.quantity ?? ""),
          product.created_at
            ? new Date(product.created_at).toLocaleDateString("vi-VN")
            : (product.createdAt ? new Date(product.createdAt).toLocaleDateString("vi-VN") : ""),
        ]);

        // Tải ảnh và chèn vào dòng vừa thêm
        if (imageUrl) {
          const imgData = await fetchImageBuffer(imageUrl);
          if (imgData && imgData.buffer) {
            const imageId = workbook.addImage({
              buffer: imgData.buffer, // hoặc new Uint8Array(imgData.buffer)
              extension: imgData.ext,
            });
            worksheet.addImage(imageId, {
              tl: { col: 2, row: idx + 1 },
              ext: { width: 60, height: 60 },
              editAs: "oneCell",
            });
          }
        }
      }

      // Sau khi thêm tất cả sản phẩm và ảnh vào worksheet

      // Đặt chiều cao cho tất cả các hàng (trừ header)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber !== 1) { // Bỏ qua header
          row.height = 48; // hoặc 60 tùy kích thước ảnh bạn chọn
        }
      });

      // Đặt chiều rộng cột cho đẹp (nếu chưa có)
      worksheet.columns = [
        { width: 6 },   // STT
        { width: 30 },  // Tên sản phẩm
        { width: 12 },  // Ảnh
        { width: 12 },  // Giá bán
        { width: 12 },  // Giá KM
        { width: 14 },  // Trạng thái
        { width: 18 },  // Danh mục
        { width: 18 },  // Thương hiệu
        { width: 10 },  // Tồn kho
        { width: 14 },  // Ngày tạo
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Products_List.xlsx");

      // setExporting(false);
    } catch (err) {
      console.error("Export Excel error:", err); // Thêm dòng này để xem lỗi chi tiết
      alert("Có lỗi khi xuất Excel. Vui lòng thử lại hoặc kiểm tra kết nối mạng/ảnh sản phẩm.");
    }
  };

  // Toggle trạng thái sản phẩm - cập nhật UI ngay
  const handleToggleStatus = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem("adminToken");
      const newStatus = currentStatus === 1 ? 0 : 1;

      await axios.patch(
        `/api/products/${productId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId || p._id === productId ? { ...p, status: newStatus } : p
        )
      );

      setProducts((prev) => {
        return prev.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Sắp xếp theo ngày tạo
      });

      setStats((prevStats) => ({
        ...prevStats,
        activeProducts: newStatus === 1 ? prevStats.activeProducts + 1 : prevStats.activeProducts - 1,
        inactiveProducts: newStatus === 0 ? prevStats.inactiveProducts + 1 : prevStats.inactiveProducts - 1,
      }));
    } catch (error) {
      alert("Không thể thay đổi trạng thái sản phẩm. Vui lòng thử lại.");
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(`/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProducts(currentPage);
      } catch (error) {
        alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
      }
    }
  };
  

  const filteredProducts = products;

  // Render phân trang
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    return (
      <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </button>
          </li>
          {pages}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Hàm xử lý import Excel
const handleImportExcel = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Mapping tiếng Việt sang tiếng Anh
    const [header, ...rows] = jsonData;
    const fieldMap = {
      "Tên sản phẩm": "name",
      "Mô tả": "description",
      "Giá": "price",
      "Danh mục": "category",
      "Thương hiệu": "brand",
      "Trạng thái": "status",
      "Biến thể": "variants"
    };

    const productsToImport = rows.map(row => {
      const obj = {};
      header.forEach((key, idx) => {
        const mappedKey = fieldMap[key] || key;
        obj[mappedKey] = row[idx];
      });
      // Parse variants nếu là chuỗi JSON
      if (typeof obj.variants === "string" && obj.variants.trim() !== "") {
        try {
          obj.variants = JSON.parse(obj.variants);
        } catch {
          obj.variants = [];
        }
      }
      return obj;
    });

    // Gửi lên backend
    const token = localStorage.getItem("adminToken");
    const response = await axios.post(
      "/api/products/import-excel",
      productsToImport,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data && response.data.success) {
      alert("Đã import sản phẩm thành công!");
      fetchProducts(currentPage); // Refresh lại danh sách sản phẩm
    } else {
      alert("Import thất bại: " + (response.data?.error || "Lỗi không xác định"));
    }
  } catch (err) {
    alert("Lỗi khi import file Excel: " + err.message);
  }
  // Reset input để có thể chọn lại cùng 1 file nếu cần
  e.target.value = "";
};

  return (
    <div
      className="dashboard-wrapper"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        padding: "32px 0",
      }}
    >
      <div className="container-xl">
        <h1
          className="dashboard-title"
          style={{
            fontWeight: 800,
            fontSize: 40,
            marginBottom: 24,
            letterSpacing: 1,
          }}
        >
          Quản lý Sản phẩm
        </h1>

        <div
          className="dashboard-welcome-card"
          style={{
            background: "linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%)",
            color: "#fff",
            borderRadius: 18,
            padding: 32,
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(44, 62, 80, 0.12)",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 28,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 28, marginRight: 8 }}>📦</span> Tổng quan
            Sản phẩm
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Quản lý và theo dõi sản phẩm của cửa hàng
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý sản phẩm trong hệ thống. Bạn có thể thêm, sửa,
            xóa và quản lý trạng thái các sản phẩm.
          </div>
          <div style={{ fontSize: 13, marginTop: 12, opacity: 0.8 }}>
            Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
          </div>
        </div>

        <div
          className="dashboard-stats-row"
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 32,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <div
            className="dashboard-stat-card"
            style={{
              flex: "1 1 200px",
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(67, 233, 123, 0.12)",
              minWidth: 220,
              marginRight: 8,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="total">
                📊
              </span>{" "}
              {stats.totalProducts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng sản phẩm</div>
          </div>

          <div
            className="dashboard-stat-card"
            style={{
              flex: "1 1 200px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(102, 126, 234, 0.12)",
              minWidth: 220,
              marginRight: 8,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="active">
                ✅
              </span>{" "}
              {stats.activeProducts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Sản phẩm đang bán</div>
          </div>

          <div
            className="dashboard-stat-card"
            style={{
              flex: "1 1 200px",
              background: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(247, 151, 30, 0.12)",
              minWidth: 220,
              marginRight: 8,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="inactive">
                ⏸️
              </span>{" "}
              {stats.inactiveProducts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Sản phẩm ngừng bán</div>
          </div>

          <div
            className="dashboard-stat-card"
            style={{
              flex: "1 1 200px",
              background: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(249, 83, 198, 0.12)",
              minWidth: 220,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="featured">
                ⭐
              </span>{" "}
              {stats.featuredProducts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Sản phẩm nổi bật</div>
          </div>
        </div>

        {/* Bộ lọc sản phẩm */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 15,
              minWidth: 180,
            }}
          />
          <input
            type="text"
            placeholder="Tìm theo danh mục..."
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 15,
              minWidth: 150,
            }}
          />
          <input
            type="text"
            placeholder="Tìm theo thương hiệu..."
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 15,
              minWidth: 150,
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 15,
              minWidth: 120,
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="1">Đang bán</option>
            <option value="0">Ngừng bán</option>
          </select>
          {(filterName || filterCategory || filterBrand || filterStatus) && (
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{ borderRadius: 8 }}
              onClick={() => {
                setFilterName("");
                setFilterCategory("");
                setFilterBrand("");
                setFilterStatus("");
              }}
            >
              Xóa lọc
            </button>
          )}
        </div>

        <section className="content">
          <div
            className="card"
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "none",
              boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)",
              marginBottom: 24,
            }}
          >
            <div
              className="card-header"
              style={{
                background: "linear-gradient(90deg, #5b86e5, #36d1c4)",
                color: "#fff",
                borderBottom: "none",
                padding: "16px 20px",
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              <h3
                className="card-title"
                style={{ fontWeight: 600, fontSize: 18 }}
              >
                Danh sách sản phẩm
              </h3>
              <div className="card-tools">
                <Link
                  to="/admin/product/add"
                  className="btn btn-primary"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontWeight: 500,
                    transition: "all 0.2s",
                    color: "#fff",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <i className="fas fa-plus"></i> Thêm sản phẩm mới
                </Link>
                <button
                  onClick={handleExportToExcel}
                  className="btn btn-success"
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    backgroundColor: "#28a745",
                    borderRadius: 8,
                    padding: "6px 12px",
                    color: "#fff",
                    marginLeft: "10px"
                  }}
                >
                  Xuất Excel
                </button>
                <button
                  className="btn btn-info"
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    backgroundColor: "#17a2b8",
                    borderRadius: 8,
                    padding: "6px 12px",
                    color: "#fff",
                    marginLeft: "10px"
                  }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  Import Excel
                </button>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImportExcel}
                />
              </div>
            </div>
            <div className="card-body p-0" style={{ background: "#fff" }}>
              {loading ? (
                <div className="text-center py-5">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                    style={{ width: 48, height: 48 }}
                  >
                    <span className="sr-only">Đang tải...</span>
                  </div>
                  <p className="mt-3" style={{ fontSize: 18, color: "#64748b" }}>
                    Đang tải dữ liệu sản phẩm...
                  </p>
                </div>
              ) : error ? (
                <div
                  className="alert alert-danger m-4"
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: "#fee2e2",
                    color: "#ef4444",
                    fontSize: 16,
                  }}
                >
                  {error}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-5">
                  <div style={{ fontSize: 18, color: "#64748b", fontWeight: 500 }}>
                    Không có sản phẩm nào
                  </div>
                  <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                    Hãy thêm sản phẩm mới để bắt đầu
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead
                      style={{
                        background: "linear-gradient(90deg, #e6f7ff, #f0f7ff)",
                      }}
                    >
                      <tr>
                        <th style={{ padding: 16 }}>ID</th>
                        <th style={{ padding: 16 }}>Hình ảnh</th>
                        <th style={{ padding: 16 }}>Tên sản phẩm</th>
                        <th style={{ padding: 16 }}>Giá</th>
                        <th style={{ padding: 16 }}>Danh mục</th>
                        <th style={{ padding: 16 }}>Thương hiệu</th>
                        <th style={{ padding: 16 }}>Trạng thái</th>
                        <th style={{ padding: 16, textAlign: "center" }}>Chức năng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr
                          key={product._id || product.id}
                          style={{
                            borderBottom: "1px solid #f0f0f0",
                            transition: "background 0.2s",
                          }}
                        >
                          <td style={{ padding: "16px 12px" }}>
                            {product._id || product.id}
                          </td>
                          <td style={{ padding: "16px 12px" }}>
                            <img
                              src={
                                product.image && product.image.startsWith("http")
                                  ? product.image
                                  : `http://localhost:3000${product.image}`
                              }
                              alt={product.name}
                              style={{
                                width: 60,
                                height: 60,
                                borderRadius: 8,
                                objectFit: "cover",
                                border: "1px solid #f0f0f0",
                                background: "#fff",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                              }}
                            />
                          </td>
                          <td style={{ padding: "16px 12px" }}>{product.name}</td>
                          <td style={{ padding: "16px 12px" }}>
                            {product.sale_price && product.sale_price > 0 ? (
                              <>
                                <div style={{ textDecoration: "line-through", color: "#888" }}>
                                  {formatCurrency(product.price)}
                                </div>
                                <div style={{ color: "#e60023", fontWeight: "bold" }}>
                                  {formatCurrency(product.sale_price)}
                                </div>
                              </>
                            ) : (
                              formatCurrency(product.price)
                            )}
                          </td>
                          <td style={{ padding: "16px 12px" }}>
                            {product.category?.name || product.category?.category_name || "N/A"}
                          </td>
                          <td style={{ padding: "16px 12px" }}>
                            {product.brand?.name || product.brand_name || "N/A"}
                          </td>
                          <td style={{ padding: "16px 12px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "6px 12px",
                                borderRadius: 12,
                                fontSize: 14,
                                fontWeight: 500,
                                background: product.status === 1 ? "#dcfce7" : "#fee2e2",
                                color: product.status === 1 ? "#16a34a" : "#ef4444",
                              }}
                            >
                              {product.status === 1 ? "Đang bán" : "Ngừng bán"}
                            </span>
                          </td>
                          <td style={{ padding: "16px 12px", textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: 10,
                                justifyContent: "center",
                              }}
                            >
                              <button
                                onClick={() =>
                                  handleToggleStatus(product._id || product.id, product.status)
                                }
                                title={product.status === 1 ? "Ngừng bán" : "Bắt đầu bán"}
                                style={{
                                  background:
                                    product.status === 1
                                      ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                      : "#94a3b8",
                                  border: "none",
                                  color: "#fff",
                                  borderRadius: 12,
                                  width: 40,
                                  height: 40,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 16,
                                  cursor: "pointer",
                                  boxShadow: "0 4px 10px rgba(67, 233, 123, 0.15)",
                                  transition: "transform 0.15s",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                              >
                                <i className={`fas fa-toggle-${product.status === 1 ? "on" : "off"}`}></i>
                              </button>

                              <Link
                                to={`/admin/product/edit/${product._id || product.id}`}
                                title="Chỉnh sửa"
                                style={{
                                  background: "linear-gradient(135deg, #5b86e5 0%, #36d1c4 100%)",
                                  border: "none",
                                  color: "#fff",
                                  borderRadius: 12,
                                  width: 40,
                                  height: 40,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 16,
                                  cursor: "pointer",
                                  boxShadow: "0 4px 10px rgba(91, 134, 229, 0.2)",
                                  transition: "transform 0.15s",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                              >
                                <i className="far fa-edit"></i>
                              </Link>

                              <button
                                onClick={() => handleDelete(product._id || product.id)}
                                title="Xóa"
                                style={{
                                  background: "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
                                  border: "none",
                                  color: "#fff",
                                  borderRadius: 12,
                                  width: 40,
                                  height: 40,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 16,
                                  cursor: "pointer",
                                  boxShadow: "0 4px 10px rgba(255, 88, 88, 0.2)",
                                  transition: "transform 0.15s",
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Phân trang */}
              {renderPagination()}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
