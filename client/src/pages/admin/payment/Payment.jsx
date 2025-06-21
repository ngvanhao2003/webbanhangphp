import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../../axios";

export default function Payment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("payment_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalPayments: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  });

  // Tải danh sách thanh toán
  const fetchPayments = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      // Xây dựng query params
      let queryParams = `page=${page}&limit=10`;

      // Thêm sắp xếp
      if (sortBy) queryParams += `&sort_by=${sortBy}&sort_order=${sortOrder}`;

      // Thêm bộ lọc nếu có
      if (dateRange.startDate)
        queryParams += `&startDate=${dateRange.startDate}`;
      if (dateRange.endDate) queryParams += `&endDate=${dateRange.endDate}`;

      const response = await axios.get(`/api/payments?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Sửa lại lấy đúng trường data và pagination
      const paymentData = response.data.data || [];
      setPayments(paymentData);
      setTotalPages(
        response.data.pagination ? response.data.pagination.pages : 1
      );

      // Tính toán thống kê
      const totalAmount = paymentData.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      );

      const successful = paymentData.filter((payment) =>
        ["completed", "success", "paid", "complete"].includes(
          String(payment.payment_status || "").toLowerCase()
        )
      ).length;

      const pending = paymentData.filter((payment) =>
        ["pending", "processing"].includes(
          String(payment.payment_status || "").toLowerCase()
        )
      ).length;

      const failed = paymentData.filter((payment) =>
        ["failed", "cancelled", "canceled"].includes(
          String(payment.payment_status || "").toLowerCase()
        )
      ).length;

      setStats({
        totalAmount,
        totalPayments: paymentData.length,
        successfulPayments: successful,
        pendingPayments: pending,
        failedPayments: failed,
      });

      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải danh sách thanh toán:", error);
      setError("Không thể tải danh sách thanh toán. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [sortBy, sortOrder, dateRange]);

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchPayments(page);
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Nếu đang sắp xếp theo field này, đổi thứ tự
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Nếu chuyển sang field khác, mặc định desc
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchPayments(1); // Tìm kiếm từ trang đầu tiên
  };

  // Xử lý thay đổi khoảng thời gian
  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Xử lý làm mới bộ lọc
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilter("all");
    setDateRange({ startDate: "", endDate: "" });
    setSortBy("payment_date");
    setSortOrder("desc");
    fetchPayments(1);
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format thời gian
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Trả về nhãn và class cho trạng thái thanh toán
  const getPaymentStatusLabel = (status) => {
    if (!status) return { label: "N/A", className: "badge bg-secondary" };

    const normalized = String(status).toLowerCase();

    if (["completed", "success", "paid", "complete"].includes(normalized)) {
      return { label: "Đã thanh toán", className: "badge bg-success" };
    }

    if (["pending", "processing"].includes(normalized)) {
      return { label: "Đang chờ", className: "badge bg-warning" };
    }

    if (["failed", "cancelled", "canceled"].includes(normalized)) {
      return { label: "Thất bại", className: "badge bg-danger" };
    }

    if (normalized === "refunded") {
      return { label: "Đã hoàn tiền", className: "badge bg-info" };
    }

    return { label: status, className: "badge bg-secondary" };
  };

  // Trả về nhãn cho phương thức thanh toán
  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case "cash":
        return "Thanh toán khi nhận hàng";
      case "vnpay":
        return "VNPay";
      case "momo":
        return "MoMo";
      case "zalopay":
        return "ZaloPay";
      case "bank_transfer":
        return "Chuyển khoản ngân hàng";
      case "credit_card":
        return "Thẻ tín dụng";
      case "paypal":
        return "PayPal";
      default:
        return "Phương thức khác";
    }
  };

  // Hàm lọc danh sách thanh toán theo trạng thái
  const filteredPayments = payments.filter((payment) => {
    if (!payment) return false;

    // Lọc theo trạng thái
    if (filter !== "all") {
      const normalized = String(payment.payment_status || "").toLowerCase();
      if (
        filter === "completed" &&
        !["completed", "success", "paid", "complete"].includes(normalized)
      )
        return false;
      if (
        filter === "pending" &&
        !["pending", "processing"].includes(normalized)
      )
        return false;
      if (
        filter === "failed" &&
        !["failed", "cancelled", "canceled"].includes(normalized)
      )
        return false;
      if (filter === "refunded" && normalized !== "refunded") return false;
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const transactionId = String(
        payment.transaction_id || payment._id || ""
      ).toLowerCase();
      const orderNumber =
        payment.order_id && payment.order_id.order_number
          ? String(payment.order_id.order_number).toLowerCase()
          : "";
      const username =
        payment.user_id && payment.user_id.username
          ? String(payment.user_id.username).toLowerCase()
          : "";
      const email =
        payment.user_id && payment.user_id.email
          ? String(payment.user_id.email).toLowerCase()
          : "";

      // Kiểm tra xem từ khóa có xuất hiện trong bất kỳ trường nào không
      if (
        !transactionId.includes(searchLower) &&
        !orderNumber.includes(searchLower) &&
        !username.includes(searchLower) &&
        !email.includes(searchLower)
      ) {
        return false;
      }
    }

    return true;
  });

  // Render phân trang
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Nút trang đầu tiên
    pages.push(
      <li
        key="first"
        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
      >
        <button className="page-link" onClick={() => handlePageChange(1)}>
          <i className="fas fa-angle-double-left"></i>
        </button>
      </li>
    );

    // Nút trang trước
    pages.push(
      <li
        key="prev"
        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
      >
        <button
          className="page-link"
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        >
          <i className="fas fa-angle-left"></i>
        </button>
      </li>
    );

    // Các trang
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    // Nút trang sau
    pages.push(
      <li
        key="next"
        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
      >
        <button
          className="page-link"
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
        >
          <i className="fas fa-angle-right"></i>
        </button>
      </li>
    );

    // Nút trang cuối cùng
    pages.push(
      <li
        key="last"
        className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
      >
        <button
          className="page-link"
          onClick={() => handlePageChange(totalPages)}
        >
          <i className="fas fa-angle-double-right"></i>
        </button>
      </li>
    );

    return (
      <div className="payment-pagination d-flex justify-content-center">
        <nav aria-label="Page navigation">
          <ul className="pagination">{pages}</ul>
        </nav>
      </div>
    );
  };

  return (
    <div>
      <style jsx="true">{`
        .payment-modern-bg {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
          min-height: 100vh;
        }
        .payment-card {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 4px 24px rgba(60, 72, 100, 0.1);
          padding: 32px 24px 24px 24px;
          margin-bottom: 32px;
          border: none;
        }
        .payment-table {
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(60, 72, 100, 0.07);
          background: #fff;
        }
        .payment-table th,
        .payment-table td {
          vertical-align: middle !important;
          padding: 16px 12px;
        }
        .payment-table th {
          background: #f1f5fa;
          color: #3c4864;
          font-weight: 600;
          border-bottom: 2px solid #e0e7ef;
          cursor: pointer;
          transition: background 0.15s;
        }
        .payment-table th:hover {
          background: #e0e7ef;
        }
        .payment-table th .sort-icon {
          margin-left: 5px;
          opacity: 0.5;
        }
        .payment-table th.active .sort-icon {
          opacity: 1;
        }
        .payment-table tbody tr {
          transition: background 0.2s;
        }
        .payment-table tbody tr:hover {
          background: #f5faff;
        }
        .badge {
          font-size: 1em;
          padding: 0.5em 1em;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 0.5em;
        }
        .badge.bg-success {
          background: linear-gradient(90deg, #4ade80, #22d3ee);
          color: #fff;
        }
        .badge.bg-warning {
          background: linear-gradient(90deg, #fbbf24, #f59e42);
          color: #fff;
        }
        .badge.bg-danger {
          background: linear-gradient(90deg, #f87171, #ef4444);
          color: #fff;
        }
        .badge.bg-info {
          background: linear-gradient(90deg, #67e8f9, #06b6d4);
          color: #fff;
        }
        .badge.bg-secondary {
          background: linear-gradient(90deg, #94a3b8, #64748b);
          color: #fff;
        }
        .payment-filter {
          background: #f8fafc;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e0e7ef;
        }
        .payment-filter .form-control,
        .payment-filter .btn,
        .payment-filter .dropdown-toggle {
          border-radius: 10px;
          box-shadow: none;
          border: 1px solid #e0e7ef;
          padding: 12px 16px;
          height: auto;
        }
        .payment-filter .form-control:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
        }
        .payment-filter label {
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
        }
        .payment-filter .btn-primary {
          background: linear-gradient(90deg, #2563eb, #38bdf8);
          border: none;
          padding: 12px 24px;
          font-weight: 600;
          min-width: 120px;
        }
        .payment-filter .btn-primary:hover {
          background: linear-gradient(90deg, #1d4ed8, #0ea5e9);
        }
        .payment-filter .btn-outline-secondary {
          color: #475569;
          border-color: #e0e7ef;
        }
        .payment-filter .btn-outline-secondary:hover {
          background: #f1f5fa;
          color: #1e293b;
        }
        .payment-stats .small-box {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(60, 72, 100, 0.08);
          transition: all 0.3s;
          height: 120px;
          display: flex;
          flex-direction: column;
        }
        .payment-stats .small-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(60, 72, 100, 0.12);
        }
        .payment-stats .small-box.bg-info {
          background: linear-gradient(135deg, #38bdf8, #2563eb) !important;
        }
        .payment-stats .small-box.bg-warning {
          background: linear-gradient(135deg, #fbbf24, #f59e0b) !important;
        }
        .payment-stats .small-box.bg-danger {
          background: linear-gradient(135deg, #f87171, #ef4444) !important;
        }
        .payment-stats .small-box.bg-success {
          background: linear-gradient(135deg, #4ade80, #10b981) !important;
        }
        .payment-stats .small-box .inner {
          padding: 20px;
          color: #fff;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .payment-stats .inner h3 {
          font-size: 2em;
          font-weight: 700;
          margin: 0;
          margin-bottom: 4px;
        }
        .payment-stats .inner p {
          font-size: 1.1em;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }
        .payment-stats .icon {
          position: absolute;
          top: 15px;
          right: 15px;
          font-size: 2.5em;
          color: rgba(255, 255, 255, 0.2);
        }
        .payment-pagination nav {
          margin-top: 18px;
        }
        .payment-pagination .pagination {
          border-radius: 999px;
          background: #f1f5fa;
          box-shadow: 0 1px 6px rgba(60, 72, 100, 0.06);
          padding: 8px 18px;
        }
        .payment-pagination .page-item.active .page-link {
          background: linear-gradient(90deg, #818cf8, #38bdf8);
          color: #fff;
          border: none;
          font-weight: 600;
        }
        .payment-pagination .page-link {
          border: none;
          color: #3c4864;
          border-radius: 999px !important;
          margin: 0 4px;
          transition: background 0.15s, color 0.15s;
        }
        .payment-pagination .page-link:hover {
          background: #e0e7ef;
          color: #2563eb;
        }
        .payment-table .btn-info {
          background: linear-gradient(90deg, #818cf8, #38bdf8);
          border: none;
          color: #fff;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .payment-table .btn-info:hover {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
        }
        .payment-empty-state {
          background: #f8fafc;
          border-radius: 14px;
          padding: 48px 24px;
          text-align: center;
          border: 1px dashed #cbd5e1;
        }
        .payment-empty-state .empty-icon {
          font-size: 4em;
          color: #94a3b8;
          margin-bottom: 16px;
        }
        .payment-empty-state h4 {
          color: #475569;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .payment-empty-state p {
          color: #64748b;
          margin-bottom: 24px;
        }
        .payment-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
        }
        .payment-loading .spinner-border {
          width: 48px;
          height: 48px;
          color: #2563eb;
          margin-bottom: 16px;
        }
        .payment-loading p {
          color: #64748b;
          font-size: 1.1em;
          margin: 0;
        }
      `}</style>
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
            Quản lý thanh toán
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
              <span style={{ fontSize: 28, marginRight: 8 }}>💸</span> Tổng quan
              thanh toán
            </h2>
            <div style={{ fontSize: 18, marginBottom: 8 }}>
              Theo dõi và quản lý các giao dịch thanh toán
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>
              Đây là trang quản lý các khoản thanh toán trong hệ thống, bao gồm
              việc xem, tìm kiếm và cập nhật trạng thái thanh toán.
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
                <span role="img" aria-label="money">
                  💰
                </span>{" "}
                {formatCurrency(stats.totalAmount)}
              </div>
              <div style={{ fontSize: 15, opacity: 0.9 }}>
                Tổng giá trị thanh toán
              </div>
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
                <span role="img" aria-label="payment">
                  🧾
                </span>{" "}
                {stats.totalPayments}
              </div>
              <div style={{ fontSize: 15, opacity: 0.9 }}>
                Tổng số giao dịch
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
                <span role="img" aria-label="pending">
                  ⏳
                </span>{" "}
                {stats.pendingPayments}
              </div>
              <div style={{ fontSize: 15, opacity: 0.9 }}>Đang chờ xử lý</div>
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
                <span role="img" aria-label="successful">
                  ✅
                </span>{" "}
                {stats.successfulPayments}
              </div>
              <div style={{ fontSize: 15, opacity: 0.9 }}>
                Thanh toán thành công
              </div>
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
            {/* Tìm kiếm và bộ lọc */}
            <div className="payment-filters mb-4">
              <div className="card mb-0">
                <div className="card-body">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <form onSubmit={handleSearch} className="d-flex">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm giao dịch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <div className="input-group-append">
                            <button
                              className="btn btn-primary"
                              type="submit"
                              style={{
                                background:
                                  "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
                                border: "none",
                              }}
                            >
                              <i className="fas fa-search"></i>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex justify-content-end">
                        <select
                          className="custom-select mr-2"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                          style={{
                            background: "#f8fafc",
                            borderRadius: "8px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          }}
                        >
                          <option value="all">Tất cả</option>
                          <option value="completed">Đã thanh toán</option>
                          <option value="pending">Đang chờ</option>
                          <option value="failed">Thất bại</option>
                        </select>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleResetFilters}
                          style={{
                            borderRadius: "8px",
                            transition: "all 0.2s",
                          }}
                        >
                          <i className="fas fa-sync-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bảng dữ liệu */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Đang tải...</span>
                </div>
                <p className="mt-2">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <>
                <div className="table-responsive">
                  <table
                    className="table table-hover"
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.04)",
                    }}
                  >
                    <thead
                      style={{
                        background: "linear-gradient(90deg, #e6f7ff, #f0f7ff)",
                        color: "#333",
                      }}
                    >
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Mã thanh toán</th>
                        <th scope="col">Người dùng</th>
                        <th scope="col">Số tiền</th>
                        <th scope="col">Phương thức</th>
                        <th scope="col">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSortChange("payment_date");
                            }}
                            className="text-nowrap"
                          >
                            Thời gian{" "}
                            {sortBy === "payment_date" && (
                              <i
                                className={`fas fa-sort-${
                                  sortOrder === "asc" ? "up" : "down"
                                }`}
                              ></i>
                            )}
                          </a>
                        </th>
                        <th scope="col">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSortChange("payment_status");
                            }}
                            className="text-nowrap"
                          >
                            Trạng thái{" "}
                            {sortBy === "payment_status" && (
                              <i
                                className={`fas fa-sort-${
                                  sortOrder === "asc" ? "up" : "down"
                                }`}
                              ></i>
                            )}
                          </a>
                        </th>
                        <th scope="col" className="text-center">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => {
                        if (!payment) return null;
                        const statusInfo = getPaymentStatusLabel(
                          payment.payment_status
                        );

                        return (
                          <tr key={payment._id}>
                            <td>{payment.transaction_id || payment._id}</td>
                            <td>
                              {payment.order_id && payment.order_id._id ? (
                                <Link
                                  to={`/admin/order/${payment.order_id._id}`}
                                  style={{
                                    color: "#2563eb",
                                    fontWeight: 500,
                                  }}
                                >
                                  #
                                  {payment.order_id.order_number ||
                                    payment.order_id._id}
                                </Link>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td>
                              {payment.user_id &&
                              (payment.user_id.username ||
                                payment.user_id.email) ? (
                                <>
                                  <span style={{ fontWeight: 500 }}>
                                    {payment.user_id.username || "N/A"}
                                  </span>
                                  <br />
                                  <small style={{ color: "#64748b" }}>
                                    {payment.user_id.email || "N/A"}
                                  </small>
                                </>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td>
                              {getPaymentMethodLabel(payment.payment_method)}
                            </td>
                            <td
                              className="font-weight-bold"
                              style={{ color: "#0ea5e9", fontWeight: 700 }}
                            >
                              {formatCurrency(payment.amount)}
                            </td>
                            <td>
                              <span className={statusInfo.className}>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td>
                              {formatDate(
                                payment.payment_date || payment.createdAt
                              )}
                            </td>
                            <td className="text-center">
                              <Link
                                to={`/admin/payment/${payment._id}`}
                                className="btn btn-sm btn-info"
                                title="Xem chi tiết"
                              >
                                <i className="far fa-eye"></i>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {renderPagination()}
              </>
            )}
          </div>

          {error && (
            <div
              style={{
                color: "red",
                fontWeight: 600,
                marginTop: 24,
                fontSize: 18,
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
