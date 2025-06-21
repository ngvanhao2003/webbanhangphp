import React, { useEffect, useState } from "react";
import axios from "../../../axios";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function Brand() {
  const PAGE_SIZE = 5;
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrlRaw = process.env.REACT_APP_BASE_URL || "";
  const baseUrl = baseUrlRaw.endsWith("/") ? baseUrlRaw : baseUrlRaw + "/";
  const [error, setError] = useState("");
  const [editBrand, setEditBrand] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    status: "2",
    logo: null,
  });
  const [stats, setStats] = useState({
    totalBrands: 0,
    activeBrands: 0,
    inactiveBrands: 0,
    featuredBrands: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    name: "",
    published: "all",
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/brands");
      let brandList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setBrands(brandList);

      // Thống kê
      const totalBrands = brandList.length;
      const activeBrands = brandList.filter((b) => b.status === 1).length;
      const inactiveBrands = brandList.filter((b) => b.status !== 1).length;
      const featuredBrands = brandList.filter((b) => b.logo).length;
      setStats({ totalBrands, activeBrands, inactiveBrands, featuredBrands });
      setCurrentPage(1); // Reset về trang 1 khi reload danh sách
    } catch (err) {
      setError("Không thể tải danh sách thương hiệu.");
      setBrands([]);
    }
    setLoading(false);
  }

  // Xử lý FormData cho upload logo
  const buildFormData = (form) => {
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("slug", form.slug.trim());
    fd.append("description", form.description?.trim() || "");
    fd.append("status", form.status);
    if (form.logo && typeof form.logo !== "string") {
      fd.append("logo", form.logo);
    }
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      alert("Tên thương hiệu và slug không được để trống");
      return;
    }
    try {
      const formData = buildFormData(form);
      if (editBrand) {
        await axios.put(
          `/api/brands/${editBrand.id || editBrand._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        alert("Cập nhật thương hiệu thành công!");
        setForm({ name: "", slug: "", description: "", status: "2", logo: null });
        setEditBrand(null);
        await fetchBrands();
      } else {
        // Thêm mới: gửi lên API và cập nhật brands ở đầu
        const res = await axios.post("/api/brands", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Thêm thương hiệu thành công!");
        // Thêm thương hiệu mới vào đầu danh sách
        const newBrand =
          res.data && (res.data.data || res.data.brand || res.data);
        setBrands((prev) => [newBrand, ...prev]);
        setForm({ name: "", slug: "", description: "", status: "2", logo: null });
        setEditBrand(null);
      }
    } catch (error) {
      alert("Lỗi khi lưu thương hiệu: " + (error.response?.data?.error || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (brand) => {
    setEditBrand(brand);
    setForm({
      name: brand.name || "",
      slug: brand.slug || "",
      description: brand.description || "",
      status: String(brand.status ?? "2"),
      logo: null,
    });
  };

  const handleDelete = async (brand) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;
    try {
      await axios.delete(`/api/brands/${brand.id || brand._id}`);
      await fetchBrands();
      if (editBrand && (editBrand.id === brand.id || editBrand._id === brand._id)) {
        setEditBrand(null);
        setForm({ name: "", slug: "", description: "", status: "2", logo: null });
      }
    } catch (err) {
      alert("Không thể xóa thương hiệu.");
    }
  };

  const handleToggleStatus = async (brand) => {
    const newStatus = brand.status === 1 ? 0 : 1;
    try {
      await axios.patch(`/api/brands/${brand.id || brand._id}/status`, {
        status: newStatus,
      });
      await fetchBrands();
    } catch (err) {
      alert("Không thể cập nhật trạng thái thương hiệu.");
    }
  };

  // Lấy URL logo đúng
  const getFullLogoUrl = (logo) => {
    if (!logo) return baseUrl + "images/brand/default.png";
    if (logo.startsWith("http")) return logo;
    if (logo.startsWith("/")) return baseUrl + logo.slice(1);
    return baseUrl + logo;
  };

  // Lọc brands theo filter
  const filteredBrands = brands.filter((brand) => {
    const matchName =
      filter.name.trim() === "" ||
      (brand.name || "").toLowerCase().includes(filter.name.trim().toLowerCase());
    const matchPublished =
      filter.published === "all" ||
      (filter.published === "1" && brand.status === 1) ||
      (filter.published === "0" && brand.status !== 1);
    return matchName && matchPublished;
  });

  // PHÂN TRANG: chỉ lặp các thương hiệu thuộc trang hiện tại
  const totalPages = Math.ceil(filteredBrands.length / PAGE_SIZE);
  const displayBrands = filteredBrands.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Khi filter thay đổi thì về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Pagination UI
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => setCurrentPage(i)}>
            {i}
          </button>
        </li>
      );
    }
    return (
      <nav aria-label="Page navigation" className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </button>
          </li>
          {pages}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Xử lý Export Excel
  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Brands");

      worksheet.addRow([
        "STT",
        "Logo",
        "Tên thương hiệu",
        "Slug",
        "Mô tả",
        "Trạng thái",
      ]);

      // Helper tải ảnh về dạng buffer
      const fetchImageBuffer = async (url) => {
        try {
          const res = await fetch(url, { mode: "cors" });
          const contentType = res.headers.get("content-type");
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

      for (let idx = 0; idx < filteredBrands.length; idx++) {
        const brand = filteredBrands[idx];
        const logoUrl = getFullLogoUrl(brand.logo);

        worksheet.addRow([
          idx + 1,
          "", // Ảnh sẽ chèn sau
          brand.name,
          brand.slug,
          brand.description,
          brand.status === 1 ? "Hoạt động" : "Không hoạt động",
        ]);

        // Tải ảnh và chèn vào dòng vừa thêm
        if (brand.logo) {
          const imgData = await fetchImageBuffer(logoUrl);
          if (imgData && imgData.buffer) {
            const imageId = workbook.addImage({
              buffer: imgData.buffer,
              extension: imgData.ext,
            });
            worksheet.addImage(imageId, {
              tl: { col: 1, row: idx + 1 },
              ext: { width: 60, height: 60 },
              editAs: "oneCell",
            });
          }
        }
      }

      // Đặt chiều cao cho tất cả các hàng (trừ header)
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber !== 1) {
          row.height = 48;
        }
      });

      worksheet.columns = [
        { width: 6 },   // STT
        { width: 12 },  // Logo
        { width: 24 },  // Tên thương hiệu
        { width: 18 },  // Slug
        { width: 30 },  // Mô tả
        { width: 16 },  // Trạng thái
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "brands_with_logos.xlsx");
    } catch (err) {
      console.error("Export Excel error:", err);
      alert("Có lỗi khi xuất Excel. Vui lòng thử lại hoặc kiểm tra kết nối mạng/ảnh logo.");
    }
  };

  // Thêm helper để upload ảnh từ URL (base64 hoặc link) lên server, trả về đường dẫn logo mới
  async function uploadLogoFromUrl(url) {
    try {
      // Nếu là base64
      if (url.startsWith("data:image/")) {
        const blob = await (await fetch(url)).blob();
        const fd = new FormData();
        fd.append("logo", blob, "logo.png");
        const res = await axios.post("/api/brands/upload-logo", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data?.url || res.data?.logo || "";
      }
      // Nếu là link ảnh http(s)
      if (url.startsWith("http")) {
        const res = await fetch(url);
        const blob = await res.blob();
        const fd = new FormData();
        fd.append("logo", blob, "logo.png");
        const uploadRes = await axios.post("/api/brands/upload-logo", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return uploadRes.data?.url || uploadRes.data?.logo || "";
      }
      // Nếu là đường dẫn nội bộ thì giữ nguyên
      return url;
    } catch {
      return "";
    }
  }

  // Xử lý Import Excel
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Tìm index các cột
      const header = rows[0] || [];
      const idxName = header.findIndex(h => h?.toLowerCase().includes("tên") || h?.toLowerCase().includes("name"));
      const idxSlug = header.findIndex(h => h?.toLowerCase().includes("slug"));
      const idxDesc = header.findIndex(h => h?.toLowerCase().includes("mô tả") || h?.toLowerCase().includes("desc"));
      const idxStatus = header.findIndex(h => h?.toLowerCase().includes("trạng thái") || h?.toLowerCase().includes("status"));
      const idxLogo = header.findIndex(h => h?.toLowerCase().includes("logo"));

      let imported = 0, failed = 0;
      const newBrands = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const name = row[idxName] || "";
        const slug = row[idxSlug] || "";
        const description = row[idxDesc] || "";
        const statusStr = row[idxStatus] || "";
        const status = statusStr === "Published" || statusStr === "Xuất bản" || statusStr === 1 ? 1 : 2;
        let logo = row[idxLogo] || "";

        if (!name || !slug) { failed++; continue; }

        // Nếu có logo là link hoặc base64 thì upload lên server
        if (logo && (logo.startsWith("http") || logo.startsWith("data:image/"))) {
          logo = await uploadLogoFromUrl(logo);
        }

        try {
          const res = await axios.post("/api/brands", { name, slug, description, status, logo });
          const newBrand = res.data && (res.data.data || res.data.brand || res.data);
          newBrands.push(newBrand);
          imported++;
        } catch {
          failed++;
        }
      }
      if (newBrands.length > 0) {
        setBrands(prev => [...newBrands, ...prev]);
      }
      alert(`Đã nhập thành công ${imported} thương hiệu. Thất bại: ${failed}`);
    } catch (err) {
      alert("Lỗi khi import file Excel!");
    }
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
          Quản lý Thương hiệu
        </h1>
        {/* CARD TỔNG QUAN giữ nguyên */}
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
            <span style={{ fontSize: 28, marginRight: 8 }}>🏷️</span> Tổng quan
            Thương hiệu
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Quản lý và theo dõi các thương hiệu
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý thương hiệu trong hệ thống. Bạn có thể thêm,
            sửa, xóa và quản lý trạng thái các thương hiệu sản phẩm.
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
              {stats.totalBrands}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng thương hiệu</div>
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
              {stats.activeBrands}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Thương hiệu xuất bản</div>
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
              {stats.inactiveBrands}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Thương hiệu chưa xuất bản</div>
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
                🖼️
              </span>{" "}
              {stats.featuredBrands}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Thương hiệu có logo</div>
          </div>
        </div>
        <div className="wrapper">
          {/* --- BẮT ĐẦU PHẦN LỌC --- */}
          <div
            className="card mb-4"
            style={{
              borderRadius: 16,
              border: "none",
              boxShadow: "0 2px 8px rgba(44,62,80,0.06)",
              padding: "24px 24px 8px 24px",
              background: "#fff",
            }}
          >
            <div className="row align-items-end">
              <div className="col-md-5 mb-3">
                <label style={{ fontWeight: 600, color: "#1e293b" }}>
                  Brand name{" "}
                  <span
                    style={{
                      background: "#3498db",
                      color: "#fff",
                      borderRadius: "50%",
                      padding: "0 7px",
                      fontSize: 13,
                      marginLeft: 4,
                      cursor: "pointer",
                    }}
                    title="Lọc theo tên thương hiệu"
                  >
                    ?
                  </span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Brand name"
                  value={filter.name}
                  onChange={e => setFilter(f => ({ ...f, name: e.target.value }))}
                  style={{
                    borderRadius: 12,
                    padding: "12px 16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                  }}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label style={{ fontWeight: 600, color: "#1e293b" }}>
                  Published{" "}
                  <span
                    style={{
                      background: "#3498db",
                      color: "#fff",
                      borderRadius: "50%",
                      padding: "0 7px",
                      fontSize: 13,
                      marginLeft: 4,
                      cursor: "pointer",
                    }}
                    title="Lọc theo trạng thái xuất bản"
                  >
                    ?
                  </span>
                </label>
                <select
                  className="form-control"
                  value={filter.published}
                  onChange={e => setFilter(f => ({ ...f, published: e.target.value }))}
                  style={{
                    borderRadius: 12,
                    padding: "12px 16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <option value="all">All</option>
                  <option value="1">Published</option>
                  <option value="0">Unpublished</option>
                </select>
              </div>
            </div>
          </div>
          {/* --- KẾT THÚC PHẦN LỌC --- */}
          {/* --- NÚT IMPORT/EXPORT EXCEL ĐẸP --- */}
          <div className="mb-3 d-flex" style={{ gap: 12 }}>
            <div className="btn-group">
              <button
                className="btn"
                style={{
                  background: "#28a745",
                  color: "#fff",
                  borderRadius: "6px 0 0 6px",
                  fontWeight: 600,
                  fontSize: 16,
                  padding: "10px 28px",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onClick={handleExportExcel}
                type="button"
              >
                <i className="fa fa-download" style={{ marginRight: 8 }}></i>
                Export
              </button>
              {/* Nếu muốn dropdown, có thể thêm ở đây */}
            </div>
            <label
              className="btn"
              style={{
                background: "#28a745",
                color: "#fff",
                borderRadius: "0 6px 6px 0",
                fontWeight: 600,
                fontSize: 16,
                padding: "10px 28px",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                marginBottom: 0,
              }}
            >
              <i className="fa fa-upload" style={{ marginRight: 8 }}></i>
              Import
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
                style={{ display: "none" }}
              />
            </label>
          </div>
          {/* --- HẾT NÚT IMPORT/EXPORT --- */}
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1>Quản lý thương hiệu</h1>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                    <li className="breadcrumb-item">
                      <Link to="/admin">Home</Link>
                    </li>
                    <li className="breadcrumb-item active">Thương hiệu</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="row g-4">
              <div className="col-md-4">
                <div
                  className="card shadow-sm"
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
                    {editBrand ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}
                  </div>
                  <div className="card-body p-4" style={{ background: "#fff" }}>
                    <form
                      action="#"
                      method="post"
                      encType="multipart/form-data"
                      onSubmit={handleSubmit}
                    >
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label" style={{ fontWeight: 600, color: "#1e293b" }}>
                          Tên thương hiệu
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          name="name"
                          id="name"
                          className="form-control"
                          placeholder="Nhập tên thương hiệu"
                          onChange={handleChange}
                          style={{
                            borderRadius: 12,
                            padding: "12px 16px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                          }}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="slug" className="form-label" style={{ fontWeight: 600, color: "#1e293b" }}>
                          Slug
                        </label>
                        <input
                          type="text"
                          value={form.slug}
                          name="slug"
                          id="slug"
                          className="form-control"
                          placeholder="Tự động hoặc nhập slug"
                          onChange={handleChange}
                          style={{
                            borderRadius: 12,
                            padding: "12px 16px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                          }}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="description" className="form-label" style={{ fontWeight: 600, color: "#1e293b" }}>
                          Mô tả
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          className="form-control"
                          placeholder="Mô tả về thương hiệu"
                          value={form.description}
                          onChange={handleChange}
                          style={{
                            borderRadius: 12,
                            padding: "12px 16px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                            minHeight: 100,
                          }}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="logo" className="form-label" style={{ fontWeight: 600, color: "#1e293b" }}>
                          Logo
                        </label>
                        <input
                          type="file"
                          name="logo"
                          id="logo"
                          className="form-control"
                          onChange={handleChange}
                          style={{
                            borderRadius: 12,
                            padding: "12px 16px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                          }}
                        />
                        {form.logo && typeof form.logo !== "string" && (
                          <img
                            src={URL.createObjectURL(form.logo)}
                            alt="Preview logo"
                            style={{ marginTop: 10, maxWidth: "100%", borderRadius: 8 }}
                          />
                        )}
                        {editBrand && !form.logo && editBrand.logo && (
                          <img
                            src={
                              editBrand.logo.startsWith("http")
                                ? editBrand.logo
                                : baseUrl + editBrand.logo.replace(/^\//, "")
                            }
                            alt="Logo hiện tại"
                            style={{ marginTop: 10, maxWidth: "100%", borderRadius: 8 }}
                          />
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="status" className="form-label" style={{ fontWeight: 600, color: "#1e293b" }}>
                          Trạng thái
                        </label>
                        <select
                          name="status"
                          id="status"
                          className="form-control"
                          value={form.status}
                          onChange={handleChange}
                          style={{
                            borderRadius: 12,
                            padding: "5px 16px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                          }}
                        >
                          <option value="2">Chưa xuất bản</option>
                          <option value="1">Xuất bản</option>
                        </select>
                      </div>
                      <div className="mb-3 d-flex align-items-center">
                        <button
                          type="submit"
                          name="create"
                          style={{
                            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 12,
                            padding: "12px 24px",
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: "pointer",
                            boxShadow: "0 4px 10px rgba(67, 233, 123, 0.2)",
                            marginRight: 8,
                            transition: "transform 0.15s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform = "translateY(-2px)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "translateY(0)")
                          }
                        >
                          {editBrand ? "Cập nhật" : "Thêm thương hiệu"}
                        </button>
                        {editBrand && (
                          <button
                            type="button"
                            className="btn"
                            style={{
                              background: "#f1f5f9",
                              color: "#475569",
                              border: "none",
                              borderRadius: 12,
                              padding: "12px 24px",
                              fontWeight: 600,
                              fontSize: 15,
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.background = "#e2e8f0")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.background = "#f1f5f9")
                            }
                            onClick={() => {
                              setEditBrand(null);
                              setForm({
                                name: "",
                                slug: "",
                                description: "",
                                status: "2",
                                logo: null,
                              });
                            }}
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-md-8">
                <div
                  className="card shadow-sm"
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "none",
                    boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)",
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
                    Danh sách thương hiệu
                  </div>
                  <div className="card-body p-4" style={{ background: "#fff" }}>
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
                          Đang tải dữ liệu thương hiệu...
                        </p>
                      </div>
                    ) : error ? (
                      <div
                        className="alert alert-danger"
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
                    ) : (
                      <div className="table-responsive">
                        <table
                          className="table table-hover"
                          style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 15,
                          }}
                        >
                          <thead
                            style={{
                              background: "linear-gradient(90deg, #e6f7ff, #f0f7ff)",
                            }}
                          >
                            <tr>
                              <th className="text-center" style={{
                                padding: 16, width: "30px", borderTopLeftRadius: 12,
                              }}>
                                <input type="checkbox" disabled />
                              </th>
                              <th className="text-center" style={{ padding: 16, width: "90px" }}>
                                Logo
                              </th>
                              <th style={{ padding: 16 }}>Tên thương hiệu</th>
                              <th style={{ padding: 16 }}>Slug</th>
                              <th style={{ padding: 16 }}>Mô tả</th>
                              <th className="text-center" style={{
                                padding: 16, width: "200px", borderTopRightRadius: 12,
                              }}>
                                Chức năng
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayBrands.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="text-center" style={{ padding: 32 }}>
                                  <div style={{ fontSize: 18, color: "#64748b", fontWeight: 500 }}>
                                    Không có thương hiệu nào
                                  </div>
                                  <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                                    Hãy thêm thương hiệu mới bằng form bên trái
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              displayBrands.map((brand) => (
                                <tr key={brand.id || brand._id}
                                  style={{
                                    borderBottom: "1px solid #f0f0f0",
                                    transition: "background 0.2s",
                                  }}
                                >
                                  <td className="text-center" style={{ padding: "16px 12px" }}>
                                    <input type="checkbox" value={brand.id || brand._id} name="checkId[]" />
                                  </td>
                                  <td className="text-center" style={{ padding: "16px 12px" }}>
                                    <img
                                      src={getFullLogoUrl(brand.logo)}
                                      alt={brand.name}
                                      style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 8,
                                        objectFit: "cover",
                                        border: "1px solid #f0f0f0",
                                        background: "#fff",
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                                      }}
                                    />
                                  </td>
                                  <td style={{ padding: "16px 12px" }}>{brand.name}</td>
                                  <td style={{ padding: "16px 12px" }}>{brand.slug}</td>
                                  <td style={{ padding: "16px 12px" }}>{brand.description}</td>
                                  <td className="text-center" style={{ padding: "16px 12px" }}>
                                    <div style={{
                                      display: "flex", gap: 10, justifyContent: "center",
                                    }}>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStatus(brand)}
                                        title="Bật/Tắt"
                                        style={{
                                          background: brand.status === 1
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
                                        onMouseOver={e =>
                                          e.currentTarget.style.transform = "translateY(-2px)"
                                        }
                                        onMouseOut={e =>
                                          e.currentTarget.style.transform = "translateY(0)"
                                        }
                                      >
                                        <i
                                          className={`fas fa-toggle-${brand.status === 1 ? "on" : "off"}`}
                                        ></i>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleEdit(brand)}
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
                                        onMouseOver={e =>
                                          e.currentTarget.style.transform = "translateY(-2px)"
                                        }
                                        onMouseOut={e =>
                                          e.currentTarget.style.transform = "translateY(0)"
                                        }
                                      >
                                        <i className="far fa-edit"></i>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDelete(brand)}
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
                                        onMouseOver={e =>
                                          e.currentTarget.style.transform = "translateY(-2px)"
                                        }
                                        onMouseOut={e =>
                                          e.currentTarget.style.transform = "translateY(0)"
                                        }
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                        {renderPagination()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
