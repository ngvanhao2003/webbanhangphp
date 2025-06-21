import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../pages/header/Header";
import Footer from "../../pages/footer/Footer";
import "./Orders.css";

function Orders() {
  const { userId } = useParams(); // Lấy userId từ URL
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để xem đơn hàng.");
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/orders/user/${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy thông tin đơn hàng.");
        }

        const data = await response.json();
        console.log("Dữ liệu trả về từ API:", data);

        // Kiểm tra xem data.orders có phải là mảng không
        if (Array.isArray(data.orders)) {
          // Sắp xếp theo ngày tạo, mới nhất trên cùng (dùng đúng trường created_at)
          const sortedOrders = [...data.orders].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setOrders(sortedOrders);  // Cập nhật danh sách đơn hàng đã sắp xếp
          setCurrentPage(1); // Reset về trang đầu khi load lại
        } else {
          setError("Dữ liệu trả về không hợp lệ.");
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu.");
        setLoading(false);
      }
    };
    fetchOrders();
  }, [userId]); // fetch lại mỗi khi userId thay đổi

  const getPaymentStatus = (paymentStatus) => {
    switch (paymentStatus) {
      case "pending":
        return "Chưa thanh toán";
      case "paid":
        return "Đã thanh toán";
      case "failed":
        return "Thanh toán thất bại";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };

  const getPaymentMethod = (paymentMethod) => {
    switch (paymentMethod) {
      case "cash":
        return "Thanh toán khi nhận hàng";
      case "credit_card":
        return "Thẻ tín dụng";
      case "momo":
        return "Ví Momo";
      case "vnpay":
        return "Ví VNPAY";
      default:
        return "Không xác định";
    }
  };

  const getOrderStatus = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      const token = localStorage.getItem("token");
      // Nếu backend không có endpoint /cancel, thử PATCH/PUT vào /api/orders/:orderId với body status: "cancelled"
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT", // hoặc PATCH nếu backend yêu cầu
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Không thể hủy đơn hàng.");
      }
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          (order._id === orderId || order.id === orderId)
            ? { ...order, status: "cancelled" }
            : order
        )
      );
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi hủy đơn hàng.");
    }
  };

  // Tính toán phân trang
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  if (loading) return <p>Đang tải thông tin đơn hàng...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
      <Header />
      <section style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Lịch sử mua hàng</h2>

        {orders.length === 0 ? (
          <p>Không có đơn hàng nào.</p>
        ) : (
          <>
            <div className="order-list">
              {paginatedOrders.map((order) => (
                <div className="order-item" key={order._id || order.id}>
                  <div className="order-info">
                    <h3 className="store-name">{order.customer.name}</h3>
                    <div className="product-name">Địa chỉ: {order.customer.address}</div>
                    <div className="product-name">Số điện thoại: {order.customer.phone}</div>

                    {/* {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index}>
                          <div className="product-name">{item.product.name}</div>
                          <div className="product-price">{item.product.price}₫</div>
                          <div className="product-image">
                            <img src={item.product.image} alt={item.product.name} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="product-name">Không có sản phẩm trong đơn hàng</div>
                    )} */}

                    <div className="order-price">
                      <span className="total-amount">Tổng tiền: {order.totalAmount}₫</span>
                    </div>
                    <div className="order-status">
                      Trạng thái: {getOrderStatus(order.status)}
                    </div>
                    <div className="payment-status">
                      Thanh toán: {getPaymentStatus(order.paymentStatus)}
                    </div>
                    <div className="payment-method">
                      Phương thức thanh toán: {getPaymentMethod(order.paymentMethod)}
                    </div>
                  </div>
                  <div className="actions">
                    {order.status === "pending" && (
                      <button
                        className="action-btn"
                        style={{
                          backgroundColor: "red",    // Màu nền đỏ
                          color: "white",            // Màu chữ trắng
                          border: "none",            // Bỏ viền
                          padding: "10px 20px",      // Khoảng cách trong nút
                          fontSize: "1rem",          // Kích thước chữ
                          cursor: "pointer",        // Con trỏ chuột khi hover
                          borderRadius: "4px",      // Bo tròn góc
                          transition: "background-color 0.3s",  // Hiệu ứng chuyển màu nền khi hover
                        }}
                        onClick={() => handleCancelOrder(order._id || order.id)}
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                    <Link
                      to={`/chitiet/${order._id || order.id}`}
                      className="action-btn review-btn"
                      style={{ textDecoration: "none" }}
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {/* Phân trang */}
            <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8 }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 14px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  background: currentPage === 1 ? "#eee" : "#fff",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer"
                }}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    background: currentPage === idx + 1 ? "#4caf50" : "#fff",
                    color: currentPage === idx + 1 ? "#fff" : "#333",
                    fontWeight: currentPage === idx + 1 ? "bold" : "normal",
                    cursor: "pointer"
                  }}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 14px",
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  background: currentPage === totalPages ? "#eee" : "#fff",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                }}
              >
                &gt;
              </button>
            </div>
          </>
        )}
      </section>
      <Footer />
    </>
  );
}

export default Orders;
