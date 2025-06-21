import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../../services/admin.service";
import axios from "../../../axios";

export default function PostCreate() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    featured_image: "",
    status: "draft",
    categories: [],
    tags: "",
    is_featured: false,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Fetch categories when component mounts
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
      }
    }
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));

    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Auto-generate slug when title changes
    if (name === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setForm((prev) => ({ ...prev, slug }));
    }
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setForm((prev) => ({ ...prev, categories: selectedOptions }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Tiêu đề không được để trống";
    } else if (form.title.length < 5) {
      errors.title = "Tiêu đề quá ngắn (tối thiểu 5 ký tự)";
    }

    if (!form.slug.trim()) {
      errors.slug = "Slug không được để trống";
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      errors.slug = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang";
    }

    if (!form.content.trim()) {
      errors.content = "Nội dung không được để trống";
    }

    if (form.categories.length === 0) {
      errors.categories = "Vui lòng chọn ít nhất một danh mục";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      setError("Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const user = authService.getAdminUser();
      const formattedTags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      const postData = {
        title: form.title,
        slug: form.slug,
        summary: form.summary,
        content: form.content,
        featured_image: form.featured_image,
        status: form.status,
        categories: form.categories,
        tags: formattedTags,
        author: user ? user.username : "admin",
        is_featured: form.is_featured,
      };

      const response = await axios.post("/api/posts", postData);

      if (response.data) {
        setSuccessMessage("Bài viết đã được tạo thành công!");
        // Reset form after successful submission
        setForm({
          title: "",
          slug: "",
          summary: "",
          content: "",
          featured_image: "",
          status: "draft",
          categories: [],
          tags: "",
          is_featured: false,
        });

        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate("/admin/post");
        }, 1500);
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError(
        err.response?.data?.error ||
          "Không thể tạo bài viết. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-5 px-4" style={{ maxWidth: "1600px" }}>
      <div className="row">
        <div className="col-12">
          <div
            className="card shadow"
            style={{ borderRadius: "16px", overflow: "hidden" }}
          >
            <div
              className="card-header"
              style={{
                background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                color: "white",
                padding: "24px",
                borderBottom: "none",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 style={{ margin: 0, fontWeight: 700, fontSize: "28px" }}>
                    Thêm bài viết mới
                  </h2>
                  <p className="mb-0 mt-2 text-white-50">
                    Điền thông tin chi tiết để tạo bài viết mới
                  </p>
                </div>
                <Link
                  to="/admin/post"
                  className="btn btn-light px-4 py-2"
                  style={{ fontWeight: 600, borderRadius: "10px" }}
                >
                  <i className="fas fa-arrow-left me-2"></i>Quay lại
                </Link>
              </div>
            </div>

            <div className="card-body p-4">
              {successMessage && (
                <div
                  className="alert alert-success d-flex align-items-center"
                  role="alert"
                  style={{ borderRadius: "10px" }}
                >
                  <i
                    className="fas fa-check-circle me-3"
                    style={{ fontSize: "24px" }}
                  ></i>
                  <div>{successMessage}</div>
                </div>
              )}

              {error && (
                <div
                  className="alert alert-danger d-flex align-items-center"
                  role="alert"
                  style={{ borderRadius: "10px" }}
                >
                  <i
                    className="fas fa-exclamation-circle me-3"
                    style={{ fontSize: "24px" }}
                  ></i>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-lg-8 pe-lg-4">
                    <div className="form-group mb-4">
                      <label
                        htmlFor="title"
                        className="form-label fw-bold mb-2"
                      >
                        Tiêu đề <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control form-control-lg ${
                          validationErrors.title ? "is-invalid" : ""
                        }`}
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Nhập tiêu đề bài viết"
                        style={{
                          borderRadius: "10px",
                          padding: "14px 16px",
                          fontSize: "16px",
                        }}
                      />
                      {validationErrors.title && (
                        <div className="invalid-feedback">
                          {validationErrors.title}
                        </div>
                      )}
                    </div>

                    <div className="form-group mb-4">
                      <label htmlFor="slug" className="form-label fw-bold mb-2">
                        Slug <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span
                          className="input-group-text"
                          style={{ borderRadius: "10px 0 0 10px" }}
                        >
                          /post/
                        </span>
                        <input
                          type="text"
                          className={`form-control form-control-lg ${
                            validationErrors.slug ? "is-invalid" : ""
                          }`}
                          id="slug"
                          name="slug"
                          value={form.slug}
                          onChange={handleChange}
                          placeholder="ten-bai-viet"
                          style={{
                            borderRadius: "0 10px 10px 0",
                            padding: "14px 16px",
                            fontSize: "16px",
                          }}
                        />
                      </div>
                      {validationErrors.slug ? (
                        <div className="text-danger mt-1 small">
                          {validationErrors.slug}
                        </div>
                      ) : (
                        <div className="form-text text-muted">
                          URL thân thiện cho bài viết, tự động tạo từ tiêu đề
                        </div>
                      )}
                    </div>

                    <div className="form-group mb-4">
                      <label
                        htmlFor="summary"
                        className="form-label fw-bold mb-2"
                      >
                        Tóm tắt
                      </label>
                      <textarea
                        className="form-control"
                        id="summary"
                        name="summary"
                        value={form.summary}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                        style={{
                          borderRadius: "10px",
                          padding: "14px 16px",
                          fontSize: "16px",
                        }}
                      ></textarea>
                      <div className="form-text text-muted">
                        Tóm tắt ngắn gọn sẽ hiển thị ở trang danh sách bài viết
                        (không bắt buộc)
                      </div>
                    </div>

                    <div className="form-group mb-4">
                      <label
                        htmlFor="content"
                        className="form-label fw-bold mb-2"
                      >
                        Nội dung <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className={`form-control ${
                          validationErrors.content ? "is-invalid" : ""
                        }`}
                        id="content"
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        rows="12"
                        placeholder="Nhập nội dung chi tiết bài viết"
                        style={{
                          borderRadius: "10px",
                          padding: "14px 16px",
                          fontSize: "16px",
                        }}
                      ></textarea>
                      {validationErrors.content && (
                        <div className="invalid-feedback">
                          {validationErrors.content}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div
                      className="card shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div className="card-header bg-light py-3">
                        <h5 className="mb-0 fw-bold">Xuất bản</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-group mb-3">
                          <label
                            htmlFor="status"
                            className="form-label fw-bold mb-2"
                          >
                            Trạng thái
                          </label>
                          <select
                            className="form-select"
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            style={{ borderRadius: "10px", padding: "12px" }}
                          >
                            <option value="draft">Bản nháp</option>
                            <option value="published">Công khai</option>
                          </select>
                        </div>

                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="is_featured"
                            name="is_featured"
                            checked={form.is_featured}
                            onChange={handleChange}
                            style={{ cursor: "pointer" }}
                          />
                          <label
                            className="form-check-label fw-medium"
                            htmlFor="is_featured"
                            style={{ cursor: "pointer" }}
                          >
                            Đánh dấu là bài viết nổi bật
                          </label>
                        </div>

                        <div className="d-grid gap-2 mt-4">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                            style={{
                              background:
                                "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                              border: "none",
                              borderRadius: "10px",
                              padding: "12px",
                              fontWeight: 600,
                              fontSize: "16px",
                            }}
                          >
                            {loading ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Đang lưu...
                              </>
                            ) : (
                              <>
                                <i className="fas fa-save me-2"></i>Lưu bài viết
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      className="card shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div className="card-header bg-light py-3">
                        <h5 className="mb-0 fw-bold">Danh mục & Thẻ</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-group mb-3">
                          <label
                            htmlFor="categories"
                            className="form-label fw-bold mb-2"
                          >
                            Danh mục <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${
                              validationErrors.categories ? "is-invalid" : ""
                            }`}
                            id="categories"
                            name="categories"
                            multiple
                            value={form.categories}
                            onChange={handleCategoryChange}
                            style={{
                              borderRadius: "10px",
                              padding: "12px",
                              height: "150px",
                            }}
                          >
                            {categories.map((category) => (
                              <option key={category._id} value={category._id}>
                                {category.category_name}
                              </option>
                            ))}
                          </select>
                          {validationErrors.categories ? (
                            <div className="text-danger mt-1 small">
                              {validationErrors.categories}
                            </div>
                          ) : (
                            <div className="form-text text-muted small">
                              Giữ Ctrl (Windows) hoặc Command (Mac) để chọn
                              nhiều danh mục
                            </div>
                          )}
                        </div>

                        <div className="form-group mb-3">
                          <label
                            htmlFor="tags"
                            className="form-label fw-bold mb-2"
                          >
                            Thẻ
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="tags"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            placeholder="Nhập thẻ, phân cách bằng dấu phẩy"
                            style={{ borderRadius: "10px", padding: "12px" }}
                          />
                          <div className="form-text text-muted small">
                            Ví dụ: tin tức, sự kiện, khuyến mãi
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className="card shadow-sm mb-4"
                      style={{ borderRadius: "12px" }}
                    >
                      <div className="card-header bg-light py-3">
                        <h5 className="mb-0 fw-bold">Ảnh đại diện</h5>
                      </div>
                      <div className="card-body">
                        <div className="form-group">
                          <label
                            htmlFor="featured_image"
                            className="form-label fw-bold mb-2"
                          >
                            URL ảnh
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="featured_image"
                            name="featured_image"
                            value={form.featured_image}
                            onChange={handleChange}
                            placeholder="Nhập URL ảnh đại diện"
                            style={{ borderRadius: "10px", padding: "12px" }}
                          />
                          {form.featured_image ? (
                            <div className="mt-3 text-center">
                              <img
                                src={form.featured_image}
                                alt="Preview"
                                className="img-fluid rounded"
                                style={{ maxHeight: "200px", maxWidth: "100%" }}
                              />
                            </div>
                          ) : (
                            <div className="mt-3 text-center border rounded p-4 bg-light">
                              <i
                                className="fas fa-image"
                                style={{ fontSize: "48px", color: "#ccc" }}
                              ></i>
                              <p className="text-muted mt-2 mb-0">
                                Chưa có ảnh đại diện
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
