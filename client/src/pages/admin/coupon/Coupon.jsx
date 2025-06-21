import React, { useState, useEffect } from "react";
import Footer from "../footer/Footer";
import { Link } from "react-router-dom";
import axios from "../../../axios";

// Hàm helper hiển thị giới hạn, trả "∞" nếu null, 0 hoặc undefined
const displayLimit = (limit) => {
  if (limit === null || limit === undefined) return "∞";
  if (typeof limit === "number" && limit <= 0) return "∞";
  return limit;
};

// Hàm kiểm tra hiệu lực coupon (hiển thị "còn hiệu lực" nếu hiện tại trong khoảng start-end)
const isCouponActive = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return now >= start && now <= end;
};

export default function Coupon() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    usedCoupons: 0,
  });

  // State cho mã giảm giá mới
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrderValue: "",
    maxDiscountValue: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    perUserLimit: "",
    applicableProducts: "",
    applicableCategories: "",
    isActive: true,
    description: "",
  });
  // State cho lỗi form
  const [formError, setFormError] = useState("");
  // State cho chế độ chỉnh sửa
  const [editCouponId, setEditCouponId] = useState(null);
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Load danh sách coupon
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get("/api/coupons", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const couponData = response.data.data || [];
      setCoupons(couponData);

      const now = new Date();
      setStats({
        totalCoupons: couponData.length,
        activeCoupons: couponData.filter(
          (c) => c.isActive && new Date(c.endDate) >= now
        ).length,
        expiredCoupons: couponData.filter((c) => new Date(c.endDate) < now).length,
        usedCoupons: couponData.filter((c) => c.usedCount > 0).length,
      });
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải danh sách mã giảm giá:", error);
      setError("Không thể tải danh sách mã giảm giá. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Lọc danh sách theo tìm kiếm
  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code?.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  // Reset về trang 1 khi danh sách coupon hoặc searchTerm thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [coupons.length, searchTerm]);

  // Tính toán phân trang cho danh sách đã lọc
  const totalPages = Math.ceil(filteredCoupons.length / pageSize);
  const pagedCoupons = filteredCoupons.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCoupon({
      ...newCoupon,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Khi bấm nút sửa, đổ dữ liệu lên form
  const handleEdit = (coupon) => {
    setEditCouponId(coupon._id);
    setNewCoupon({
      code: coupon.code || "",
      type: coupon.type === "fixed" ? "fixed_amount" : coupon.type,
      value: coupon.value?.toString() || "",
      minOrderValue: coupon.minOrderValue?.toString() || "",
      maxDiscountValue: coupon.maxDiscountValue?.toString() || "",
      startDate: coupon.startDate ? coupon.startDate.slice(0, 10) : "",
      endDate: coupon.endDate ? coupon.endDate.slice(0, 10) : "",
      usageLimit: coupon.usageLimit?.toString() || "",
      perUserLimit: coupon.perUserLimit?.toString() || "",
      applicableProducts: coupon.applicableProducts?.join(", ") || "",
      applicableCategories: coupon.applicableCategories?.join(", ") || "",
      isActive: !!coupon.isActive,
      description: coupon.description || "",
    });
    setFormError("");
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditCouponId(null);
    setNewCoupon({
      code: "",
      type: "percentage",
      value: "",
      minOrderValue: "",
      maxDiscountValue: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      perUserLimit: "",
      applicableProducts: "",
      applicableCategories: "",
      isActive: true,
      description: "",
    });
    setFormError("");
  };

  // Xử lý thêm/cập nhật mã giảm giá
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate dữ liệu
    const codeRegex = /^[A-Z0-9_-]+$/;
    if (!newCoupon.code.trim()) {
      setFormError("Mã giảm giá không được để trống.");
      return;
    }
    if (!codeRegex.test(newCoupon.code.trim())) {
      setFormError("Mã giảm giá chỉ được chứa chữ in hoa, số, dấu gạch dưới hoặc gạch ngang.");
      return;
    }
    if (newCoupon.type === "percentage") {
      const val = Number(newCoupon.value);
      if (isNaN(val) || val < 1 || val > 100) {
        setFormError("Phần trăm giảm giá phải từ 1 đến 100.");
        return;
      }
    } else {
      const val = Number(newCoupon.value);
      if (isNaN(val) || val <= 0) {
        setFormError("Số tiền giảm giá phải lớn hơn 0.");
        return;
      }
    }
    if (!newCoupon.startDate || !newCoupon.endDate) {
      setFormError("Vui lòng chọn ngày bắt đầu và ngày kết thúc.");
      return;
    }
    if (new Date(newCoupon.startDate) > new Date(newCoupon.endDate)) {
      setFormError("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
      return;
    }
    if (
      newCoupon.minOrderValue !== "" &&
      (isNaN(Number(newCoupon.minOrderValue)) || Number(newCoupon.minOrderValue) < 0)
    ) {
      setFormError("Giá trị đơn hàng tối thiểu phải là số không âm.");
      return;
    }
    if (
      newCoupon.maxDiscountValue !== "" &&
      (isNaN(Number(newCoupon.maxDiscountValue)) || Number(newCoupon.maxDiscountValue) < 0)
    ) {
      setFormError("Giá trị giảm tối đa phải là số không âm.");
      return;
    }
    if (
      newCoupon.usageLimit !== "" &&
      (isNaN(Number(newCoupon.usageLimit)) || Number(newCoupon.usageLimit) < 0)
    ) {
      setFormError("Giới hạn số lần sử dụng tổng phải là số không âm.");
      return;
    }
    if (
      newCoupon.perUserLimit !== "" &&
      (isNaN(Number(newCoupon.perUserLimit)) || Number(newCoupon.perUserLimit) < 1)
    ) {
      setFormError("Giới hạn sử dụng trên mỗi người phải là số ≥ 1.");
      return;
    }
    setFormError(""); // Xóa lỗi nếu hợp lệ

    try {
      const token = localStorage.getItem("adminToken");

      // Convert date string sang ISO hoặc null
      const toDateTime = (dateStr) => (dateStr ? new Date(dateStr).toISOString() : null);

      const payload = {
        code: newCoupon.code.trim(),
        type: newCoupon.type === "fixed_amount" ? "fixed" : newCoupon.type,
        value: Number(newCoupon.value),
        minOrderValue: Number(newCoupon.minOrderValue) || 0,
        maxDiscountValue:
          newCoupon.maxDiscountValue !== ""
            ? Number(newCoupon.maxDiscountValue)
            : undefined,
        startDate: toDateTime(newCoupon.startDate),
        endDate: toDateTime(newCoupon.endDate),
        usageLimit:
          newCoupon.usageLimit !== "" ? Number(newCoupon.usageLimit) : undefined,
        perUserLimit:
          newCoupon.perUserLimit !== "" ? Number(newCoupon.perUserLimit) : undefined,
        applicableProducts: newCoupon.applicableProducts
          ? newCoupon.applicableProducts
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        applicableCategories: newCoupon.applicableCategories
          ? newCoupon.applicableCategories
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        isActive: newCoupon.isActive,
        description: newCoupon.description,
      };

      if (editCouponId) {
        // Chỉnh sửa
        const response = await axios.put(`/api/coupons/${editCouponId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          fetchCoupons();
          handleCancelEdit();
        } else {
          setFormError("Cập nhật mã giảm giá thất bại: " + response.data.message);
        }
      } else {
        // Thêm mới
        const response = await axios.post("/api/coupons", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setCoupons((prev) => [...prev, response.data.data]);
          handleCancelEdit();
        } else {
          setFormError("Thêm mã giảm giá thất bại: " + response.data.message);
        }
      }
    } catch (error) {
      setFormError(editCouponId ? "Không thể cập nhật mã giảm giá. Vui lòng thử lại." : "Không thể thêm mã giảm giá. Vui lòng thử lại.");
    }
  };

  // Xóa mã giảm giá
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/api/coupons/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCoupons();
    } catch (error) {
      console.error("Lỗi khi xóa mã giảm giá:", error);
      alert("Không thể xóa mã giảm giá. Vui lòng thử lại.");
    }
  };

  // Format tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format giá trị giảm giá
  const formatDiscountValue = (type, value) => {
    if (type === "percentage") return `${value}%`;
    return formatCurrency(value);
  };

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
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
          style={{ fontWeight: 800, fontSize: 40, marginBottom: 24, letterSpacing: 1 }}
        >
          Quản lý mã giảm giá
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
            <span style={{ fontSize: 28, marginRight: 8 }}>🎁</span> Tổng quan mã giảm giá
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Quản lý và tạo các mã giảm giá cho khách hàng
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý các mã giảm giá của hệ thống. Bạn có thể tạo mới, cập
            nhật, xóa hoặc quản lý trạng thái các mã giảm giá từ đây.
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
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="coupon">
                🎟️
              </span>{" "}
              {stats.totalCoupons}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng số mã giảm giá</div>
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
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="active">
                ✨
              </span>{" "}
              {stats.activeCoupons}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Mã đang hoạt động</div>
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
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="used">
                🔄
              </span>{" "}
              {stats.usedCoupons}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Mã đã sử dụng</div>
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
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="expired">
                ⌛
              </span>{" "}
              {stats.expiredCoupons}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Mã đã hết hạn</div>
          </div>
        </div>

        <div className="row">
          {/* Form thêm/chỉnh sửa mã giảm giá */}
          <div className="col-lg-4 col-md-5 col-12 mb-4">
            <div
              className="dashboard-content"
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 24,
                boxShadow: "0 4px 24px rgba(44, 62, 80, 0.08)",
                height: "100%",
              }}
            >
              <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>
                {editCouponId ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
              </h3>
              {/* Hiển thị lỗi form nếu có */}
              {formError && (
                <div className="alert alert-danger" style={{ fontSize: 14 }}>
                  {formError}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label
                    htmlFor="code"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    Mã giảm giá
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="code"
                    name="code"
                    value={newCoupon.code}
                    onChange={handleChange}
                    required
                    placeholder="VD: SUMMER2023"
                    style={{ borderRadius: 8, padding: "10px 16px" }}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="type"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    Loại giảm giá
                  </label>
                  <select
                    className="form-control"
                    id="type"
                    name="type"
                    value={newCoupon.type}
                    onChange={handleChange}
                    style={{ borderRadius: 8, padding: "10px 16px" }}
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="value"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    {newCoupon.type === "percentage"
                      ? "Phần trăm giảm giá (%)"
                      : "Số tiền giảm giá (VNĐ)"}
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="value"
                    name="value"
                    value={newCoupon.value}
                    onChange={handleChange}
                    required
                    min="0"
                    max={newCoupon.type === "percentage" ? "100" : ""}
                    style={{ borderRadius: 8, padding: "10px 16px" }}
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label
                      htmlFor="startDate"
                      style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                    >
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="startDate"
                      name="startDate"
                      value={newCoupon.startDate}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: 8, padding: "10px 16px" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label
                      htmlFor="endDate"
                      style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                    >
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="endDate"
                      name="endDate"
                      value={newCoupon.endDate}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: 8, padding: "10px 16px" }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="minOrderValue"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    Giá trị đơn hàng tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="minOrderValue"
                    name="minOrderValue"
                    value={newCoupon.minOrderValue}
                    onChange={handleChange}
                    min="0"
                    style={{ borderRadius: 8, padding: "10px 16px" }}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="maxDiscountValue"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    Giá trị giảm tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="maxDiscountValue"
                    name="maxDiscountValue"
                    value={newCoupon.maxDiscountValue}
                    onChange={handleChange}
                    min="0"
                    placeholder="Có thể để trống"
                    style={{ borderRadius: 8, padding: "10px 16px" }}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="usageLimit"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    Giới hạn số lần sử dụng tổng
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="usageLimit"
                    name="usageLimit"
                    value={newCoupon.usageLimit}
                    onChange={handleChange}
                    min="0"
                    placeholder="Nhập số ≥ 0 hoặc để trống"
                    style={{ borderRadius: 8, padding: "10px 16px" }}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="perUserLimit"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    Giới hạn sử dụng trên mỗi người (≥1)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="perUserLimit"
                    name="perUserLimit"
                    value={newCoupon.perUserLimit}
                    onChange={handleChange}
                    min="1"
                    placeholder="Nhập số ≥ 1 hoặc để trống"
                    style={{ borderRadius: 8, padding: "10px 16px" }}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="applicableProducts"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    Sản phẩm áp dụng (danh sách mã, ngăn cách dấu phẩy)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="applicableProducts"
                    name="applicableProducts"
                    value={newCoupon.applicableProducts}
                    onChange={handleChange}
                    placeholder="VD: PROD1, PROD2, PROD3"
                    style={{ borderRadius: 8, padding: "10px 16px" }}
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="applicableCategories"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    Danh mục áp dụng (danh sách mã, ngăn cách dấu phẩy)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="applicableCategories"
                    name="applicableCategories"
                    value={newCoupon.applicableCategories}
                    onChange={handleChange}
                    placeholder="VD: CAT1, CAT2, CAT3"
                    style={{ borderRadius: 8, padding: "10px 16px" }}
                  />
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isActive"
                    name="isActive"
                    checked={newCoupon.isActive}
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="isActive"
                    style={{ fontWeight: 600, fontSize: 14 }}
                  >
                    Kích hoạt
                  </label>
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="description"
                    style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}
                  >
                    Mô tả
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={newCoupon.description}
                    onChange={handleChange}
                    placeholder="Mô tả mã giảm giá"
                    style={{
                      borderRadius: 8,
                      padding: "10px 16px",
                      minHeight: 80,
                    }}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      background: editCouponId
                        ? "linear-gradient(90deg, #fbbf24, #f59e42)"
                        : "linear-gradient(90deg, #38bdf8, #818cf8)",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 24px",
                      fontWeight: 600,
                    }}
                  >
                    <i className={editCouponId ? "fas fa-save mr-2" : "fas fa-plus-circle mr-2"}></i>
                    {editCouponId ? "Cập nhật mã giảm giá" : "Thêm mã giảm giá"}
                  </button>
                  {editCouponId && (
                    <button
                      type="button"
                      className="btn btn-secondary ml-2"
                      style={{
                        borderRadius: 10,
                        padding: "10px 24px",
                        marginLeft: 10,
                        fontWeight: 600,
                        background: "#e5e7eb",
                        color: "#374151",
                        border: "none",
                      }}
                      onClick={handleCancelEdit}
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Danh sách mã giảm giá */}
          <div className="col-lg-8 col-md-7 col-12">
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
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>
                  Danh sách mã giảm giá
                </h3>
                <div className="d-flex">
                  <input
                    type="text"
                    className="form-control mr-2"
                    placeholder="Tìm kiếm mã..."
                    style={{
                      borderRadius: 8,
                      border: "1px solid #e0e7ff",
                      padding: "8px 16px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

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
                    Đang tải danh sách mã giảm giá...
                  </p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
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
                        <th>Mã giảm giá</th>
                        <th>Giá trị</th>
                        <th>Thời hạn</th>
                        {/* <th>Giới hạn</th> */}
                        <th>Trạng thái</th>
                        <th className="text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedCoupons.length > 0 ? (
                        pagedCoupons.map((coupon) => (
                          <tr key={coupon._id}>
                            <td>
                              <strong style={{ fontSize: 16 }}>{coupon.code}</strong>
                              <div>
                                <small style={{ color: "#64748b" }}>
                                  {coupon.minOrderValue > 0 &&
                                    `Đơn hàng từ ${formatCurrency(coupon.minOrderValue)}`}
                                </small>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: "#0ea5e9" }}>
                                {formatDiscountValue(coupon.type, coupon.value)}
                              </span>
                              {coupon.maxDiscountValue ? (
                                <div>
                                  <small style={{ color: "#64748b" }}>
                                    Tối đa: {formatCurrency(coupon.maxDiscountValue)}
                                  </small>
                                </div>
                              ) : null}
                            </td>
                            <td>
                              <div>
                                {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                              </div>
                              <div>
                                <span
                                  className={
                                    isCouponActive(coupon.startDate, coupon.endDate)
                                      ? "badge bg-success"
                                      : "badge bg-danger"
                                  }
                                  style={{ padding: "4px 8px", borderRadius: 12, fontSize: 11 }}
                                >
                                  {isCouponActive(coupon.startDate, coupon.endDate)
                                    ? "Còn hiệu lực"
                                    : "Hết hiệu lực"}
                                </span>
                              </div>
                            </td>
                            {/* <td>
                              {coupon.usedCount || 0} / {displayLimit(coupon.usageLimit)}
                              <br />
                              <small style={{ color: "#64748b", fontSize: 12 }}>
                                Mỗi người: {displayLimit(coupon.perUserLimit)}
                              </small>
                            </td> */}
                            <td>
                              <span
                                className={`badge ${
                                  coupon.isActive ? "bg-success" : "bg-secondary"
                                }`}
                                style={{ padding: "6px 12px", borderRadius: 20 }}
                              >
                                {coupon.isActive ? "Kích hoạt" : "Vô hiệu"}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-info mr-1"
                                style={{
                                  borderRadius: 8,
                                  padding: "6px 12px",
                                  background: "linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%)",
                                  border: "none",
                                }}
                                onClick={() => handleEdit(coupon)}
                                type="button"
                              >
                                <i className="far fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(coupon._id)}
                                style={{
                                  borderRadius: 8,
                                  padding: "6px 12px",
                                  background: "linear-gradient(90deg, #f87171, #ef4444)",
                                  border: "none",
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-5">
                            <div style={{ fontSize: 18, color: "#64748b", fontWeight: 500 }}>
                              Không có mã giảm giá nào
                            </div>
                            <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                              {searchTerm
                                ? "Không tìm thấy mã phù hợp"
                                : "Hãy tạo mã giảm giá đầu tiên của bạn"}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Phân trang */}
              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{ cursor: "pointer" }}
                      >
                        &laquo;
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li
                        key={i + 1}
                        className={`page-item${currentPage === i + 1 ? " active" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i + 1)}
                          style={{ cursor: "pointer" }}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{ cursor: "pointer" }}
                      >
                        &raquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
