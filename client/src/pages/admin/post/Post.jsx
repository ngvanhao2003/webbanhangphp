import React, { useEffect, useState } from "react";
import Footer from "../footer/Footer";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../../services/admin.service";
import PostCreate from "./PostCreate";
import PostEdit from "./PostEdit";
import PostDetail from "./PostDetail";
import { Routes, Route } from "react-router-dom";
import axios from "../../../axios";

export default function Post() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    featuredPosts: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("/api/posts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Debug: log posts data to check for missing IDs
      console.log("Fetched posts:", res.data);

      // Handle different response formats
      const postsData = res.data.data || res.data || [];

      if (postsData && postsData.length > 0) {
        postsData.forEach((post, index) => {
          console.log(`Post ${index} ID:`, post._id || post.id);
        });
      }

      setPosts(postsData);

      // Calculate post statistics
      const totalPosts = postsData.length;
      const publishedPosts = postsData.filter(
        (post) => post.status === "published"
      ).length;
      const draftPosts = postsData.filter(
        (post) => post.status === "draft"
      ).length;
      const featuredPosts = postsData.filter(
        (post) => post.featured_image || post.is_featured
      ).length;

      setStats({
        totalPosts,
        publishedPosts,
        draftPosts,
        featuredPosts,
      });
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài viết:", err);
      setError("Không thể tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }

  // Function to delete a post
  const deletePost = async (postId) => {
    if (!postId) {
      console.error("Lỗi: ID bài viết không xác định");
      setError("Không thể xóa bài viết. ID bài viết không hợp lệ.");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        setLoading(true);
        console.log("Đang xóa bài viết với ID:", postId);

        const token = localStorage.getItem("adminToken");
        // Use the correct API endpoint with a consistent format
        const response = await axios.delete(`/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Kết quả xóa bài viết:", response.data);
        alert("Xóa bài viết thành công!");
        // Refresh the posts list after deletion
        fetchPosts();
      } catch (err) {
        console.error("Lỗi khi xóa bài viết:", err);
        let errorMessage = "Không thể xóa bài viết. Vui lòng thử lại sau.";
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Phản hồi lỗi:", err.response.data);
          console.error("Mã trạng thái:", err.response.status);
          if (err.response.data && err.response.data.message) {
            errorMessage = `Lỗi: ${err.response.data.message}`;
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error("Không nhận được phản hồi từ máy chủ");
          errorMessage = "Không nhận được phản hồi từ máy chủ";
        }
        setError(errorMessage);
        setLoading(false);
      }
    }
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
          Quản lý Bài viết
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
            <span style={{ fontSize: 28, marginRight: 8 }}>📝</span> Tổng quan
            Bài viết
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Quản lý và theo dõi các bài viết
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý bài viết trong hệ thống. Bạn có thể thêm, sửa,
            xóa và quản lý trạng thái các bài viết.
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
                📊
              </span>{" "}
              {stats.totalPosts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng bài viết</div>
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
              <span role="img" aria-label="published">
                ✅
              </span>{" "}
              {stats.publishedPosts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>
              Bài viết đã xuất bản
            </div>
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
              <span role="img" aria-label="draft">
                ⏸️
              </span>{" "}
              {stats.draftPosts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Bài viết nháp</div>
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
                🖼️
              </span>{" "}
              {stats.featuredPosts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>
              Bài viết có hình ảnh
            </div>
          </div>
        </div>

        <div className="dashboard-main-content mb-5">
          <section
            style={{
              background: "white",
              borderRadius: 18,
              padding: 32,
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h2
                style={{ fontWeight: 700, fontSize: 24, marginBottom: 0 }}
                className="mb-0"
              >
                Danh sách Bài viết
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                }}
              >
                <button
                  style={{
                    background: "linear-gradient(90deg, #667eea, #764ba2)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.24)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(102, 126, 234, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(102, 126, 234, 0.24)";
                  }}
                  onClick={fetchPosts}
                >
                  <i className="fas fa-sync-alt mr-2"></i> Làm mới
                </button>
                <Link
                  to="/admin/post/create"
                  style={{
                    background: "linear-gradient(90deg, #10b981, #059669)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    padding: "10px 20px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.24)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    textDecoration: "none",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 16px rgba(16, 185, 129, 0.3)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(16, 185, 129, 0.24)";
                  }}
                >
                  <i className="fas fa-plus"></i> Thêm bài viết
                </Link>
              </div>
            </div>

            <div className="dashboard-table-wrapper mt-4">
              <div className="dashboard-table">
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 32,
                    }}
                  >
                    <div
                      className="spinner-border text-primary"
                      role="status"
                    ></div>
                    <span className="ml-2">Đang tải...</span>
                  </div>
                ) : error ? (
                  <div
                    style={{
                      padding: 24,
                      background: "#fee2e2",
                      color: "#ef4444",
                      borderRadius: 8,
                      fontWeight: 500,
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
                          background:
                            "linear-gradient(90deg, #e6f7ff, #f0f7ff)",
                        }}
                      >
                        <tr>
                          <th
                            className="text-center"
                            style={{
                              padding: 16,
                              width: "30px",
                              borderTopLeftRadius: 12,
                            }}
                          >
                            <input type="checkbox" />
                          </th>
                          <th
                            className="text-center"
                            style={{ padding: 16, width: "90px" }}
                          >
                            Hình
                          </th>
                          <th style={{ padding: 16 }}>Tiêu đề bài viết</th>
                          <th style={{ padding: 16 }}>Chủ đề</th>
                          <th style={{ padding: 16 }}>Trạng thái</th>
                          <th
                            className="text-center"
                            style={{
                              padding: 16,
                              width: "200px",
                              borderTopRightRadius: 12,
                            }}
                          >
                            Chức năng
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts && posts.length > 0 ? (
                          posts.map((post, idx) => (
                            <tr
                              key={post._id || idx}
                              style={{
                                borderBottom: "1px solid #f0f0f0",
                                transition: "background 0.2s",
                                "&:hover": {
                                  background: "#f8fafc",
                                },
                              }}
                            >
                              <td
                                className="text-center"
                                style={{ padding: "16px 12px" }}
                              >
                                <input
                                  type="checkbox"
                                  value={post._id}
                                  name="checkId[]"
                                />
                              </td>
                              <td
                                className="text-center"
                                style={{ padding: "16px 12px" }}
                              >
                                <img
                                  src={
                                    post.featured_image ||
                                    "/images/posts/post.png"
                                  }
                                  className="img-fluid"
                                  alt={post.title}
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
                              <td style={{ padding: "16px 12px" }}>
                                {post.title}
                              </td>
                              <td style={{ padding: "16px 12px" }}>
                                {post.categories && post.categories.length > 0
                                  ? post.categories.map((c, i) => (
                                      <span
                                        key={c._id || i}
                                        style={{
                                          display: "inline-block",
                                          background: "#f1f5f9",
                                          color: "#475569",
                                          padding: "3px 8px",
                                          borderRadius: 8,
                                          fontSize: 13,
                                          margin: "0 4px 4px 0",
                                        }}
                                      >
                                        {c.category_name}
                                      </span>
                                    ))
                                  : "-"}
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
                                      post.status === "published"
                                        ? "#dcfce7"
                                        : "#fee2e2",
                                    color:
                                      post.status === "published"
                                        ? "#16a34a"
                                        : "#ef4444",
                                  }}
                                >
                                  {post.status === "published"
                                    ? "Đã xuất bản"
                                    : "Bản nháp"}
                                </span>
                              </td>
                              <td
                                className="text-center"
                                style={{ padding: "16px 12px" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 10,
                                    justifyContent: "center",
                                  }}
                                >
                                  {/* Link button */}
                                  <button
                                    type="button"
                                    title="Liên kết đến trang bài viết"
                                    style={{
                                      background: "#94a3b8",
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
                                      boxShadow:
                                        "0 4px 10px rgba(148, 163, 184, 0.2)",
                                      transition: "transform 0.15s",
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(-2px)")
                                    }
                                    onMouseOut={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(0)")
                                    }
                                    onClick={() =>
                                      window.open(
                                        `/post/${post._id || ""}`,
                                        "_blank"
                                      )
                                    }
                                  >
                                    <i className="fas fa-link"></i>
                                  </button>

                                  {/* View button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/admin/post/${post._id}`)
                                    }
                                    title="Xem chi tiết"
                                    style={{
                                      background: "#8b5cf6",
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
                                      boxShadow:
                                        "0 4px 10px rgba(139, 92, 246, 0.2)",
                                      transition: "transform 0.15s",
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(-2px)")
                                    }
                                    onMouseOut={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(0)")
                                    }
                                  >
                                    <i className="far fa-eye"></i>
                                  </button>

                                  {/* Edit button */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/admin/post/edit/${post._id}`)
                                    }
                                    title="Chỉnh sửa"
                                    style={{
                                      background: "#3b82f6",
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
                                      boxShadow:
                                        "0 4px 10px rgba(59, 130, 246, 0.2)",
                                      transition: "transform 0.15s",
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(-2px)")
                                    }
                                    onMouseOut={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(0)")
                                    }
                                  >
                                    <i className="far fa-edit"></i>
                                  </button>

                                  {/* Delete button */}
                                  <button
                                    type="button"
                                    title="Xóa"
                                    style={{
                                      background: "#f43f5e",
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
                                      boxShadow:
                                        "0 4px 10px rgba(244, 63, 94, 0.2)",
                                      transition: "transform 0.15s",
                                    }}
                                    onMouseOver={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(-2px)")
                                    }
                                    onMouseOut={(e) =>
                                      (e.currentTarget.style.transform =
                                        "translateY(0)")
                                    }
                                    onClick={() => {
                                      if (post && (post._id || post.id)) {
                                        const postId = post._id || post.id;
                                        console.log(
                                          "Xóa bài viết với ID:",
                                          postId
                                        );
                                        deletePost(postId);
                                      } else {
                                        console.error(
                                          "ID bài viết không tồn tại",
                                          post
                                        );
                                        setError(
                                          "Không thể xóa bài viết: ID không xác định"
                                        );
                                      }
                                    }}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center"
                              style={{ padding: 32 }}
                            >
                              <div
                                style={{
                                  fontSize: 18,
                                  color: "#64748b",
                                  fontWeight: 500,
                                }}
                              >
                                Không có bài viết nào
                              </div>
                              <div
                                style={{
                                  fontSize: 14,
                                  color: "#94a3b8",
                                  marginTop: 8,
                                }}
                              >
                                Hãy thêm bài viết mới bằng nút "Thêm bài viết"
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}

export function PostRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Post />} />
      <Route path="create" element={<PostCreate />} />
      <Route path="edit/:id" element={<PostEdit />} />
      <Route path=":id" element={<PostDetail />} />
    </Routes>
  );
}
