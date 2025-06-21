import React, { useState, useEffect } from "react";
import axios from "../../../axios";
import { useNavigate } from "react-router-dom";

export default function ProductAdd() {
  const navigate = useNavigate();

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    sale_type: "1",   // 1: không khuyến mãi, 2: có giá khuyến mãi
    sale_price: "",
    brand_id: "",
    category_id: "",
    description: "",
    detail: "",
    status: "0",
    image: null,
  });

  const [variants, setVariants] = useState([{ color: "", size: "", stock: 0 }]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showSalePriceInput, setShowSalePriceInput] = useState(false);

  // Load brands & categories khi mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const [brandsRes, categoriesRes] = await Promise.all([
          axios.get("/api/brands", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("/api/categories", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const brandsData = Array.isArray(brandsRes.data.data)
          ? brandsRes.data.data
          : Array.isArray(brandsRes.data)
          ? brandsRes.data
          : [];
        const categoriesData = Array.isArray(categoriesRes.data.data)
          ? categoriesRes.data.data
          : Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : [];
        setBrands(brandsData);
        setCategories(categoriesData);
      } catch (error) {
        setBrands([]);
        setCategories([]);
        console.error("Lỗi khi tải dropdown:", error);
      }
    };
    fetchDropdownData();
  }, []);

  // Handle biến thể
  const handleAddVariant = () => setVariants([...variants, { color: "", size: "", stock: 0 }]);
  const handleRemoveVariant = (idx) => setVariants(variants.filter((_, i) => i !== idx));
  const handleVariantChange = (idx, field, value) =>
    setVariants(variants.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));

  // Handle input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle thay đổi loại khuyến mãi
  const handleSaleTypeChange = (e) => {
    const val = e.target.value;
    setNewProduct((prev) => ({ ...prev, sale_type: val }));

    if (val === "2") {
      setShowSalePriceInput(true);
    } else {
      setShowSalePriceInput(false);
      setNewProduct((prev) => ({ ...prev, sale_price: "" }));
    }
  };

  // Handle file ảnh
  const handleFileChange = (e) => {
    setNewProduct((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Submit form
const handleSubmit = async (e) => {
  e.preventDefault();

  // Log dữ liệu sản phẩm
  console.log("Product data:", newProduct);
  console.log("Variants data:", variants);

  // Validate bắt buộc
  if (
    !newProduct.name ||
    !newProduct.description ||
    !newProduct.price ||
    !newProduct.category_id ||
    !newProduct.brand_id ||
    newProduct.status === undefined
  ) {
    alert("Vui lòng điền đầy đủ thông tin sản phẩm (tên, mô tả, giá, danh mục và trạng thái)");
    return;
  }

  // Validate biến thể
  const validVariants = variants.filter(
    (v) => v.color && v.size && v.stock !== "" && v.stock !== null
  );
  if (validVariants.length === 0) {
    alert("Bạn phải nhập ít nhất 1 biến thể hợp lệ (đủ màu sắc, kích thước, số lượng)!");
    return;
  }

  // Nếu chọn có giá khuyến mãi thì sale_price phải hợp lệ
  if (newProduct.sale_type === "2") {
    if (!newProduct.sale_price || Number(newProduct.sale_price) <= 0) {
      alert("Vui lòng nhập Giá khuyến mãi hợp lệ.");
      return;
    }
  }

  try {
    const token = localStorage.getItem("adminToken");
    const processedVariants = validVariants.map((v) => ({
      color: v.color,
      size: v.size,
      stock: Number(v.stock),
    }));

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", Number(newProduct.price));
    formData.append("category", newProduct.category_id);
    formData.append("brand", newProduct.brand_id);
    formData.append("status", Number(newProduct.status));

    if (newProduct.sale_type === "2") {
      formData.append("sale_price", Number(newProduct.sale_price));
    }

    if (newProduct.detail) formData.append("detail", newProduct.detail);
    if (newProduct.image) formData.append("image", newProduct.image);

    formData.append("variants", JSON.stringify(processedVariants));

    // Gửi yêu cầu mà không cần chỉ định Content-Type (axios tự động thiết lập)
    await axios.post("/api/products", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Thêm sản phẩm thành công!");
    navigate("/admin/product");
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    alert(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Không thể thêm sản phẩm. Vui lòng thử lại."
    );
  }
};


  return (
    <div className="container" style={{ maxWidth: 900, marginTop: 40 }}>
      <h2 style={{ textAlign: "center" }}>Thêm sản phẩm mới</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label>Tên sản phẩm *</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={newProduct.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group mb-3">
          <label>Mô tả *</label>
          <textarea
            className="form-control"
            name="description"
            value={newProduct.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Giá *</label>
            <input
              type="number"
              className="form-control"
              name="price"
              value={newProduct.price}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="col-md-6">
            <label>Loại khuyến mãi</label>
            <select
              className="form-control"
              name="sale_type"
              value={newProduct.sale_type}
              onChange={handleSaleTypeChange}
            >
              <option value="1">Không có giá khuyến mãi</option>
              <option value="2">Có giá khuyến mãi</option>
            </select>
          </div>
        </div>

        {showSalePriceInput && (
          <div className="row mb-3">
            <div className="col-md-6">
              <label>Giá khuyến mãi *</label>
              <input
                type="number"
                className="form-control"
                name="sale_price"
                value={newProduct.sale_price}
                onChange={handleChange}
                min="0"
                required={newProduct.sale_type === "2"}
              />
            </div>
          </div>
        )}

        <div className="row mb-3">
          <div className="col-md-6">
            <label>Danh mục *</label>
            <select
              className="form-control"
              name="category_id"
              value={newProduct.category_id || ""}
              onChange={handleChange}
              required
              style={{ borderRadius: 8, padding: "6px 12px", border: "1px solid #e2e8f0" }}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.length === 0 && <option disabled>Không có danh mục</option>}
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
          <div className="col-md-6">
            <label>Thương hiệu</label>
            <select
              className="form-control"
              name="brand_id"
              value={newProduct.brand_id}
              onChange={handleChange}
            >
              <option value="">-- Chọn thương hiệu --</option>
              {brands.map((brand) => (
                <option key={brand._id || brand.id} value={brand._id || brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group mb-3">
          <label>Chi tiết sản phẩm</label>
          <textarea
            className="form-control"
            name="detail"
            value={newProduct.detail}
            onChange={handleChange}
            rows={4}
            placeholder="Nhập chi tiết sản phẩm (có thể là thông tin kỹ thuật, mô tả dài, v.v.)"
          />
        </div>

        <div className="form-group mb-3">
          <label>Hình ảnh</label>
          <input type="file" className="form-control" onChange={handleFileChange} />
        </div>

        <div className="form-group mb-3">
          <label>Trạng thái *</label>
          <select
            className="form-control"
            name="status"
            value={newProduct.status}
            onChange={handleChange}
            required
          >
            <option value="0">Chưa xuất bản</option>
            <option value="1">Xuất bản</option>
          </select>
        </div>

        <h5 className="mt-4 mb-3">Biến thể sản phẩm</h5>
        {variants.map((variant, idx) => (
          <div key={idx} className="card mb-3 p-3" style={{ background: "#f8f9fa" }}>
            <div className="row">
              <div className="col-md-4">
                <label>Màu sắc *</label>
                <input
                  type="text"
                  className="form-control"
                  value={variant.color}
                  onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label>Kích thước *</label>
                <input
                  type="text"
                  className="form-control"
                  value={variant.size}
                  onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <label>Số lượng *</label>
                <input
                  type="number"
                  className="form-control"
                  value={variant.stock}
                  onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                  required
                  min="0"
                />
              </div>
              <div className="col-md-1 d-flex align-items-center">
                {idx > 0 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleRemoveVariant(idx)}
                    style={{ marginTop: 31 }}
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
          className="btn btn-outline-primary mb-3"
          onClick={handleAddVariant}
        >
          <i className="fas fa-plus"></i> Thêm biến thể
        </button>

        <div className="form-group" style={{ textAlign: "center" }}>
          <button type="submit" className="btn btn-primary">
            Lưu sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
}
