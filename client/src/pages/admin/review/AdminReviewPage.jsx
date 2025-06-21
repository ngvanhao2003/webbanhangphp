// AdminReviewPage.jsx
import React, { useEffect, useState } from "react";
import axios from "../../../axios";
import { Link } from "react-router-dom";

const AdminReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStarReviews: 0,
    oneStarReviews: 0,
  });
  const [searchTerm, setSearchTerm] = useState(""); // State cho tìm kiếm

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, []);

  // Sửa fetchReviews để nhận searchTerm
  const fetchReviews = async (search = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      // Thêm query search nếu có
      const res = await axios.get(
        `/api/reviews${search ? `?search=${encodeURIComponent(search)}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let reviewList = Array.isArray(res.data.data) ? res.data.data : [];
      setReviews(reviewList);

      // Tính toán thống kê
      const totalReviews = reviewList.length;
      const sumRatings = reviewList.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );
      const averageRating =
        totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : 0;
      const fiveStarReviews = reviewList.filter(
        (review) => review.rating === 5
      ).length;
      const oneStarReviews = reviewList.filter(
        (review) => review.rating === 1
      ).length;

      setStats({
        totalReviews,
        averageRating,
        fiveStarReviews,
        oneStarReviews,
      });

      setError(null);
    } catch (err) {
      setError("Lỗi khi tải đánh giá");
      setReviews([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/api/reviews/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedReviews = reviews.filter((r) => r._id !== id);
      setReviews(updatedReviews);

      // Cập nhật lại thống kê
      const totalReviews = updatedReviews.length;
      const sumRatings = updatedReviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );
      const averageRating =
        totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : 0;
      const fiveStarReviews = updatedReviews.filter(
        (review) => review.rating === 5
      ).length;
      const oneStarReviews = updatedReviews.filter(
        (review) => review.rating === 1
      ).length;

      setStats({
        totalReviews,
        averageRating,
        fiveStarReviews,
        oneStarReviews,
      });
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  // Hàm render stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          style={{
            color: i <= rating ? "#faad14" : "#d9d9d9",
            fontSize: "16px",
            marginRight: "2px",
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Xử lý thay đổi input tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Lọc review theo searchTerm (lọc client-side)
  const filteredReviews = reviews.filter((review) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    const productName = review.product_id?.name?.toLowerCase() || "";
    const userName = review.user_id?.username?.toLowerCase() || "";
    const comment = review.comment?.toLowerCase() || "";
    return (
      productName.includes(term) ||
      userName.includes(term) ||
      comment.includes(term)
    );
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  // Reset về trang 1 khi searchTerm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
          Quản lý đánh giá
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
            <span style={{ fontSize: 28, marginRight: 8 }}>⭐</span> Tổng quan
            đánh giá
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Theo dõi và quản lý các đánh giá của khách hàng
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý đánh giá sản phẩm trong hệ thống. Bạn có thể
            xem và quản lý tất cả các đánh giá từ khách hàng.
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
              <span role="img" aria-label="review">
                📊
              </span>{" "}
              {stats.totalReviews}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng đánh giá</div>
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
              <span role="img" aria-label="star">
                ⭐
              </span>{" "}
              {stats.averageRating}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Điểm trung bình</div>
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
              <span role="img" aria-label="happy">
                🌟
              </span>{" "}
              {stats.fiveStarReviews}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Đánh giá 5 sao</div>
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
              <span role="img" aria-label="sad">
                ⚠️
              </span>{" "}
              {stats.oneStarReviews}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Đánh giá 1 sao</div>
          </div>
        </div>

        <div
          className="dashboard-content"
          style={{
            background: "#fff",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)",
            marginBottom: 24,
          }}
        >
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
                Đang tải dữ liệu đánh giá...
              </p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>
                  Danh sách đánh giá
                </h3>
                <div className="d-flex">
                  <form className="d-flex">
                    <input
                      type="text"
                      className="form-control mr-2"
                      placeholder="Tìm kiếm đánh giá..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      style={{
                        borderRadius: 8,
                        border: "1px solid #e0e7ff",
                        padding: "8px 16px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    />
                  </form>
                </div>
              </div>

              <div className="table-responsive">
                <table
                  className="table table-hover"
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <thead
                    style={{
                      background: "linear-gradient(90deg, #e6f7ff, #f0f7ff)",
                      color: "#333",
                    }}
                  >
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Người dùng</th>
                      <th>Đánh giá</th>
                      <th>Điểm</th>
                      <th>Ngày</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReviews.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <div
                            style={{
                              fontSize: 18,
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            Không có đánh giá nào
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#94a3b8",
                              marginTop: 8,
                            }}
                          >
                            Các đánh giá từ khách hàng sẽ xuất hiện ở đây
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedReviews.map((review) => (
                        <tr key={review._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>
                              {review.product_id?.name || "Không rõ"}
                            </div>
                            {review.product_id?._id && (
                              <small style={{ color: "#64748b" }}>
                                ID: {review.product_id._id}
                              </small>
                            )}
                          </td>
                          <td>
                            <div>
                              {review.user_id?.username || "Không rõ"}
                            </div>
                            {review.user_id?._id && (
                              <small style={{ color: "#64748b" }}>
                                {review.user_id._id}
                              </small>
                            )}
                          </td>
                          <td style={{ maxWidth: 300 }}>
                            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                              {review.comment}
                            </div>
                          </td>
                          <td>
                            <div>{renderStars(review.rating)}</div>
                          </td>
                          <td>
                            {new Date(review.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="text-center">
                            <button
                              onClick={() => handleDelete(review._id)}
                              className="btn btn-sm btn-danger"
                              style={{
                                borderRadius: 8,
                                padding: "6px 12px",
                                background:
                                  "linear-gradient(90deg, #f87171, #ef4444)",
                                border: "none",
                              }}
                            >
                              <i className="fas fa-trash mr-1"></i> Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Phân trang */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 24,
                    gap: 8,
                  }}
                >
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ borderRadius: 6, minWidth: 36 }}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`btn btn-sm ${
                        currentPage === i + 1
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        borderRadius: 6,
                        minWidth: 36,
                        fontWeight: currentPage === i + 1 ? 700 : 400,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    style={{ borderRadius: 6, minWidth: 36 }}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewPage;