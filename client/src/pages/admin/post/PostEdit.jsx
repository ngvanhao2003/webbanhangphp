import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import authService from "../../../services/admin.service";
import axios from "../../../axios";

export default function PostEdit() {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    featured_image: "",
    status: "draft",
    categories: [],
    tags: "",
  });
  const [originalForm, setOriginalForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch post and categories data
  useEffect(() => {
    async function fetchData() {
      try {
        setPageLoading(true);

        // Check if ID is invalid or undefined
        if (!id || id === "undefined") {
          setError("ID bài viết không hợp lệ");
          setPageLoading(false);
          setLoading(false);
          return;
        }

        // Fetch categories
        const categoriesResponse = await axios.get("/api/categories");
        console.log("Danh mục:", categoriesResponse.data);
        setCategories(categoriesResponse.data || []);

        // Fetch post details
        console.log("Đang tải bài viết với ID:", id);
        const postResponse = await axios.get(`/api/posts/${id}`);
        console.log("Dữ liệu bài viết:", postResponse.data);
        const post = postResponse.data;

        if (post) {
          // Prepare form data
          const formData = {
            title: post.title || "",
            slug: post.slug || "",
            summary: post.summary || "",
            content: post.content || "",
            featured_image: post.featured_image || "",
            status: post.status || "draft",
            categories: post.categories?.map((cat) => cat._id || cat) || [],
            tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
          };
          console.log("Form data:", formData);

          setForm(formData);
          setOriginalForm(formData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setPageLoading(false);
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));

    // Auto-generate slug when title changes and slug hasn't been manually edited
    if (name === "title" && form.slug === originalForm.slug) {
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
    setForm((prevForm) => ({ ...prevForm, categories: selectedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if ID is invalid or undefined before submitting
    if (!id || id === "undefined") {
      setError("ID bài viết không hợp lệ");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      // Format tags from comma-separated string to array
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
      };

      console.log("Dữ liệu gửi lên server:", postData);
      console.log("Đang cập nhật bài viết với ID:", id);
      const response = await axios.put(`/api/posts/${id}`, postData);
      console.log("Kết quả cập nhật:", response.data);

      if (response.data) {
        setSuccessMessage("Cập nhật bài viết thành công!");
        setOriginalForm({ ...form, tags: formattedTags.join(", ") });

        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate("/admin/post");
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating post:", err);
      setError(
        err.response?.data?.error ||
          "Không thể cập nhật bài viết. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container mt-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-3">Đang tải dữ liệu bài viết...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <div
            className="card shadow-sm"
            style={{ borderRadius: "15px", overflow: "hidden" }}
          >
            <div
              className="card-header"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                color: "white",
                padding: "20px",
                borderBottom: "none",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h3 style={{ margin: 0, fontWeight: 600 }}>
                  Chỉnh sửa bài viết
                </h3>
                <Link to="/admin/post" className="btn btn-light">
                  <i className="fas fa-arrow-left mr-2"></i>Quay lại
                </Link>
              </div>
            </div>
            <div className="card-body p-4">
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-check-circle mr-2"></i>
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    <div className="form-group mb-3">
                      <label htmlFor="title" className="form-label fw-bold">
                        Tiêu đề <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: "8px", padding: "12px" }}
                      />
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="slug" className="form-label fw-bold">
                        Slug <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="slug"
                        name="slug"
                        value={form.slug}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: "8px", padding: "12px" }}
                      />
                      <div className="form-text text-muted">
                        URL thân thiện cho bài viết. Ví dụ: bai-viet-moi
                      </div>
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="summary" className="form-label fw-bold">
                        Tóm tắt
                      </label>
                      <textarea
                        className="form-control"
                        id="summary"
                        name="summary"
                        value={form.summary}
                        onChange={handleChange}
                        rows="3"
                        style={{ borderRadius: "8px", padding: "12px" }}
                      ></textarea>
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="content" className="form-label fw-bold">
                        Nội dung <span className="text-danger">*</span>
                      </label>
                      <textarea
                        className="form-control"
                        id="content"
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        rows="10"
                        required
                        style={{ borderRadius: "8px", padding: "12px" }}
                      ></textarea>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group mb-3">
                      <label htmlFor="status" className="form-label fw-bold">
                        Trạng thái
                      </label>
                      <select
                        className="form-control"
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        style={{ borderRadius: "8px", padding: "12px" }}
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="published">Công khai</option>
                      </select>
                    </div>

                    <div className="form-group mb-3">
                      <label
                        htmlFor="categories"
                        className="form-label fw-bold"
                      >
                        Danh mục
                      </label>
                      <select
                        className="form-control"
                        id="categories"
                        name="categories"
                        multiple
                        value={form.categories}
                        onChange={handleCategoryChange}
                        style={{
                          borderRadius: "8px",
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
                      <div className="form-text text-muted">
                        Giữ Ctrl (Windows) hoặc Command (Mac) để chọn nhiều danh
                        mục
                      </div>
                    </div>

                    <div className="form-group mb-3">
                      <label htmlFor="tags" className="form-label fw-bold">
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
                        style={{ borderRadius: "8px", padding: "12px" }}
                      />
                      <div className="form-text text-muted">
                        Ví dụ: tin tức, sự kiện, khuyến mãi
                      </div>
                    </div>

                    <div className="form-group mb-3">
                      <label
                        htmlFor="featured_image"
                        className="form-label fw-bold"
                      >
                        Ảnh đại diện
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="featured_image"
                        name="featured_image"
                        value={form.featured_image}
                        onChange={handleChange}
                        placeholder="Nhập URL ảnh"
                        style={{ borderRadius: "8px", padding: "12px" }}
                      />
                      {form.featured_image && (
                        <div className="mt-2">
                          <img
                            src={form.featured_image}
                            alt="Preview"
                            className="img-thumbnail"
                            style={{ maxHeight: "150px" }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                          border: "none",
                          borderRadius: "8px",
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
                            <i className="fas fa-save me-2"></i>Lưu thay đổi
                          </>
                        )}
                      </button>

                      <Link
                        to="/admin/post"
                        className="btn btn-light btn-lg"
                        style={{ borderRadius: "8px" }}
                      >
                        <i className="fas fa-times me-2"></i>Hủy
                      </Link>
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
