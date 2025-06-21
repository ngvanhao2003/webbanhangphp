import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../../axios";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [saving, setSaving] = useState(false);

  const baseUrl = process.env.REACT_APP_BASE_URL || "";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("adminToken");

        const [productRes, brandsRes, categoriesRes] = await Promise.all([
          axios.get(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/brands", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const brandsArr = Array.isArray(brandsRes.data.data)
          ? brandsRes.data.data
          : Array.isArray(brandsRes.data)
          ? brandsRes.data
          : [];

        const categoriesArr = Array.isArray(categoriesRes.data.data)
          ? categoriesRes.data.data
          : Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];

        const prod = productRes.data.data || productRes.data;

        setProduct(prod);
        setEditData({
          ...prod,
          brand_id: getId(prod.brand || prod.brand_id),
          category_id: getId(prod.category || prod.category_id),
          imageFile: null,
          sale_price:
            prod.sale_price !== undefined && prod.sale_price !== null ? prod.sale_price : "",
        });

        setBrands(brandsArr);
        setCategories(categoriesArr);

        if (Array.isArray(prod.variants) && prod.variants.length > 0) {
          setVariants(prod.variants);
        } else {
          setVariants([{ color: "", size: "", stock: 0 }]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Không thể tải dữ liệu sản phẩm.");
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function getId(obj) {
    if (!obj) return "";
    if (typeof obj === "string" || typeof obj === "number") return String(obj);
    if (obj.id) return String(obj.id);
    if (obj._id) return String(obj._id);
    return "";
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEditData((prev) => ({ ...prev, imageFile: file }));
  };

  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { color: "", size: "", stock: 0 }]);
  };

  const handleRemoveVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Xóa sản phẩm thành công!");
      navigate("/admin/product");
    } catch (err) {
      alert("Xóa sản phẩm thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("adminToken");

      const validVariants = variants
        .filter(
          (v) =>
            v &&
            typeof v === "object" &&
            v.color &&
            v.size &&
            v.stock !== "" &&
            v.stock !== null &&
            v.stock !== undefined &&
            !isNaN(Number(v.stock))
        )
        .map((v) => ({
          color: v.color,
          size: v.size,
          stock: Number(v.stock),
        }));

      if (validVariants.length === 0) {
        alert("Bạn phải nhập ít nhất 1 biến thể hợp lệ (đủ màu sắc, kích thước, số lượng)!");
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("description", editData.description);
      formData.append("detail", editData.detail || "");
      formData.append("price", Number(editData.price));
      formData.append("category", editData.category_id);
      formData.append("brand", editData.brand_id);
      formData.append("status", Number(editData.status));
      formData.append("variants", JSON.stringify(validVariants));

      formData.append(
        "sale_price",
        editData.sale_price !== "" && editData.sale_price !== null && editData.sale_price !== undefined
          ? Number(editData.sale_price)
          : ""
      );

      if (editData.imageFile) {
        formData.append("image", editData.imageFile);
      } else if (typeof editData.image === "string") {
        formData.append("image", editData.image);
      }

      await axios.put(`/api/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Cập nhật sản phẩm thành công!");
      navigate("/admin/product");
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      alert("Cập nhật thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="dashboard-wrapper"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
          padding: "32px 0",
        }}
      >
        <div className="container-xl text-center py-5">
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
      </div>
    );
  }

  if (error) {
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
        </div>
      </div>
    );
  }

  if (!product) {
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
          <div
            className="alert alert-warning"
            style={{
              padding: 16,
              borderRadius: 12,
              background: "#fef3c7",
              color: "#d97706",
              fontSize: 16,
            }}
          >
            Không tìm thấy sản phẩm.
          </div>
        </div>
      </div>
    );
  }

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1
            className="dashboard-title"
            style={{ fontWeight: 800, fontSize: 40, letterSpacing: 1 }}
          >
            Chỉnh sửa Sản phẩm
          </h1>
          <div>
            <Link
              to="/admin/product"
              className="btn"
              style={{
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: 8,
                padding: "8px 16px",
                marginRight: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                fontWeight: 500,
              }}
            >
              <i className="fas fa-arrow-left mr-2"></i> Quay lại
            </Link>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              style={{
                background: "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                fontWeight: 500,
                boxShadow: "0 4px 12px rgba(255, 88, 88, 0.2)",
              }}
            >
              <i className="fas fa-trash mr-2"></i> Xóa sản phẩm
            </button>
          </div>
        </div>

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
            <span style={{ fontSize: 28, marginRight: 8 }}>📝</span> Chỉnh sửa:{" "}
            {product.name}
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            ID: {product._id || product.id}
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Chỉnh sửa thông tin chi tiết sản phẩm và lưu lại để cập nhật
          </div>
        </div>

        <div
          className="card"
          style={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)",
            overflow: "hidden",
            marginBottom: 32,
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
            <h3 className="card-title" style={{ fontWeight: 600, fontSize: 18 }}>
              Thông tin sản phẩm
            </h3>
          </div>
          <div className="card-body" style={{ padding: 24 }}>
            <form onSubmit={handleSubmit}>
              {/* Tên sản phẩm */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-4">
                    <label
                      style={{
                        fontWeight: 500,
                        marginBottom: 8,
                        color: "#4b5563",
                      }}
                    >
                      Tên sản phẩm *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={editData.name || ""}
                      onChange={handleChange}
                      required
                      style={{
                        borderRadius: 8,
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="col-md-6">
                  <div className="form-group mb-4">
                    <label
                      style={{
                        fontWeight: 500,
                        marginBottom: 8,
                        color: "#4b5563",
                      }}
                    >
                      Trạng thái *
                    </label>
                    <select
                      className="form-control"
                      name="status"
                      value={editData.status || "0"}
                      onChange={handleChange}
                      style={{
                        borderRadius: 8,
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <option value="0">Chưa xuất bản</option>
                      <option value="1">Xuất bản</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Giá gốc và giá khuyến mãi */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-4">
                    <label
                      style={{
                        fontWeight: 500,
                        marginBottom: 8,
                        color: "#4b5563",
                      }}
                    >
                      Giá gốc *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={editData.price || ""}
                      onChange={handleChange}
                      min="0"
                      required
                      style={{
                        borderRadius: 8,
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-4">
                    <label
                      style={{
                        fontWeight: 500,
                        marginBottom: 8,
                        color: "#4b5563",
                      }}
                    >
                      Giá khuyến mãi
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="sale_price"
                      value={editData.sale_price || ""}
                      onChange={handleChange}
                      min="0"
                      style={{
                        borderRadius: 8,
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Thương hiệu và danh mục */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group mb-4">
                    <label
                      style={{
                        fontWeight: 500,
                        marginBottom: 8,
                        color: "#4b5563",
                      }}
                    >
                      Thương hiệu *
                    </label>
                    <select
                      className="form-control"
                      name="brand_id"
                      value={editData.brand_id || ""}
                      onChange={handleChange}
                      required
                      style={{
                        borderRadius: 8,
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <option value="">-- Chọn thương hiệu --</option>
                      {brands.length === 0 && (
                        <option disabled>Không có thương hiệu</option>
                      )}
                      {brands.map((brand) => (
                        <option
                          key={brand.id || brand._id}
                          value={String(brand.id || brand._id)}
                        >
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-4">
                    <label
                      style={{
                        fontWeight: 500,
                        marginBottom: 8,
                        color: "#4b5563",
                      }}
                    >
                      Danh mục *
                    </label>
                    <select
                      className="form-control"
                      name="category_id"
                      value={editData.category_id || ""}
                      onChange={handleChange}
                      required
                      style={{
                        borderRadius: 8,
                        padding: "10px 12px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.length === 0 && (
                        <option disabled>Không có danh mục</option>
                      )}
                      {categories.map((category) => (
                        <option
                          key={category.id || category._id}
                          value={String(category.id || category._id)}
                        >
                          {category.category_name || category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Mô tả */}
              <div className="form-group mb-4">
                <label
                  style={{ fontWeight: 500, marginBottom: 8, color: "#4b5563" }}
                >
                  Mô tả *
                </label>
                <textarea
                  className="form-control"
                  name="description"
                  rows="3"
                  value={editData.description || ""}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: 8,
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </div>

              {/* Chi tiết */}
              <div className="form-group mb-4">
                <label
                  style={{ fontWeight: 500, marginBottom: 8, color: "#4b5563" }}
                >
                  Chi tiết sản phẩm
                </label>
                <textarea
                  className="form-control"
                  name="detail"
                  rows="5"
                  value={editData.detail || ""}
                  onChange={handleChange}
                  style={{
                    borderRadius: 8,
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </div>

              {/* Ảnh hiện tại */}
              <div className="form-group mb-4">
                <label
                  style={{ fontWeight: 500, marginBottom: 8, color: "#4b5563" }}
                >
                  Hình ảnh hiện tại
                </label>
                <br />
                <img
                  src={
                    product.image && product.image.startsWith("http")
                      ? product.image
                      : baseUrl + product.image
                  }
                  alt={product.name}
                  style={{
                    maxHeight: "120px",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    marginTop: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                />
              </div>

              {/* Upload ảnh mới */}
              <div className="form-group mb-4">
                <label
                  style={{ fontWeight: 500, marginBottom: 8, color: "#4b5563" }}
                >
                  Đổi hình ảnh
                </label>
                <input
                  type="file"
                  className="form-control"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{
                    borderRadius: 8,
                    padding: "10px 12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </div>

              {/* Biến thể */}
              <div className="form-group mb-4">
                <label
                  style={{ fontWeight: 500, marginBottom: 8, color: "#4b5563" }}
                >
                  Biến thể sản phẩm *
                </label>
                <div
                  className="variants-container mb-3"
                  style={{
                    background: "#f8fafc",
                    padding: 16,
                    borderRadius: 12,
                  }}
                >
                  {variants.map((variant, idx) => (
                    <div
                      key={idx}
                      className="variant-item mb-3 p-3"
                      style={{
                        background: "#fff",
                        borderRadius: 8,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label style={{ fontSize: 14, color: "#64748b" }}>
                              Màu sắc *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Màu sắc"
                              value={variant.color}
                              onChange={(e) =>
                                handleVariantChange(idx, "color", e.target.value)
                              }
                              required
                              style={{
                                borderRadius: 6,
                                border: "1px solid #e2e8f0",
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-group">
                            <label style={{ fontSize: 14, color: "#64748b" }}>
                              Kích thước *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Kích thước"
                              value={variant.size}
                              onChange={(e) =>
                                handleVariantChange(idx, "size", e.target.value)
                              }
                              required
                              style={{
                                borderRadius: 6,
                                border: "1px solid #e2e8f0",
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label style={{ fontSize: 14, color: "#64748b" }}>
                              Số lượng *
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Số lượng"
                              value={variant.stock}
                              min={0}
                              onChange={(e) =>
                                handleVariantChange(idx, "stock", e.target.value)
                              }
                              required
                              style={{
                                borderRadius: 6,
                                border: "1px solid #e2e8f0",
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-md-1 d-flex align-items-end justify-content-center mb-2">
                          {variants.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveVariant(idx)}
                              title="Xóa biến thể"
                              style={{
                                borderRadius: 6,
                                background:
                                  "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
                                border: "none",
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-info mt-2"
                    onClick={handleAddVariant}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontWeight: 500,
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.2)",
                    }}
                  >
                    <i className="fas fa-plus mr-2"></i> Thêm biến thể
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="form-actions" style={{ display: "flex", gap: 12 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{
                    background:
                      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(67, 233, 123, 0.2)",
                  }}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm mr-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i> Lưu thay đổi
                    </>
                  )}
                </button>
                <Link
                  to="/admin/product"
                  className="btn btn-secondary"
                  style={{
                    background: "#94a3b8",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 24px",
                    fontWeight: 500,
                  }}
                >
                  <i className="fas fa-times mr-2"></i> Hủy
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
