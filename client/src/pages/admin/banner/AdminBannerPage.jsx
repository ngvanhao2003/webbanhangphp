import React, { useEffect, useState } from "react";
import axios from "../../../axios";
import { ToastContainer, toast } from "react-toastify";
// import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const initialBanner = {
  title: "",
  link_url: "",
  image: "",
  position: 1,
  status: 1,
};

const AdminBannerPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null); // null: thêm mới, object: chỉnh sửa
  const [form, setForm] = useState(initialBanner);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
    featuredBanners: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const bannersPerPage = 5;
  const [searchTerm, setSearchTerm] = useState(""); // Thêm state tìm kiếm

  useEffect(() => {
    fetchBanners();
  }, []);

  // Reset về trang 1 khi banners thay đổi (ví dụ sau khi thêm/xóa)
  useEffect(() => {
    setCurrentPage(1);
  }, [banners.length]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/banners/");
      let bannerList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setBanners(bannerList);

      // Calculate stats
      const totalBanners = bannerList.length;
      const activeBanners = bannerList.filter((b) => b.status === 1).length;
      const inactiveBanners = bannerList.filter((b) => b.status === 0).length;
      const featuredBanners = bannerList.filter((b) => b.position <= 3).length;

      setStats({
        totalBanners,
        activeBanners,
        inactiveBanners,
        featuredBanners,
      });

      setError(null);
    } catch (err) {
      setBanners([]);
      setError("Lỗi khi tải dữ liệu banner");
    }
    setLoading(false);
  };

  const getImageSrc = (banner) => {
    let src = banner.image_url || banner.image || "";
    if (src && !src.startsWith("http")) {
      src = `${window.location.origin}/${src.replace(/^\//, "")}`;
    }
    return src;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa banner này?")) return;
    try {
      await axios.delete(`/api/banners/${id}`);
      const updatedBanners = banners.filter((b) => b._id !== id && b.id !== id);
      setBanners(updatedBanners);

      // Update stats after deletion
      const totalBanners = updatedBanners.length;
      const activeBanners = updatedBanners.filter((b) => b.status === 1).length;
      const inactiveBanners = updatedBanners.filter((b) => b.status === 0).length;
      const featuredBanners = updatedBanners.filter((b) => b.position <= 3).length;

      setStats({
        totalBanners,
        activeBanners,
        inactiveBanners,
        featuredBanners,
      });

      toast.success("Xóa banner thành công!");
    } catch (err) {
      toast.error("Xóa thất bại");
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title || "",
      link_url: banner.link_url || banner.link || "",
      image: banner.image || "",
      position: banner.position || 1,
      status: banner.status || 1,
      imageFile: null,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("link_url", form.link_url);
      formData.append("position", String(form.position));
      formData.append("status", String(form.status));

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      if (editingBanner) {
        await axios.put(
          `/api/banners/${editingBanner._id || editingBanner.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.dismiss();
        toast.success("Cập nhật banner thành công!");
        setEditingBanner(null);
        setForm(initialBanner);
        fetchBanners();
      } else {
        const res = await axios.post("/api/banners", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.dismiss();
        toast.success("Thêm banner thành công!");
        // Thêm banner mới vào đầu danh sách
        const newBanner =
          res.data && typeof res.data === "object"
            ? res.data.data || res.data
            : null;
        if (newBanner) {
          setBanners((prev) => [newBanner, ...prev]);
        } else {
          fetchBanners();
        }
        setEditingBanner(null);
        setForm(initialBanner);
      }
    } catch (err) {
      toast.error("Lưu thất bại!");
      console.error(err);
      setEditingBanner(null);
      setForm(initialBanner);
      fetchBanners();
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
    setForm(initialBanner);
  };

  // Lọc banner theo tiêu đề trước khi phân trang
  const filteredBanners = banners.filter(b =>
    b.title?.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );
  const totalPages = Math.ceil(filteredBanners.length / bannersPerPage);
  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * bannersPerPage,
    currentPage * bannersPerPage
  );

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
          Quản lý Banner
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
            <span style={{ fontSize: 28, marginRight: 8 }}>🖼️</span> Tổng quan
            Banner
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Quản lý và theo dõi các banner quảng cáo
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý các banner hiển thị trên trang web. Bạn có thể
            thêm, sửa, xóa và quản lý trạng thái các banner.
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
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="total">
                🖼️
              </span>{" "}
              {stats.totalBanners}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng Banner</div>
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
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="active">
                ✅
              </span>{" "}
              {stats.activeBanners}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Banner Hoạt Động</div>
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
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="inactive">
                ⏸️
              </span>{" "}
              {stats.inactiveBanners}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>
              Banner Không Hoạt Động
            </div>
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
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="featured">
                ⭐
              </span>{" "}
              {stats.featuredBanners}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Banner Nổi Bật</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Form bên trái */}
          <div
            style={{
              flex: "0 0 350px",
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)",
              padding: 32,
              minWidth: 320,
            }}
          >
            <h3
              style={{
                marginBottom: 20,
                color: "#36d1c4",
                fontWeight: 700,
                fontSize: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>
                {editingBanner ? "✏️" : "➕"}
              </span>
              {editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500 }}>Tiêu đề</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #e0e7ff",
                    marginTop: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500 }}>Link</label>
                <input
                  name="link_url"
                  value={form.link_url}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #e0e7ff",
                    marginTop: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500 }}>Hình ảnh (File)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setForm((prev) => ({
                        ...prev,
                        imageFile: file,
                        image: URL.createObjectURL(file),
                      }));
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #e0e7ff",
                    marginTop: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
              </div>
              {form.image && (
                <div style={{ marginBottom: 18 }}>
                  <img
                    src={form.image}
                    alt="banner"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 120,
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(44, 62, 80, 0.08)",
                    }}
                  />
                </div>
              )}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontWeight: 500 }}>Vị trí</label>
                <input
                  name="position"
                  type="number"
                  min={1}
                  value={form.position}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #e0e7ff",
                    marginTop: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 500 }}>Trạng thái</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 12,
                    border: "1px solid #e0e7ff",
                    marginTop: 8,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <option value={1}>Xuất bản</option>
                  <option value={0}>Chưa xuất bản</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background:
                      "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 24px",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(79, 172, 254, 0.4)",
                    transition: "all 0.2s",
                    flex: "1",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  {saving
                    ? "Đang lưu..."
                    : editingBanner
                    ? "Lưu thay đổi"
                    : "Thêm mới"}
                </button>
                {editingBanner && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      background: "#f1f5f9",
                      color: "#64748b",
                      border: "none",
                      borderRadius: 12,
                      padding: "12px 24px",
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(100, 116, 139, 0.1)",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
          {/* Danh sách banner bên phải */}
          <div
            style={{
              flex: 1,
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)",
              padding: 24,
              minWidth: 400,
              overflowX: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>📋</span> Danh sách Banner
              </h3>
              <div
                className="search-box"
                style={{
                  display: "flex",
                  gap: 8,
                }}
              >
                <input
                  type="text"
                  placeholder="Tìm kiếm banner..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    border: "1px solid #e0e7ff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
                <button
                  style={{
                    background:
                      "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: "8px 16px",
                    fontWeight: 500,
                    boxShadow: "0 2px 8px rgba(79, 172, 254, 0.3)",
                    cursor: "pointer",
                  }}
                  type="button"
                  onClick={() => setCurrentPage(1)}
                >
                  <i className="fas fa-search"></i> Tìm
                </button>
              </div>
            </div>

            <table
              style={{
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
                  <th
                    style={{
                      padding: 16,
                      borderBottom: "2px solid #eee",
                      textAlign: "left",
                      borderTopLeftRadius: 12,
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      padding: 16,
                      borderBottom: "2px solid #eee",
                      textAlign: "left",
                    }}
                  >
                    Hình ảnh
                  </th>
                  <th
                    style={{
                      padding: 16,
                      borderBottom: "2px solid #eee",
                      textAlign: "left",
                    }}
                  >
                    Tiêu đề
                  </th>
                  <th
                    style={{
                      padding: 16,
                      borderBottom: "2px solid #eee",
                      textAlign: "left",
                    }}
                  >
                    Vị trí
                  </th>
                  <th
                    style={{
                      padding: 16,
                      borderBottom: "2px solid #eee",
                      textAlign: "left",
                    }}
                  >
                    Ngày tạo
                  </th>
                  <th
                    style={{
                      padding: 16,
                      borderBottom: "2px solid #eee",
                      textAlign: "left",
                    }}
                  >
                    Trạng thái
                  </th>
                  <th
                    style={{
                      padding: 16,
                      borderBottom: "2px solid #eee",
                      textAlign: "center",
                      borderTopRightRadius: 12,
                    }}
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: "center", padding: 32 }}
                    >
                      <div className="text-center py-5">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                          style={{ width: 48, height: 48 }}
                        >
                          <span className="sr-only">Đang tải...</span>
                        </div>
                        <p
                          className="mt-3"
                          style={{ fontSize: 18, color: "#64748b" }}
                        >
                          Đang tải dữ liệu banner...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: 24,
                        color: "#ef4444",
                      }}
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredBanners.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 32 }}>
                      <div style={{ fontSize: 18, color: "#64748b", fontWeight: 500 }}>
                        Không có banner nào
                      </div>
                      <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                        Hãy thêm banner mới bằng form bên trái
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedBanners.map((banner) => (
                    <tr
                      key={banner._id || banner.id}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        transition: "background 0.2s",
                        cursor: "default",
                      }}
                    >
                      <td style={{ padding: "16px 12px" }}>
                        {banner._id || banner.id}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        {getImageSrc(banner) ? (
                          <img
                            src={getImageSrc(banner)}
                            alt={banner.title}
                            style={{
                              maxWidth: 120,
                              maxHeight: 60,
                              borderRadius: 8,
                              objectFit: "contain",
                              background: "#f8fafc",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span style={{ color: "#bbb" }}>Không có ảnh</span>
                        )}
                      </td>
                      <td style={{ padding: "16px 12px" }}>{banner.title}</td>
                      <td style={{ padding: "16px 12px" }}>{banner.position}</td>
                      <td style={{ padding: "16px 12px" }}>
                        {banner.created_at || banner.createdAt
                          ? new Date(
                              banner.created_at || banner.createdAt
                            ).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td style={{ padding: "16px 12px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 500,
                            background:
                              banner.status === 1 ? "#dcfce7" : "#fee2e2",
                            color: banner.status === 1 ? "#16a34a" : "#ef4444",
                          }}
                        >
                          {banner.status === 1 ? "Xuất bản" : "Chưa xuất bản"}
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
                            onClick={() => handleEdit(banner)}
                            title="Chỉnh sửa"
                            style={{
                              background:
                                "linear-gradient(135deg, #5b86e5 0%, #36d1c4 100%)",
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
                            onMouseOver={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(-2px)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.transform = "translateY(0)")
                            }
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(banner._id || banner.id)
                            }
                            title="Xóa"
                            style={{
                              background:
                                "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
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
                            onMouseOver={(e) =>
                              (e.currentTarget.style.transform =
                                "translateY(-2px)")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.transform = "translateY(0)")
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
            {/* Phân trang */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 24,
                  gap: 8,
                }}
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #e0e7ff",
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontWeight: 600,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  &lt; Trước
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1px solid #e0e7ff",
                      background:
                        currentPage === idx + 1 ? "#36d1c4" : "#fff",
                      color: currentPage === idx + 1 ? "#fff" : "#64748b",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #e0e7ff",
                    background: "#f1f5f9",
                    color: "#64748b",
                    fontWeight: 600,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Sau &gt;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Container hiển thị thông báo */}
      <ToastContainer
        position="top-right"
        autoClose={3000}       // tự động đóng sau 3 giây
        limit={3}              // tối đa 3 thông báo cùng lúc
        hideProgressBar={false}
        newestOnTop={false}    // hiện thông báo cũ phía trên
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss={false} // tránh tạm dừng khi mất focus
        theme="light"
      />

    </div>
  );
};

export default AdminBannerPage;
