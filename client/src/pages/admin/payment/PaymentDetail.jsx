import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "../../../axios";

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);

  // Tải thông tin chi tiết thanh toán
  const fetchPaymentDetail = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`/api/payments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPayment(response.data.data);
      // Nếu đã có số tiền hoàn lại, hiển thị giá trị đó
      if (
        response.data.data.refund_data &&
        response.data.data.refund_data.refund_amount
      ) {
        setRefundAmount(response.data.data.refund_data.refund_amount);
      } else {
        // Mặc định số tiền hoàn lại là toàn bộ số tiền giao dịch
        setRefundAmount(response.data.data.amount);
      }
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi tải thông tin thanh toán:", error);
      setError("Không thể tải thông tin thanh toán. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetail();
  }, [id]);

  // Xử lý cập nhật trạng thái thanh toán
  const handleStatusUpdate = async (newStatus) => {
    if (
      !confirm(
        `Bạn có chắc muốn cập nhật trạng thái thanh toán thành "${
          getPaymentStatusLabel(newStatus).label
        }"?`
      )
    ) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.put(
        `/api/payments/${id}/status`,
        {
          payment_status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Tải lại thông tin thanh toán sau khi cập nhật
      await fetchPaymentDetail();

      // Hiển thị thông báo thành công
      alert(`Cập nhật trạng thái thanh toán thành công!`);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
      alert("Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại sau.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Xử lý hoàn tiền
  const handleRefund = async (e) => {
    e.preventDefault();

    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      alert("Vui lòng nhập số tiền hoàn lại hợp lệ");
      return;
    }

    if (!refundReason.trim()) {
      alert("Vui lòng nhập lý do hoàn tiền");
      return;
    }

    if (
      !confirm(
        `Bạn có chắc muốn hoàn ${formatCurrency(
          refundAmount
        )} cho giao dịch này?`
      )
    ) {
      return;
    }

    setProcessingRefund(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `/api/payments/${id}/refund`,
        {
          refund_amount: parseFloat(refundAmount),
          refund_reason: refundReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Tải lại thông tin thanh toán sau khi hoàn tiền
      await fetchPaymentDetail();

      // Đóng form hoàn tiền và hiển thị thông báo thành công
      setShowRefundForm(false);
      alert("Hoàn tiền thành công!");
    } catch (error) {
      console.error("Lỗi khi xử lý hoàn tiền:", error);
      alert("Không thể xử lý hoàn tiền. Vui lòng thử lại sau.");
    } finally {
      setProcessingRefund(false);
    }
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
      second: "2-digit",
    }).format(date);
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

  // Hiển thị màn hình loading
  if (loading) {
    return (
      <div className="wrapper payment-detail-bg">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1>Chi tiết thanh toán</h1>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                    <li className="breadcrumb-item">
                      <Link to="/admin">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/admin/payment">Thanh toán</Link>
                    </li>
                    <li className="breadcrumb-item active">Chi tiết</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="container-fluid">
              <div className="text-center p-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ width: 48, height: 48 }}
                >
                  <span className="sr-only">Đang tải...</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="wrapper payment-detail-bg">
        <div className="content-wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1>Chi tiết thanh toán</h1>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                    <li className="breadcrumb-item">
                      <Link to="/admin">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/admin/payment">Thanh toán</Link>
                    </li>
                    <li className="breadcrumb-item active">Chi tiết</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="container-fluid">
              <div className="alert alert-danger">{error}</div>
              <div className="text-center">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/admin/payment")}
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const statusInfo = getPaymentStatusLabel(payment.payment_status);

  return (
    <div className="wrapper payment-detail-bg">
      <style>{`
                .payment-detail-bg {
                    background: linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%);
                    min-height: 100vh;
                }
                .payment-detail-card {
                    background: #fff;
                    border-radius: 18px;
                    box-shadow: 0 8px 24px rgba(60,72,100,0.12);
                    padding: 32px;
                    margin-bottom: 32px;
                    border: none;
                }
                .payment-detail-card.with-header {
                    padding: 0;
                }
                .payment-detail-card .card-header {
                    background: linear-gradient(90deg, #f1f5fa, #fff);
                    padding: 24px 32px;
                    border-top-left-radius: 18px !important;
                    border-top-right-radius: 18px !important;
                    border-bottom: 1px solid #e0e7ef;
                }
                .payment-detail-card .card-header h3 {
                    margin: 0;
                    font-weight: 700;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .payment-detail-card .card-header h3 i {
                    font-size: 1.2em;
                    color: #38bdf8;
                }
                .payment-detail-card .card-body {
                    padding: 24px 32px;
                }
                .payment-info-row {
                    margin-bottom: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f1f5fa;
                }
                .payment-info-row:last-child {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }
                .payment-info-label {
                    color: #64748b;
                    font-weight: 500;
                    margin-bottom: 4px;
                }
                .payment-info-value {
                    color: #1e293b;
                    font-weight: 600;
                    font-size: 1.1em;
                }
                .payment-amount-value {
                    color: #0ea5e9;
                    font-weight: 700;
                    font-size: 1.25em;
                }
                .payment-status-badge {
                    font-size: 1em;
                    padding: 0.5em 1em;
                    border-radius: 999px;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5em;
                }
                .btn-action {
                    border-radius: 12px;
                    padding: 10px 16px;
                    font-weight: 600;
                    margin-right: 10px;
                    transition: all 0.2s;
                }
                .btn-primary {
                    background: linear-gradient(90deg,#2563eb,#38bdf8);
                    border: none;
                }
                .btn-primary:hover {
                    background: linear-gradient(90deg,#1d4ed8,#0ea5e9);
                    transform: translateY(-2px);
                }
                .btn-success {
                    background: linear-gradient(90deg,#10b981,#34d399);
                    border: none;
                }
                .btn-success:hover {
                    background: linear-gradient(90deg,#059669,#10b981);
                    transform: translateY(-2px);
                }
                .btn-danger {
                    background: linear-gradient(90deg,#ef4444,#f87171);
                    border: none;
                }
                .btn-danger:hover {
                    background: linear-gradient(90deg,#dc2626,#ef4444);
                    transform: translateY(-2px);
                }
                .btn-warning {
                    background: linear-gradient(90deg,#f59e0b,#fbbf24);
                    border: none;
                    color: white;
                }
                .btn-warning:hover {
                    background: linear-gradient(90deg,#d97706,#f59e0b);
                    transform: translateY(-2px);
                    color: white;
                }
                .btn-info {
                    background: linear-gradient(90deg,#06b6d4,#67e8f9);
                    border: none;
                    color: white;
                }
                .btn-info:hover {
                    background: linear-gradient(90deg,#0891b2,#06b6d4);
                    transform: translateY(-2px);
                    color: white;
                }
                .transaction-data-container {
                    background: #f1f5fa;
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid #e0e7ef;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .json-key {
                    color: #2563eb;
                }
                .json-string {
                    color: #10b981;
                }
                .json-number {
                    color: #ef4444;
                }
                .json-boolean {
                    color: #8b5cf6;
                }
                .refund-form {
                    background: #f8fafc;
                    border: 1px solid #e0e7ef;
                    border-radius: 12px;
                    padding: 24px;
                    margin-top: 16px;
                }
                .refund-form .form-group {
                    margin-bottom: 16px;
                }
                .refund-form label {
                    font-weight: 600;
                    color: #475569;
                }
                .refund-form .form-control {
                    border-radius: 10px;
                    padding: 12px;
                    border: 1px solid #e0e7ef;
                }
                .refund-form .form-control:focus {
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
                    border-color: #3b82f6;
                }
                .badge.bg-success { background: linear-gradient(90deg,#4ade80,#22d3ee); color: #fff; }
                .badge.bg-warning { background: linear-gradient(90deg,#fbbf24,#f59e42); color: #fff; }
                .badge.bg-danger { background: linear-gradient(90deg,#f87171,#ef4444); color: #fff; }
                .badge.bg-info { background: linear-gradient(90deg,#67e8f9,#06b6d4); color: #fff; }
                .badge.bg-secondary { background: linear-gradient(90deg,#94a3b8,#64748b); color: #fff; }
            `}</style>
      <div className="content-wrapper">
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 style={{ fontWeight: 700, letterSpacing: 1 }}>
                  Chi tiết thanh toán
                </h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item">
                    <Link to="/admin">Home</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/admin/payment">Thanh toán</Link>
                  </li>
                  <li className="breadcrumb-item active">Chi tiết</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="d-flex justify-content-between">
                  <Link
                    to="/admin/payment"
                    className="btn btn-secondary btn-action"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Quay lại
                  </Link>
                  <div>
                    {payment.payment_status !== "refunded" &&
                      payment.payment_status !== "failed" && (
                        <button
                          className="btn btn-info btn-action"
                          onClick={() => setShowRefundForm(!showRefundForm)}
                        >
                          <i className="fas fa-undo mr-2"></i> Hoàn tiền
                        </button>
                      )}
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                <div className="card payment-detail-card with-header">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-info-circle"></i>
                      Thông tin thanh toán
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="payment-info-row">
                          <div className="payment-info-label">Mã giao dịch</div>
                          <div className="payment-info-value">
                            {payment.transaction_id || payment._id}
                          </div>
                        </div>
                        <div className="payment-info-row">
                          <div className="payment-info-label">
                            Phương thức thanh toán
                          </div>
                          <div className="payment-info-value">
                            {getPaymentMethodLabel(payment.payment_method)}
                          </div>
                        </div>
                        <div className="payment-info-row">
                          <div className="payment-info-label">Trạng thái</div>
                          <div className="payment-info-value">
                            <span className={statusInfo.className}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                        <div className="payment-info-row">
                          <div className="payment-info-label">
                            Ngày giao dịch
                          </div>
                          <div className="payment-info-value">
                            {formatDate(payment.payment_date)}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="payment-info-row">
                          <div className="payment-info-label">Đơn hàng</div>
                          <div className="payment-info-value">
                            {payment.order_id ? (
                              <Link
                                to={`/admin/order/${payment.order_id._id}`}
                                style={{ color: "#2563eb", fontWeight: 600 }}
                              >
                                #
                                {payment.order_id.order_number ||
                                  payment.order_id._id}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </div>
                        <div className="payment-info-row">
                          <div className="payment-info-label">Khách hàng</div>
                          <div className="payment-info-value">
                            {payment.user_id ? (
                              <>
                                {payment.user_id.username || "N/A"}
                                <br />
                                <small
                                  style={{ color: "#64748b", fontWeight: 400 }}
                                >
                                  {payment.user_id.email || "N/A"}
                                </small>
                              </>
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </div>
                        <div className="payment-info-row">
                          <div className="payment-info-label">Số tiền</div>
                          <div className="payment-amount-value">
                            {formatCurrency(payment.amount)}
                          </div>
                        </div>
                        <div className="payment-info-row">
                          <div className="payment-info-label">Loại tiền tệ</div>
                          <div className="payment-info-value">
                            {payment.currency || "VND"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {payment.note && (
                      <div className="row mt-3">
                        <div className="col-12">
                          <div className="payment-info-label">Ghi chú</div>
                          <div className="payment-info-value">
                            {payment.note}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin hoàn tiền nếu có */}
                {payment.refund_data && payment.refund_data.refund_amount && (
                  <div className="card payment-detail-card with-header">
                    <div className="card-header">
                      <h3>
                        <i className="fas fa-undo-alt"></i>
                        Thông tin hoàn tiền
                      </h3>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="payment-info-row">
                            <div className="payment-info-label">
                              Số tiền hoàn
                            </div>
                            <div className="payment-amount-value">
                              {formatCurrency(
                                payment.refund_data.refund_amount
                              )}
                            </div>
                          </div>
                          <div className="payment-info-row">
                            <div className="payment-info-label">
                              Ngày hoàn tiền
                            </div>
                            <div className="payment-info-value">
                              {formatDate(payment.refund_data.refund_date)}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="payment-info-row">
                            <div className="payment-info-label">
                              Mã giao dịch hoàn tiền
                            </div>
                            <div className="payment-info-value">
                              {payment.refund_data.refund_transaction_id ||
                                "N/A"}
                            </div>
                          </div>
                          <div className="payment-info-row">
                            <div className="payment-info-label">
                              Lý do hoàn tiền
                            </div>
                            <div className="payment-info-value">
                              {payment.refund_data.refund_reason || "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hiển thị form hoàn tiền nếu cần */}
                {showRefundForm && (
                  <div className="card payment-detail-card">
                    <form onSubmit={handleRefund} className="refund-form">
                      <h4
                        className="mb-4"
                        style={{ fontWeight: 700, color: "#2563eb" }}
                      >
                        Hoàn tiền giao dịch
                      </h4>
                      <div className="form-group">
                        <label htmlFor="refundAmount">Số tiền hoàn lại</label>
                        <input
                          type="number"
                          className="form-control"
                          id="refundAmount"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          min="0"
                          max={payment.amount}
                          required
                        />
                        <small className="form-text text-muted">
                          Số tiền tối đa có thể hoàn:{" "}
                          {formatCurrency(payment.amount)}
                        </small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="refundReason">Lý do hoàn tiền</label>
                        <textarea
                          className="form-control"
                          id="refundReason"
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                          rows="3"
                          required
                        ></textarea>
                      </div>
                      <div className="d-flex justify-content-between">
                        <button
                          type="button"
                          className="btn btn-secondary btn-action"
                          onClick={() => setShowRefundForm(false)}
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-action"
                          disabled={processingRefund}
                        >
                          {processingRefund ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm mr-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-check mr-2"></i> Xác nhận
                              hoàn tiền
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              <div className="col-md-4">
                {/* Hành động */}
                <div className="card payment-detail-card with-header">
                  <div className="card-header">
                    <h3>
                      <i className="fas fa-cogs"></i>
                      Hành động
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="d-grid gap-3">
                      {/* Chỉ hiển thị các nút trạng thái phù hợp */}
                      {payment.payment_status === "pending" && (
                        <>
                          <button
                            className="btn btn-success w-100 text-left btn-action"
                            onClick={() => handleStatusUpdate("completed")}
                            disabled={updatingStatus}
                          >
                            <i className="fas fa-check-circle mr-2"></i> Xác
                            nhận đã thanh toán
                          </button>
                          <button
                            className="btn btn-warning w-100 text-left btn-action"
                            onClick={() => handleStatusUpdate("processing")}
                            disabled={updatingStatus}
                          >
                            <i className="fas fa-sync mr-2"></i> Đánh dấu đang
                            xử lý
                          </button>
                          <button
                            className="btn btn-danger w-100 text-left btn-action"
                            onClick={() => handleStatusUpdate("failed")}
                            disabled={updatingStatus}
                          >
                            <i className="fas fa-times-circle mr-2"></i> Đánh
                            dấu thất bại
                          </button>
                        </>
                      )}

                      {payment.payment_status === "processing" && (
                        <>
                          <button
                            className="btn btn-success w-100 text-left btn-action"
                            onClick={() => handleStatusUpdate("completed")}
                            disabled={updatingStatus}
                          >
                            <i className="fas fa-check-circle mr-2"></i> Xác
                            nhận đã thanh toán
                          </button>
                          <button
                            className="btn btn-danger w-100 text-left btn-action"
                            onClick={() => handleStatusUpdate("failed")}
                            disabled={updatingStatus}
                          >
                            <i className="fas fa-times-circle mr-2"></i> Đánh
                            dấu thất bại
                          </button>
                        </>
                      )}

                      {payment.payment_status === "failed" && (
                        <button
                          className="btn btn-success w-100 text-left btn-action"
                          onClick={() => handleStatusUpdate("completed")}
                          disabled={updatingStatus}
                        >
                          <i className="fas fa-check-circle mr-2"></i> Xác nhận
                          đã thanh toán
                        </button>
                      )}

                      {updatingStatus && (
                        <div className="text-center mt-3">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="sr-only">Đang cập nhật...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dữ liệu giao dịch */}
                {payment.transaction_data &&
                  Object.keys(payment.transaction_data).length > 0 && (
                    <div className="card payment-detail-card with-header">
                      <div className="card-header">
                        <h3>
                          <i className="fas fa-database"></i>
                          Dữ liệu giao dịch
                        </h3>
                      </div>
                      <div className="card-body">
                        <div className="transaction-data-container">
                          <pre
                            style={{
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              margin: 0,
                            }}
                          >
                            {JSON.stringify(payment.transaction_data, null, 2)
                              .replace(
                                /"([^"]+)":/g,
                                '<span class="json-key">"$1":</span>'
                              )
                              .replace(
                                /"([^"]+)"/g,
                                '<span class="json-string">"$1"</span>'
                              )
                              .replace(
                                /\b(\d+)\b/g,
                                '<span class="json-number">$1</span>'
                              )
                              .replace(
                                /\b(true|false)\b/g,
                                '<span class="json-boolean">$1</span>'
                              )}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
