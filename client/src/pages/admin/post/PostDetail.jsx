import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "../../../axios";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPost() {
      if (!id || id === "undefined") {
        setError("ID bài viết không hợp lệ");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/posts/${id}`);
        console.log("Dữ liệu bài viết:", res.data);
        setPost(res.data);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(
          err.response?.data?.error ||
            "Không thể tải bài viết. Vui lòng thử lại sau."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!id || id === "undefined") {
      alert("ID bài viết không hợp lệ");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }

    try {
      setDeleteLoading(true);
      console.log("Đang xóa bài viết với ID:", id);
      const response = await axios.delete(`/api/posts/${id}`);
      console.log("Kết quả xóa bài viết:", response.data);
      alert("Xóa bài viết thành công!");
      navigate("/admin/post");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert(
        err.response?.data?.error ||
          "Không thể xóa bài viết. Vui lòng thử lại sau."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
        <Link to="/admin/post" className="btn btn-secondary">
          <i className="fas fa-arrow-left mr-2"></i>Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-triangle mr-2"></i>Bài viết không tồn
          tại
        </div>
        <Link to="/admin/post" className="btn btn-secondary">
          <i className="fas fa-arrow-left mr-2"></i>Quay lại danh sách
        </Link>
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
                background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                color: "white",
                padding: "20px",
                borderBottom: "none",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h3 style={{ margin: 0, fontWeight: 600 }}>
                  Chi tiết bài viết
                </h3>
                <div>
                  <Link to="/admin/post" className="btn btn-light me-2">
                    <i className="fas fa-arrow-left mr-2"></i>Quay lại
                  </Link>
                  <Link
                    to={`/admin/post/edit/${id}`}
                    className="btn btn-primary me-2"
                  >
                    <i className="fas fa-edit mr-2"></i>Chỉnh sửa
                  </Link>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-trash mr-2"></i>Xóa
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              <div className="row">
                <div className="col-md-8">
                  <h1 className="mb-4" style={{ fontWeight: 700 }}>
                    {post.title}
                  </h1>

                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        style={{
                          padding: "6px 12px",
                          borderRadius: "50px",
                          background:
                            post.status === "published" ? "#dcfce7" : "#fee2e2",
                          color:
                            post.status === "published" ? "#16a34a" : "#ef4444",
                          fontWeight: 600,
                          fontSize: "14px",
                          display: "inline-block",
                        }}
                      >
                        <i
                          className={`fas fa-${
                            post.status === "published"
                              ? "check-circle"
                              : "clock"
                          } me-2`}
                        ></i>
                        {post.status === "published"
                          ? "Đã xuất bản"
                          : "Bản nháp"}
                      </div>

                      {post.created_at && (
                        <div className="ms-3 text-muted">
                          <i className="far fa-calendar-alt me-1"></i>
                          {new Date(post.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      )}

                      {post.author && (
                        <div className="ms-3 text-muted">
                          <i className="far fa-user me-1"></i>
                          {post.author}
                        </div>
                      )}
                    </div>

                    {post.categories && post.categories.length > 0 && (
                      <div className="mb-3">
                        <strong>Danh mục:</strong>
                        <div className="mt-1">
                          {post.categories.map((category) => (
                            <span
                              key={category._id || category}
                              className="badge bg-primary me-2 p-2"
                              style={{
                                borderRadius: "6px",
                                background:
                                  "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                              }}
                            >
                              {category.category_name ||
                                (typeof category === "string" ? category : "")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-3">
                        <strong>Thẻ:</strong>
                        <div className="mt-1">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="badge bg-secondary me-2 p-2"
                              style={{ borderRadius: "6px" }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {post.summary && (
                    <div className="mb-4">
                      <h5 className="fw-bold">Tóm tắt:</h5>
                      <div className="p-3 bg-light rounded">{post.summary}</div>
                    </div>
                  )}

                  <div className="mb-4">
                    <h5 className="fw-bold">Nội dung:</h5>
                    <div
                      className="post-content p-3 bg-light rounded"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                      style={{ minHeight: "200px" }}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h5 className="mb-0 fw-bold">Thông tin bài viết</h5>
                    </div>
                    <div className="card-body">
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td>
                              <strong>ID:</strong>
                            </td>
                            <td>{post._id || post.id}</td>
                          </tr>
                          <tr>
                            <td>
                              <strong>Slug:</strong>
                            </td>
                            <td>{post.slug}</td>
                          </tr>
                          {post.view_count !== undefined && (
                            <tr>
                              <td>
                                <strong>Lượt xem:</strong>
                              </td>
                              <td>{post.view_count}</td>
                            </tr>
                          )}
                          {post.created_at && (
                            <tr>
                              <td>
                                <strong>Ngày tạo:</strong>
                              </td>
                              <td>
                                {new Date(post.created_at).toLocaleString(
                                  "vi-VN"
                                )}
                              </td>
                            </tr>
                          )}
                          {post.updated_at && (
                            <tr>
                              <td>
                                <strong>Cập nhật:</strong>
                              </td>
                              <td>
                                {new Date(post.updated_at).toLocaleString(
                                  "vi-VN"
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      <div className="d-grid gap-2 mt-3">
                        <a
                          href={`/post/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-success"
                        >
                          <i className="fas fa-external-link-alt me-2"></i>
                          Xem trang công khai
                        </a>
                      </div>
                    </div>
                  </div>

                  {post.featured_image && (
                    <div className="card">
                      <div className="card-header bg-light">
                        <h5 className="mb-0 fw-bold">Ảnh đại diện</h5>
                      </div>
                      <div className="card-body text-center">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="img-fluid rounded"
                          style={{ maxWidth: "100%", maxHeight: "300px" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
