import React, { useEffect, useState } from "react";
import axios from "../../../axios";
import Footer from "../footer/Footer";
import { Link } from "react-router-dom";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Thêm state cho lọc ngày
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  // Thêm state cho lọc trạng thái
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/orders");
        const ordersData = response.data || [];
        setOrders(ordersData);

        // Thống kê đơn hàng
        const totalOrders = ordersData.length;
        const pendingOrders = ordersData.filter(
          (order) => order.status === "pending" || order.status === "waiting"
        ).length;
        const processingOrders = ordersData.filter(
          (order) =>
            order.status === "processing" ||
            order.status === "in_progress" ||
            order.status === "shipped" ||
            order.status === "delivery"
        ).length;
        const completedOrders = ordersData.filter(
          (order) =>
            order.status === "completed" || order.status === "delivered"
        ).length;
        const cancelledOrders = ordersData.filter(
          (order) => order.status === "cancelled" || order.status === "canceled"
        ).length;

        // Tính tổng doanh thu đúng theo trường totalAmount
        const totalRevenue = ordersData
          .filter(
            (order) =>
              order.status === "completed" || order.status === "delivered"
          )
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        setStats({
          totalOrders,
          pendingOrders,
          processingOrders,
          completedOrders,
          cancelledOrders,
          totalRevenue,
        });
      } catch (err) {
        console.error("Lỗi khi gọi API /api/orders:", err);
        setError("Không thể tải danh sách đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    if (!amount) return "0 ₫";
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Lọc đơn hàng theo ngày và trạng thái
  const filteredOrders = orders.filter((order) => {
    // Lọc theo ngày
    if (!order.created_at) return true;
    const orderDate = new Date(order.created_at);
    let isAfterStart = true;
    let isBeforeEnd = true;
    if (filterStartDate) {
      isAfterStart = orderDate >= new Date(filterStartDate);
    }
    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      isBeforeEnd = orderDate <= endDate;
    }
    // Lọc theo trạng thái
    let isStatusMatch = true;
    if (filterStatus) {
      // Gom nhóm các trạng thái tương đương
      const statusMap = {
        pending: ["pending", "waiting"],
        processing: ["processing", "in_progress", "shipped", "delivery"],
        completed: ["completed", "delivered"],
        cancelled: ["cancelled", "canceled"],
      };
      let validStatuses = [];
      if (statusMap[filterStatus]) {
        validStatuses = statusMap[filterStatus];
      } else {
        validStatuses = [filterStatus];
      }
      isStatusMatch = validStatuses.includes(order.status);
    }
    return isAfterStart && isBeforeEnd && isStatusMatch;
  });

  // Tính phân trang dựa trên filteredOrders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Khi thay đổi filter, reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStartDate, filterEndDate, filterStatus]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
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
          Quản lý đơn hàng
        </h1>

        {/* Thống kê */}
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
            <span style={{ fontSize: 28, marginRight: 8 }}>🛍️</span> Tổng quan đơn hàng
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Theo dõi và quản lý đơn hàng của khách hàng
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý đơn hàng trong hệ thống. Bạn có thể xem thông tin chi tiết, cập nhật trạng thái và quản lý đơn hàng từ đây.
          </div>
          <div style={{ fontSize: 13, marginTop: 12, opacity: 0.8 }}>
            Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
          </div>
        </div>

        {/* Thống kê ngắn */}
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
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="cart">
                🛒
              </span>{" "}
              {stats.totalOrders}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng đơn hàng</div>
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
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="money">
                💰
              </span>{" "}
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng doanh thu</div>
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
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="pending">
                ⏳
              </span>{" "}
              {stats.pendingOrders}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Đơn hàng chờ xử lý</div>
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
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="completed">
                ✅
              </span>{" "}
              {stats.completedOrders}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Đơn hàng hoàn thành</div>
          </div>
        </div>

        {/* Bộ lọc ngày & trạng thái */}
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontWeight: 600 }}>Lọc theo ngày đặt:</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 15,
            }}
          />
          <span style={{ fontWeight: 500 }}>đến</span>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 15,
            }}
          />
          {/* Bộ lọc trạng thái */}
          <label style={{ fontWeight: 600, marginLeft: 16 }}>Trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 15,
              minWidth: 140,
            }}
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          {(filterStartDate || filterEndDate || filterStatus) && (
            <button
              className="btn btn-sm btn-outline-secondary"
              style={{ marginLeft: 8, borderRadius: 8 }}
              onClick={() => {
                setFilterStartDate("");
                setFilterEndDate("");
                setFilterStatus("");
              }}
            >
              Xóa lọc
            </button>
          )}
        </div>

        {/* Danh sách đơn hàng */}
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
                Đang tải dữ liệu đơn hàng...
              </p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" style={{ fontSize: 18, fontWeight: 600 }}>
              {error}
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>Danh sách đơn hàng</h3>
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
                      <th className="text-center" style={{ width: "50px" }}>
                        #
                      </th>
                      <th>Khách hàng</th>
                      <th>Liên hệ</th>
                      <th>Ngày đặt</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5" style={{ fontSize: 18, color: "#64748b", fontWeight: 500 }}>
                          Không có đơn hàng nào
                          <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                            Đơn hàng mới sẽ xuất hiện ở đây
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // PHÂN TRANG CLIENT-SIDE 10 đơn hàng/trang
                      currentOrders.map((order, idx) => {
                          // Xác định class trạng thái và text hiển thị
                          let statusClass = "badge bg-secondary";
                          let statusText = order.status || "N/A";

                          if (["pending", "waiting"].includes(order.status)) {
                            statusClass = "badge bg-warning";
                            statusText = "Chờ xác nhận";
                          } else if (
                            ["processing", "in_progress", "shipped"].includes(order.status)
                          ) {
                            statusClass = "badge bg-info";
                            statusText = "Đang xử lý";
                          } else if (
                            ["completed", "delivered"].includes(order.status)
                          ) {
                            statusClass = "badge bg-success";
                            statusText = "Hoàn thành";
                          } else if (
                            ["cancelled", "canceled"].includes(order.status)
                          ) {
                            statusClass = "badge bg-danger";
                            statusText = "Đã hủy";
                          }

                          return (
                            <tr key={order._id || order.id} style={{ fontSize: 14 }}>
                              <td className="text-center">{indexOfFirstOrder + idx + 1}</td>
                              <td style={{ fontWeight: 600 }}>
                                {order.customer_name || order.customer?.name || "N/A"}
                              </td>
                              <td>
                                <div>{order.customer_phone || order.customer?.phone || "N/A"}</div>
                                <div style={{ fontSize: 13, color: "#64748b" }}>
                                  {order.customer_email || order.customer?.email || "N/A"}
                                </div>
                              </td>
                              <td>
                                {order.created_at
                                  ? new Date(order.created_at).toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </td>
                              <td>
                                <span className={statusClass} style={{ padding: "6px 12px", borderRadius: 20 }}>
                                  {statusText}
                                </span>
                              </td>
                              <td style={{ fontWeight: 700, color: "#0ea5e9" }}>
                                {order.totalAmount && order.totalAmount > 0
                                  ? formatCurrency(order.totalAmount)
                                  : "Chưa có thông tin"}
                              </td>
                              <td className="text-center">
                                <Link
                                  to={`/admin/order/${order._id || order.id}`}
                                  className="btn btn-sm btn-info mr-1"
                                  style={{
                                    borderRadius: 8,
                                    padding: "6px 12px",
                                    background: "linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%)",
                                    border: "none",
                                  }}
                                >
                                  <i className="far fa-eye mr-1"></i> Chi tiết
                                </Link>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>

              {/* PHÂN TRANG */}
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul
                    className="pagination"
                    style={{
                      borderRadius: 999,
                      background: "#f1f5fa",
                      boxShadow: "0 1px 6px rgba(60,72,100,0.06)",
                      padding: "8px 18px",
                    }}
                  >
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        style={{ border: "none", borderRadius: 999, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-angle-left"></i>
                      </button>
                    </li>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i + 1)}
                          style={{
                            background: currentPage === i + 1 ? "linear-gradient(90deg,#818cf8,#38bdf8)" : "none",
                            border: "none",
                            borderRadius: 999,
                            cursor: "pointer",
                          }}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        style={{ border: "none", borderRadius: 999, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                        disabled={currentPage === totalPages}
                      >
                        <i className="fas fa-angle-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
