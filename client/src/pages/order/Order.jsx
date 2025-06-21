import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom"; // Thêm useNavigate
import Header from "../../pages/header/Header";
import Footer from "../../pages/footer/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Order() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate(); // Thêm dòng này

  const {
    cartItems = [],
    shippingFee = 0,
    discount = 0,
    couponCode = "", // đổi từ voucherCode thành couponCode
  } = location.state || {};

  const [userProfile, setUserProfile] = useState(null);
  const [receiverName, setReceiverName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(""); // "cod", "online", "momo"
  const [showOnlineOptions, setShowOnlineOptions] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    let userId = null;
    if (userJson) {
      const userData = JSON.parse(userJson);
      userId = userData.id;
    }
    if (!userId) return;

    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success !== false) {
          const user = data.user || data;
          setUserProfile(user);
          setReceiverName(user.full_name || user.name || "");
          setDeliveryPhone(user.phone || "");
          setDeliveryAddress(user.address || "");
        }
      })
      .catch(() => {
        if (userJson) {
          const userData = JSON.parse(userJson);
          setUserProfile(userData);
          setReceiverName(userData.full_name || userData.name || "");
          setDeliveryPhone(userData.phone || "");
          setDeliveryAddress(userData.address || "");
        }
      });
  }, []);

  const formatCurrencyVND = (amount) =>
    amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "";

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalAmount = totalPrice + shippingFee - discount;

  const handleNewAddressSubmit = (e) => {
    e.preventDefault();
    if (!receiverName.trim() || !deliveryPhone.trim() || !deliveryAddress.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }
    const userJson = localStorage.getItem("user");
    if (userJson) {
      const userData = JSON.parse(userJson);
      let changed = false;
      if (
        userData.full_name !== receiverName ||
        userData.phone !== deliveryPhone ||
        userData.address !== deliveryAddress
      ) {
        userData.full_name = receiverName;
        userData.phone = deliveryPhone;
        userData.address = deliveryAddress;
        localStorage.setItem("user", JSON.stringify(userData));
        changed = true;
      }
      if (changed) setUserProfile(userData);
    }
    setShowNewAddressForm(false);
  };

  // Đảm bảo đồng bộ với backend: cash, credit_card, bank_transfer, vnpay, momo, zalopay, paypal, other
  const mapPaymentMethod = (method) => {
    switch (method) {
      case "cod":
        return "cash";
      case "momo":
        return "momo";
      case "online":
        return "credit_card";
      default:
        return "cash";
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    const updatedCartItems = cartItems.map(item => {
      if (!item.selectedSize) {
        item.selectedSize = 'M';
        alert(`Sản phẩm ${item.name} không có kích cỡ, mặc định chọn M.`);
      }
      if (!item.name) {
        item.name = item.product?.name || "";
      }
      return item;
    });

    const orderData = {
      customer: {
        name: receiverName,
        phone: deliveryPhone,
        email: userProfile?.email || "",
        address: deliveryAddress,
      },
      items: updatedCartItems.map(item => ({
        product: item.id,
        quantity: item.quantity,
        price: item.discountPrice !== undefined ? item.discountPrice : item.price,
        size: item.selectedSize,
        name: item.name,
      })),
      shippingFee: shippingFee,
      paymentMethod: mapPaymentMethod(paymentMethod),
      notes: note,
      totalAmount: updatedCartItems.reduce(
        (sum, item) =>
          sum + (item.discountPrice !== undefined ? item.discountPrice : item.price) * item.quantity,
        0
      ) + shippingFee - discount,
    };

    // Debug giá trị paymentMethod gửi lên backend
    // console.log("paymentMethod gửi lên:", orderData.paymentMethod);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errData = await response.json();
        toast.error("Lỗi tạo đơn hàng: " + (errData.error || "Lỗi không xác định"));
        setLoading(false);
        return;
      }

      const createdOrder = await response.json();

      if (paymentMethod === 'momo') {
        // Reset cart before redirecting to MoMo
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("storage"));

        const momoResponse = await fetch(`/payment/momo/${createdOrder.id}`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: orderData.totalAmount
          })
        });

        const momoData = await momoResponse.json();
        if (momoData.success && (momoData.data?.payUrl || momoData.payUrl)) {
          window.location.href = momoData.data?.payUrl || momoData.payUrl;
          return;
        } else {
          toast.error('Lỗi tạo URL thanh toán MoMo: ' + (momoData.message || 'Không lấy được URL thanh toán'));
          setLoading(false);
          return;
        }
      }

      toast.success("Đặt hàng thành công! Mã đơn: " + createdOrder.id);
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("storage"));
      setLoading(false);

      // Chờ 2 giây rồi chuyển về trang chủ
      if (paymentMethod === "cod") {
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      toast.error("Lỗi kết nối server");
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ maxWidth: 900, margin: "40px auto", fontFamily: "Arial, sans-serif", padding: "0 15px", color: "#333" }}>
        <h2>Thanh toán đơn hàng (User ID: {id})</h2>

        {/* Địa chỉ nhận hàng */}
        <div style={{ borderBottom: "1px solid #ddd", paddingBottom: 12, marginBottom: 20, fontSize: 14 }}>
          <div style={{ fontWeight: "700", color: "#3cb371", marginBottom: 8 }}>
            <span role="img" aria-label="location">📍</span> Địa Chỉ Nhận Hàng
          </div>
          {!showNewAddressForm ? (
            <>
              <div><strong>Người nhận: </strong> {receiverName || "Chưa có tên"}</div>
              <div><strong>Số điện thoại: </strong> {deliveryPhone || "Chưa có số điện thoại"}</div>
              <div><strong>Địa chỉ: </strong> {deliveryAddress || "Chưa có địa chỉ"}</div>
              <button
                onClick={() => setShowNewAddressForm(true)}
                style={{ marginTop: 8, padding: "6px 12px", backgroundColor: "#0b5ed7", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
              >
                Thêm/chỉnh sửa địa chỉ mới
              </button>
            </>
          ) : (
            <form onSubmit={handleNewAddressSubmit} style={{ marginTop: 10 }}>
              <div style={{ marginBottom: 8 }}>
                <label>
                  Người nhận: <br />
                  <input type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)} required
                    style={{ width: "100%", padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ccc" }} />
                </label>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>
                  Số điện thoại nhận hàng: <br />
                  <input type="tel" value={deliveryPhone} onChange={e => setDeliveryPhone(e.target.value)} required
                    style={{ width: "100%", padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ccc" }} />
                </label>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label>
                  Địa chỉ nhận hàng: <br />
                  <textarea rows={3} value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} required
                    style={{ width: "100%", padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ccc" }} />
                </label>
              </div>
              <button type="submit" style={{ padding: "6px 12px", backgroundColor: "#4caf50", color: "white", border: "none", borderRadius: 4, cursor: "pointer", marginRight: 8 }}>
                Lưu địa chỉ
              </button>
              <button type="button" onClick={() => setShowNewAddressForm(false)}
                style={{ padding: "6px 12px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
                Hủy
              </button>
            </form>
          )}
        </div>

        {/* Bảng sản phẩm */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #000", fontWeight: "600" }}>
              <th style={{ textAlign: "left", paddingBottom: 8 }}>Sản phẩm</th>
              <th style={{ textAlign: "right", paddingBottom: 8 }}>Giá</th>
              <th style={{ textAlign: "center", paddingBottom: 8, width: 80 }}>Số lượng</th>
              <th style={{ textAlign: "right", paddingBottom: 8, width: 120 }}>Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map(item => (
              <tr key={`${item.id}-${item.selectedSize}`} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
                  <img src={item.image} alt={item.name} style={{ width: 80, height: 60, objectFit: "cover" }} />
                  <div>{item.name} - {item.selectedSize}</div>
                </td>
                <td style={{ textAlign: "right", paddingRight: 10 }}>{formatCurrencyVND(item.price)}</td>
                <td style={{ textAlign: "center" }}>{item.quantity}</td>
                <td style={{ textAlign: "right", paddingRight: 10, color: "#4caf50", fontWeight: "600" }}>{formatCurrencyVND(item.price * item.quantity)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ textAlign: "right", fontWeight: "600", paddingTop: 10 }}>Tổng</td>
              <td style={{ textAlign: "right", paddingRight: 10, fontWeight: "700" }}>{formatCurrencyVND(totalPrice)}</td>
            </tr>
          </tbody>
        </table>

        {/* Thông tin phí, giảm giá, tổng */}
        <div style={{ marginTop: 20, fontWeight: "600", fontSize: 16, display: "flex", justifyContent: "space-between", maxWidth: 400 }}>
          <div>Phí vận chuyển:</div>
          <div>{formatCurrencyVND(shippingFee)}</div>
        </div>
        <div style={{ marginTop: 5, fontWeight: "600", fontSize: 16, display: "flex", justifyContent: "space-between", maxWidth: 400 }}>
          <div>Giảm giá:</div>
          <div>
            - {formatCurrencyVND(discount)}
            {couponCode && (
              <span style={{ color: "#0B3B80", fontWeight: 400, marginLeft: 8 }}>
                ({couponCode})
              </span>
            )}
          </div>
        </div>
        <div style={{ marginTop: 15, fontWeight: "700", fontSize: 20, color: "#4caf50", display: "flex", justifyContent: "space-between", maxWidth: 400 }}>
          <div>Tổng thanh toán:</div>
          <div>{formatCurrencyVND(totalAmount)}</div>
        </div>

        {/* Lời nhắn */}
        <div style={{ marginTop: 20 }}>
          <input type="text" placeholder="Lưu ý cho Người bán..." value={note} onChange={e => setNote(e.target.value)} style={{ width: "100%", padding: 8, fontSize: 14, borderRadius: 4, border: "1px solid #ccc" }} />
        </div>

        {/* Phương thức thanh toán */}
        <div style={{ marginTop: 40, padding: 20, backgroundColor: "#f8f8f8", borderTop: "1px solid #ddd", maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ marginBottom: 16, fontWeight: "700" }}>Phương Thức Thanh Toán</div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <button
              type="button"
              style={paymentMethod === "cod"
                ? { border: "1px solid #4caf50", color: "#4caf50", backgroundColor: "#e8f5e9", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }
                : { border: "1px solid #999", color: "#333", backgroundColor: "white", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
              onClick={() => {
                setPaymentMethod("cod");
                setShowOnlineOptions(false);
              }}
            >
              Thanh toán khi nhận hàng
            </button>

            <button
              type="button"
              style={paymentMethod === "online"
                ? { border: "1px solid #4caf50", color: "#4caf50", backgroundColor: "#e8f5e9", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }
                : { border: "1px solid #999", color: "#333", backgroundColor: "white", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
              onClick={() => {
                setPaymentMethod("online");
                setShowOnlineOptions(true);
              }}
            >
              Thanh toán Online
            </button>

            {showOnlineOptions && (
              <button
                type="button"
                style={paymentMethod === "momo"
                  ? { border: "1px solid #4caf50", color: "#4caf50", backgroundColor: "#e8f5e9", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }
                  : { border: "1px solid #999", color: "#333", backgroundColor: "white", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
                onClick={() => setPaymentMethod("momo")}
              >
                Thanh toán MoMo
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={loading}
            style={{
              backgroundColor: loading ? "#a5d6a7" : "#4caf50",
              color: "white",
              padding: "12px 40px",
              border: "none",
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "700",
              fontSize: 16
            }}
          >
            {loading ? "Đang xử lý..." : "ĐẶT HÀNG"}
          </button>
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default Order;