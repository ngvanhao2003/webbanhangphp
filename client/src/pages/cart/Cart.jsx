import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../pages/header/Header";
import Footer from "../../pages/footer/Footer";
import LoginForm from "../../pages/login/login";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const [shippingFee, setShippingFee] = useState(0);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const [coupons, setCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem("cart")) || []);
    const userJson = localStorage.getItem("user");
    setUser(userJson ? JSON.parse(userJson) : null);

    function onUserChange() {
      const newUserJson = localStorage.getItem("user");
      setUser(newUserJson ? JSON.parse(newUserJson) : null);
    }

    window.addEventListener("userChange", onUserChange);
    return () => window.removeEventListener("userChange", onUserChange);
  }, []);

  // Chỉ reset discount khi giỏ hàng rỗng
  useEffect(() => {
    if (cartItems.length === 0) {
      setDiscount(0);
      setCouponCode("");
    }
  }, [cartItems]);

  const updateCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  const changeQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const newCart = [...cartItems];
    newCart[index].quantity = newQuantity;
    updateCart(newCart);
  };

  const removeItem = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    updateCart(newCart);
  };

  const formatCurrencyVND = (amount) =>
    amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "";

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalAmount = totalPrice + shippingFee - discount;

  const handleShippingChange = (fee) => {
    setShippingFee(fee);
  };

  // Lấy danh sách coupon từ API khi mở phần chọn coupon
  useEffect(() => {
    if (showCouponInput) {
      setCouponLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        setCouponLoading(false);
        return;
      }
      const orderTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const productIds = cartItems.map(item => item.id);

      const params = new URLSearchParams({
        orderTotal,
        productIds: productIds.join(',')
      }).toString();

      fetch(`/api/coupons?${params}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setCoupons(data.data || []);
          setCouponLoading(false);
        })
        .catch(() => {
          toast.error("Đã có lỗi xảy ra khi lấy danh sách mã giảm giá");
          setCouponLoading(false);
        });
    }
  }, [showCouponInput, cartItems]);

  // Áp dụng coupon từ danh sách hoặc nhập tay
  const applyCoupon = () => {
    const code = couponCode.trim();
    const found = coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase()
    );
    if (found) {
      // Tính discount phía frontend dựa trên dữ liệu coupon từ backend
      let discountValue = 0;
      const orderTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (orderTotal >= found.minOrderValue) {
        if (found.type === "percentage") {
          discountValue = (orderTotal * found.value) / 100;
          if (found.maxDiscountValue && discountValue > found.maxDiscountValue) {
            discountValue = found.maxDiscountValue;
          }
        } else if (found.type === "fixed") {
          discountValue = found.value;
          if (discountValue > orderTotal) discountValue = orderTotal;
        }
      }

      setDiscount(discountValue);
      toast.success(`Áp dụng coupon thành công! Giảm ${formatCurrencyVND(discountValue)}`);
      setShowCouponInput(false);
      setCouponCode("");
    } else {
      setDiscount(0);
      toast.error("Mã coupon không hợp lệ hoặc không tồn tại.");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (shippingFee === 0) {
      toast.warn("Vui lòng chọn đơn vị vận chuyển trước khi thanh toán.");
      return;
    }
    navigate(`/order/${user.id}`, {
      state: {
        cartItems,
        shippingFee,
        discount,
        couponCode,
      },
    });
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
    localStorage.setItem("user", JSON.stringify(userData));
    window.dispatchEvent(new Event("userChange"));
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div style={{ maxWidth: 900, margin: "40px auto", textAlign: "center" }}>
          <h2>Giỏ hàng của bạn đang trống</h2>
          <p>Hãy thêm sản phẩm để mua sắm nhé!</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        style={{
          maxWidth: 900,
          margin: "40px auto",
          fontFamily: "Arial, sans-serif",
          padding: "0 15px",
          color: "#333",
        }}
      >
        <h2 style={{ fontWeight: "700", fontSize: 22, marginBottom: 20 }}>
          Giỏ hàng của bạn
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #ccc",
                fontWeight: "700",
                fontSize: 14,
                color: "#222",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "12px 10px" }}>Sản phẩm</th>
              <th style={{ padding: "12px 10px", width: 80, textAlign: "center" }}>Size</th>
              <th style={{ padding: "12px 10px", width: 120, textAlign: "right" }}>Giá</th>
              <th style={{ padding: "12px 10px", width: 120, textAlign: "center" }}>Số lượng</th>
              <th style={{ padding: "12px 10px", width: 120, textAlign: "right" }}>Tổng tiền</th>
              <th style={{ padding: "12px 10px", width: 80, textAlign: "center" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, idx) => (
              <tr
                key={`${item.id}-${item.selectedSize}`}
                style={{
                  borderBottom: "1px solid #eee",
                  fontSize: 14,
                  color: "#444",
                  verticalAlign: "middle",
                }}
              >
                <td style={{ padding: "12px 10px", display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 90, height: 70, objectFit: "cover", borderRadius: 6 }}
                  />
                  <div>{item.name}</div>
                </td>
                <td style={{ padding: "12px 10px", textAlign: "center" }}>{item.selectedSize}</td>
                <td
                  style={{
                    padding: "12px 10px",
                    textAlign: "right",
                    color: "#444",
                    fontWeight: "600",
                  }}
                >
                  {formatCurrencyVND(item.price)}
                </td>
                <td style={{ padding: "12px 10px", textAlign: "center" }}>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => changeQuantity(idx, Number(e.target.value))}
                    style={{
                      width: 50,
                      padding: "6px 8px",
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  />
                </td>
                <td
                  style={{
                    padding: "12px 10px",
                    textAlign: "right",
                    color: "#4caf50",
                    fontWeight: "700",
                  }}
                >
                  {formatCurrencyVND(item.price * item.quantity)}
                </td>
                <td style={{ padding: "12px 10px", textAlign: "center" }}>
                  <button
                    onClick={() => removeItem(idx)}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#4caf50",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                    aria-label={`Xóa sản phẩm ${item.name}`}
                    title="Xóa"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ height: 25 }} />

        <div
          style={{
            fontWeight: "600",
            fontSize: 14,
            marginBottom: 20,
            userSelect: "none",
          }}
        >
          Chọn đơn vị vận chuyển
          <div style={{ marginTop: 8, fontWeight: "700" }}>
            <label style={{ display: "block", marginBottom: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="shipping"
                style={{ marginRight: 6 }}
                onChange={() => handleShippingChange(50000)}
                checked={shippingFee === 50000}
              />
              Hỏa tốc - ₫50,000
            </label>
            <label style={{ display: "block", marginBottom: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="shipping"
                style={{ marginRight: 6 }}
                onChange={() => handleShippingChange(20000)}
                checked={shippingFee === 20000}
              />
              Giao hàng tiết kiệm - ₫20,000
            </label>
            <label style={{ display: "block", marginBottom: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="shipping"
                style={{ marginRight: 6 }}
                onChange={() => handleShippingChange(30000)}
                checked={shippingFee === 30000}
              />
              Giao hàng nhanh - ₫30,000
            </label>
          </div>
        </div>

        <hr style={{ border: "none", borderBottom: "1px solid #eee", margin: "0 0 20px" }} />

        <div
          style={{
            display: "flex",
            maxWidth: 900,
            margin: "0 auto",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowCouponInput(!showCouponInput);
              }}
              style={{
                color: "#0B3B80",
                fontWeight: "600",
                cursor: "pointer",
                userSelect: "none",
                textDecoration: "none",
              }}
            >
              Chọn Hoặc Nhập Mã
            </a>
          </div>

          <div style={{ fontWeight: "600", fontSize: 16 }}>
            Tổng thanh toán ({cartItems.length} sản phẩm):{" "}
            <span style={{ color: "#4caf50", fontSize: 18, fontWeight: "700" }}>
              {formatCurrencyVND(totalAmount)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            style={{
              backgroundColor: "#4caf50",
              color: "white",
              padding: "12px 30px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: 14,
              boxShadow: "0 3px 6px rgba(76,175,80,0.6)",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#388e3c")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4caf50")}
          >
            ĐI ĐẾN THANH TOÁN
          </button>
        </div>

        {/* Hiển thị giảm giá nếu có */}
        {discount > 0 && (
          <div
            style={{
              maxWidth: 900,
              margin: "10px auto 0",
              display: "flex",
              justifyContent: "flex-end",
              fontSize: 15,
              color: "#d32f2f",
              fontWeight: "600",
            }}
          >
            Giảm giá: -{formatCurrencyVND(discount)}
          </div>
        )}

        {showCouponInput && (
          <div
            style={{
              marginTop: 12,
              maxWidth: 900,
              marginLeft: "auto",
              marginRight: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {/* Danh sách coupon lấy từ API */}
            {couponLoading ? (
              <div>Đang tải mã giảm giá...</div>
            ) : (
              coupons.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {coupons.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCouponCode(c.code)}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: couponCode === c.code ? "#0B3B80" : "#f5f5f5",
                        color: couponCode === c.code ? "#fff" : "#222",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: 14,
                        marginBottom: 4,
                        outline: couponCode === c.code ? "2px solid #0B3B80" : "none",
                      }}
                      title={`Chọn mã ${c.code}`}
                    >
                      {c.code} - Giảm {c.type === "percentage"
                        ? `${c.value}% (tối đa ${formatCurrencyVND(c.maxDiscountValue)})`
                        : formatCurrencyVND(c.value)}
                    </button>
                  ))}
                </div>
              )
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                placeholder="Nhập mã coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{
                  padding: 8,
                  flex: 1,
                  borderRadius: 4,
                  border: "1px solid #ccc",
                  fontSize: 14,
                  outlineColor: "#4caf50",
                  transition: "border-color 0.3s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4caf50")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              />
              <button
                onClick={applyCoupon}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#0B3B80",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: 14,
                  boxShadow: "0 3px 7px rgba(21,59,128,0.6)",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#09326f")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0B3B80")}
              >
                Áp dụng
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={2500} />

      {showLogin && (
        <LoginForm onLoginSuccess={handleLoginSuccess} onClose={() => setShowLogin(false)} />
      )}
    </>
  );
}

export default Cart;