import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../pages/header/Header";
import Footer from "../../pages/footer/Footer";

function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/orders/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Không thể lấy chi tiết đơn hàng.");
        const data = await response.json();
        let orderData = data.order || data;

        // Nếu mỗi item chỉ có productId, cần fetch thêm thông tin sản phẩm
        if (orderData.items && orderData.items.length > 0) {
          const itemsWithProduct = await Promise.all(
            orderData.items.map(async (item) => {
              // Nếu đã có item.product.image thì không cần fetch nữa
              if (item.product && item.product.image) return item;
              // Lấy productId đúng nhất
              let productId = null;
              if (typeof item.product === "string") {
                productId = item.product;
              } else if (item.product?._id) {
                productId = item.product._id;
              } else if (item.product?.id) {
                productId = item.product.id;
              } else if (item.productId) {
                productId = item.productId;
              } else if (item.id && !item.image) {
                productId = item.id;
              }
              if (!productId) return item;
              try {
                const res = await fetch(`/api/products/${productId}`);
                if (!res.ok) return item;
                const productData = await res.json();
                // Lấy đúng ảnh từ bảng product
                return {
                  ...item,
                  product: productData.product || productData,
                  image: (productData.product || productData).image // truyền image từ bảng product vào item.image
                };
              } catch {
                return item;
              }
            })
          );
          orderData.items = itemsWithProduct;
        }

        setOrder(orderData);
      } catch (err) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const formatCurrencyVND = (amount) =>
    amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "";

  const getPaymentMethod = (method) => {
    switch (method) {
      case "cash":
        return "Thanh toán khi nhận hàng";
      case "credit_card":
        return "Thẻ tín dụng";
      case "momo":
        return "Ví Momo";
      case "vnpay":
        return "Ví VNPAY";
      case "bank_transfer":
        return "Chuyển khoản ngân hàng";
      default:
        return "Không xác định";
    }
  };

  if (loading) return <p>Đang tải chi tiết đơn hàng...</p>;
  if (!order) return <p style={{ color: "red" }}>Không tìm thấy đơn hàng.</p>;

  return (
    <>
      <Header />
      <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial, sans-serif", padding: "0 15px", color: "#333" }}>
        <h2>Chi tiết đơn hàng #{order._id || order.id}</h2>

        {/* Địa chỉ nhận hàng */}
        <div style={{ borderBottom: "1px solid #ddd", paddingBottom: 12, marginBottom: 20, fontSize: 14 }}>
          <div style={{ fontWeight: "700", color: "#3cb371", marginBottom: 8 }}>
            <span role="img" aria-label="location">📍</span> Địa Chỉ Nhận Hàng
          </div>
          <div><strong>Người nhận: </strong> {order.customer?.name || ""}</div>
          <div><strong>Số điện thoại: </strong> {order.customer?.phone || ""}</div>
          <div><strong>Địa chỉ: </strong> {order.customer?.address || ""}</div>
        </div>

        {/* Bảng sản phẩm */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #000", fontWeight: "600" }}>
              <th style={{ textAlign: "left", paddingBottom: 8 }}>Sản phẩm</th>
              <th style={{ textAlign: "right", paddingBottom: 8 }}>Giá</th>
              <th style={{ textAlign: "center", paddingBottom: 8, width: 80 }}>Số lượng</th>
              <th style={{ textAlign: "center", paddingBottom: 8, width: 80 }}>Size</th>
              <th style={{ textAlign: "right", paddingBottom: 8, width: 120 }}>Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
                  <img
                    src={
                      // Ưu tiên lấy ảnh từ item.product.image, nếu không có thì lấy item.image
                      (item.product && item.product.image)
                        ? item.product.image
                        : (item.image || "")
                    }
                    alt={item.product?.name || item.name}
                    style={{ width: 80, height: 60, objectFit: "cover" }}
                  />
                  <div>{item.product?.name || item.name}</div>
                </td>
                <td style={{ textAlign: "right", paddingRight: 10 }}>{formatCurrencyVND(item.price)}</td>
                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                <td style={{ textAlign: "center" }}>{item.size || ""}</td>
                <td style={{ textAlign: "right", paddingRight: 10, color: "#4caf50", fontWeight: "600" }}>{formatCurrencyVND(item.price * item.quantity)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={4} style={{ textAlign: "right", fontWeight: "600", paddingTop: 10 }}>Tổng</td>
              <td style={{ textAlign: "right", paddingRight: 10, fontWeight: "700" }}>
                {formatCurrencyVND(order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0))}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Thông tin phí, giảm giá, tổng */}
        {/* <div style={{ marginTop: 20, fontWeight: "600", fontSize: 16, display: "flex", justifyContent: "space-between", maxWidth: 400 }}>
          <div>Phí vận chuyển:</div>
          <div>{formatCurrencyVND(order.shippingFee || 0)}</div>
        </div>
        <div style={{ marginTop: 5, fontWeight: "600", fontSize: 16, display: "flex", justifyContent: "space-between", maxWidth: 400 }}>
          <div>Giảm giá:</div>
          <div>- {formatCurrencyVND(order.discount || 0)}</div>
        </div> */}
        <div style={{ marginTop: 15, fontWeight: "700", fontSize: 20, color: "#4caf50", display: "flex", justifyContent: "space-between", maxWidth: 400 }}>
          <div>Tổng thanh toán:</div>
          <div>{formatCurrencyVND(order.totalAmount)}</div>
        </div>

        {/* Phương thức thanh toán */}
        <div style={{ marginTop: 30, fontWeight: "600", fontSize: 16 }}>
          <span>Phương thức thanh toán: </span>
          <span style={{ color: "#1976d2" }}>{getPaymentMethod(order.paymentMethod)}</span>
        </div>
        {/* Ghi chú */}
        {order.notes && (
          <div style={{ marginTop: 10, fontSize: 15 }}>
            <strong>Ghi chú: </strong>{order.notes}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default OrderDetail;
