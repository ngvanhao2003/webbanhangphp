import React, { useState, useEffect } from "react";
import Footer from "../footer/Footer";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "../../../axios";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrder(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải thông tin đơn hàng:", error);
        setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format thời gian
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem("adminToken");

      // Cập nhật trạng thái đơn hàng
      await axios.patch(
        `/api/orders/${id}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Nếu trạng thái là 'delivered', cập nhật luôn trạng thái thanh toán là 'paid'
      if (newStatus === "delivered") {
        await axios.patch(
          `/api/orders/${id}/payment`,
          { paymentStatus: "paid" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Cập nhật đồng thời status và paymentStatus trong state để UI cập nhật ngay
        setOrder((prevOrder) => ({
          ...prevOrder,
          status: newStatus,
          paymentStatus: "paid",
        }));
      } else {
        // Chỉ cập nhật status
        setOrder((prevOrder) => ({
          ...prevOrder,
          status: newStatus,
        }));
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      alert("Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // In đơn hàng
  const handlePrintOrder = () => {
    window.print();
  };

  // Lấy nhãn trạng thái đơn hàng
  const getOrderStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="badge bg-warning" style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}>
            Chờ xác nhận
          </span>
        );
      case "processing":
        return (
          <span className="badge bg-info" style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}>
            Đang xử lý
          </span>
        );
      case "shipped":
        return (
          <span className="badge bg-primary" style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}>
            Đang giao hàng
          </span>
        );
      case "delivered":
        return (
          <span className="badge bg-success" style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}>
            Đã giao hàng
          </span>
        );
      case "cancelled":
        return (
          <span className="badge bg-danger" style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}>
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary" style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}>
            Không xác định
          </span>
        );
    }
  };

  // Nhãn phương thức thanh toán
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
      default:
        return "Phương thức khác";
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
        <div className="container-xl">
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3">Đang tải thông tin đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
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
          <div className="alert alert-danger" role="alert" style={{ borderRadius: "12px", padding: "20px" }}>
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error || "Không tìm thấy đơn hàng này."}
            <div className="mt-3">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/admin/order")}
                style={{ borderRadius: "8px", padding: "10px 20px" }}
              >
                <i className="fas fa-arrow-left mr-2"></i> Quay lại danh sách đơn hàng
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Tính tạm tính và phí vận chuyển nếu không có từ backend
  const subtotal =
    order.items && Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      : 0;
  const shippingFee = typeof order.shippingFee === "number" ? order.shippingFee : 0;
  const discount = typeof order.discount === "number" ? order.discount : 0;

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
          style={{ fontWeight: 800, fontSize: 40, marginBottom: 24, letterSpacing: 1 }}
        >
          Chi tiết đơn hàng
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
            <span style={{ fontSize: 28, marginRight: 8 }}>🛒</span> Đơn hàng #{order.id}
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>Trạng thái: {getOrderStatusLabel(order.status)}</div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>Thời gian đặt hàng: {formatDate(order.created_at)}</div>
          <div style={{ fontSize: 13, marginTop: 12, opacity: 0.8 }}>
            Cập nhật lần cuối: {formatDate(order.updated_at || order.created_at)}
          </div>
        </div>

        <div className="dashboard-main-content mb-5">
          <div className="row">
            <div className="col-md-8">
              {/* Thông tin đơn hàng */}
              <div
                className="card"
                style={{ borderRadius: 18, boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)", marginBottom: 24, overflow: "hidden", border: "none" }}
              >
                <div
                  className="card-header"
                  style={{ background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)", color: "#fff", padding: "20px 24px", borderBottom: "none" }}
                >
                  <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>
                    <i className="fas fa-info-circle mr-2"></i> Thông tin đơn hàng
                  </h3>
                </div>
                <div className="card-body" style={{ padding: "24px" }}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Mã đơn hàng:</strong> #{order.id}
                    </div>
                    <div className="col-md-6">
                      <strong>Ngày đặt hàng:</strong> {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Phương thức thanh toán:</strong> {getPaymentMethodLabel(order.paymentMethod)}
                    </div>
                    <div className="col-md-6">
                      <strong>Trạng thái thanh toán:</strong>{" "}
                      <span
                        className={`badge ${order.paymentStatus === "paid" ? "bg-success" : "bg-warning"}`}
                        style={{ padding: "5px 10px", borderRadius: "6px", marginLeft: "8px", fontSize: "13px" }}
                      >
                        {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div
                className="card"
                style={{ borderRadius: 18, boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)", marginBottom: 24, overflow: "hidden", border: "none" }}
              >
                <div
                  className="card-header"
                  style={{ background: "linear-gradient(90deg, #f7971e 0%, #ffd200 100%)", color: "#fff", padding: "20px 24px", borderBottom: "none" }}
                >
                  <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>
                    <i className="fas fa-shopping-cart mr-2"></i> Sản phẩm đã đặt
                  </h3>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0" style={{ fontSize: "15px" }}>
                      <thead style={{ background: "#f8f9fa" }}>
                        <tr>
                          <th style={{ padding: "16px", width: "10px" }}>#</th>
                          <th style={{ padding: "16px" }}>Sản phẩm</th>
                          <th style={{ padding: "16px" }}>Kích thước</th>
                          <th style={{ padding: "16px", width: "100px", textAlign: "center" }}>Số lượng</th>
                          <th style={{ padding: "16px", width: "150px", textAlign: "right" }}>Đơn giá</th>
                          <th style={{ padding: "16px", width: "150px", textAlign: "right" }}>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items &&
                          order.items.map((item, index) => (
                            <tr key={item.id || index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                              <td style={{ padding: "16px" }}>{index + 1}</td>
                              <td style={{ padding: "16px" }}>
                                <div className="d-flex align-items-center">
                                  {item.product_image && (
                                    <img
                                      src={item.product_image}
                                      alt={item.name}
                                      style={{
                                        width: 60,
                                        height: 60,
                                        objectFit: "cover",
                                        borderRadius: 10,
                                        marginRight: 16,
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                      }}
                                    />
                                  )}
                                  <div>
                                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                                    {item.options && (
                                      <div style={{ fontSize: "14px", color: "#666" }}>Tùy chọn: {item.options}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "16px" }}>
                                {/* Hiển thị đúng size đã đặt từ backend */}
                                <span
                                  style={{
                                    display: "inline-block",
                                    background: "#f1f5f9",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                  }}
                                >
                                  {item.size}
                                </span>
                              </td>
                              <td style={{ padding: "16px", textAlign: "center" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    background: "#f1f5f9",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                  }}
                                >
                                  {item.quantity}
                                </span>
                              </td>
                              <td style={{ padding: "16px", textAlign: "right" }}>{formatCurrency(item.price)}</td>
                              <td style={{ padding: "16px", textAlign: "right", fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot style={{ background: "#f8fafc" }}>
                        <tr>
                          <td colSpan="4" style={{ textAlign: "right", padding: "16px" }}>
                            <strong style={{ fontSize: "18px" }}>Tổng cộng:</strong>
                          </td>
                          <td style={{ textAlign: "right", padding: "16px", fontWeight: 700, fontSize: "18px", color: "#f43f5e" }}>
                            {formatCurrency(order.totalAmount || subtotal + shippingFee - discount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              {/* Thông tin khách hàng */}
              <div
                className="card"
                style={{ borderRadius: 18, boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)", marginBottom: 24, overflow: "hidden", border: "none" }}
              >
                <div
                  className="card-header"
                  style={{ background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)", color: "#fff", padding: "20px 24px", borderBottom: "none" }}
                >
                  <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>
                    <i className="fas fa-user mr-2"></i> Thông tin khách hàng
                  </h3>
                </div>
                <div className="card-body" style={{ padding: "24px" }}>
                  <div className="customer-info">
                    <div className="mb-3 d-flex align-items-center">
                      <i className="fas fa-user-circle mr-2" style={{ fontSize: "24px", color: "#667eea", marginRight: "12px" }}></i>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "16px" }}>{order.customer?.name || "Không có thông tin"}</div>
                        <div style={{ color: "#666", fontSize: "14px" }}>{order.customer?.id ? "Thành viên" : "Khách vãng lai"}</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div style={{ display: "flex", marginBottom: "12px" }}>
                        <i className="fas fa-envelope" style={{ width: "20px", color: "#667eea", marginRight: "12px" }}></i>
                        <div style={{ flex: 1 }}>{order.customer?.email || "Không có thông tin"}</div>
                      </div>
                      <div style={{ display: "flex", marginBottom: "12px" }}>
                        <i className="fas fa-phone" style={{ width: "20px", color: "#667eea", marginRight: "12px" }}></i>
                        <div style={{ flex: 1 }}>{order.customer?.phone || "Không có thông tin"}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-start" }}>
                        <i className="fas fa-map-marker-alt" style={{ width: "20px", color: "#667eea", marginRight: "12px", marginTop: "3px" }}></i>
                        <div style={{ flex: 1 }}>{order.customer?.address || "Không có thông tin"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thao tác đơn hàng */}
              <div
                className="card"
                style={{ borderRadius: 18, boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)", overflow: "hidden", border: "none", height: "500px" }}
              >
                <div
                  className="card-header"
                  style={{ background: "linear-gradient(90deg, #f953c6 0%, #b91d73 100%)", color: "#fff", padding: "20px 24px", borderBottom: "none" }}
                >
                  <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>
                    <i className="fas fa-cogs mr-2"></i> Thao tác
                  </h3>
                </div>
                <div className="card-body" style={{ padding: "24px" }}>
                  <div className="d-grid gap-3">
                    <Link
                      to="/admin/order"
                      className="btn btn-light btn-lg w-100"
                      style={{ borderRadius: "12px", padding: "12px", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #eee" }}
                    >
                      <i className="fas fa-arrow-left mr-2"></i> Quay lại danh sách đơn hàng
                    </Link>

                    {/* Ẩn nút in đơn hàng nếu trạng thái là "pending" */}
                    {order.status !== "pending" && (
                      <button
                        className="btn btn-info btn-lg w-100"
                        onClick={handlePrintOrder}
                        style={{
                          borderRadius: "12px",
                          padding: "12px",
                          fontWeight: 600,
                          background: "linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%)",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(14, 165, 233, 0.24)",
                        }}
                      >
                        <i className="fas fa-print mr-2"></i> In đơn hàng
                      </button>
                    )}

                    <div className="dropdown w-100">
                      <button
                        className="btn btn-primary btn-lg dropdown-toggle w-100"
                        type="button"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{
                          borderRadius: "12px",
                          padding: "12px",
                          fontWeight: 600,
                          background: "linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(139, 92, 246, 0.24)",
                        }}
                      >
                        <i className="fas fa-exchange-alt mr-2"></i> Cập nhật trạng thái
                      </button>
                      <ul
                        className="dropdown-menu w-100"
                        aria-labelledby="dropdownMenuButton"
                        style={{ borderRadius: "12px", padding: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", position: "absolute" }}
                      >
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleUpdateStatus("pending")}
                            disabled={order.status === "pending" || updatingStatus}
                            style={{ padding: "5px 16px", borderRadius: "8px" }}
                          >
                            <i className="fas fa-clock mr-2" style={{ color: "#f59e0b" }}></i> Chờ xác nhận
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleUpdateStatus("processing")}
                            disabled={order.status === "processing" || updatingStatus}
                            style={{ padding: "5px 16px", borderRadius: "8px" }}
                          >
                            <i className="fas fa-cog mr-2" style={{ color: "#3b82f6" }}></i> Đang xử lý
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleUpdateStatus("shipped")}
                            disabled={order.status === "shipped" || updatingStatus}
                            style={{ padding: "5px 16px", borderRadius: "8px" }}
                          >
                            <i className="fas fa-truck mr-2" style={{ color: "#6366f1" }}></i> Đang giao hàng
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => handleUpdateStatus("delivered")}
                            disabled={order.status === "delivered" || updatingStatus}
                            style={{ padding: "5px 16px", borderRadius: "8px" }}
                          >
                            <i className="fas fa-check-circle mr-2" style={{ color: "#10b981" }}></i> Đã giao hàng
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => handleUpdateStatus("cancelled")}
                            disabled={order.status === "cancelled" || updatingStatus}
                            style={{ padding: "5px 16px", borderRadius: "8px" }}
                          >
                            <i className="fas fa-times-circle mr-2"></i> Hủy đơn hàng
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
