import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../../../services/admin.service";

export default function ContactDetail() {
  const { id } = useParams(); // Lấy id từ URL
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Thêm state để xử lý cập nhật trạng thái
  const [updatingRead, setUpdatingRead] = useState(false);
  // State cho dropdown trạng thái
  const [selectedRead, setSelectedRead] = useState(null);
  // Thêm state cho chỉnh sửa status
  const [statusDraft, setStatusDraft] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        if (!id) {
          setError("Không tìm thấy id liên hệ");
          setLoading(false);
          return;
        }

        // Gọi API để lấy chi tiết liên hệ từ backend
        const res = await adminService.get(`/api/contact/${id}`);
        // Xóa log nếu không cần thiết
        // console.log("API response:", res.data); // Kiểm tra cấu trúc dữ liệu trả về

        let contactData = null;
        if (res.data) {
          if (res.data.data) {
            contactData = res.data.data;
          } else if (res.data.contact) {
            contactData = res.data.contact;
          } else if (
            typeof res.data === "object" &&
            (res.data.name || res.data.email || res.data.phone)
          ) {
            contactData = res.data;
          } else {
            setError("Không tìm thấy dữ liệu liên hệ");
          }
        } else {
          setError("Không tìm thấy liên hệ");
        }

        if (contactData) {
          setContact(contactData);
          setSelectedRead(contactData.is_read ? "read" : "unread");
          setStatusDraft(contactData.status || "new");
        }
      } catch (err) {
        setError("Không thể tải chi tiết liên hệ");
      } finally {
        setLoading(false); // Hoàn tất việc tải dữ liệu
      }
    };

    fetchContact();
  }, [id]);

  // Hàm cập nhật trạng thái đã đọc/chưa đọc
  const handleUpdateRead = async () => {
    if (!contact) return;
    setUpdatingRead(true);
    try {
      const isRead = selectedRead === "read";
      // Gửi PATCH để cập nhật trạng thái
      await adminService.put(`/api/contact/${id}`, { is_read: isRead });
      // Sau khi cập nhật, luôn lấy lại dữ liệu mới nhất từ backend
      const res = await adminService.get(`/api/contact/${id}`);
      let updatedContact = null;
      if (res.data) {
        if (res.data.data) {
          updatedContact = res.data.data;
        } else if (res.data.contact) {
          updatedContact = res.data.contact;
        } else if (
          typeof res.data === "object" &&
          (res.data.name || res.data.email || res.data.phone)
        ) {
          updatedContact = res.data;
        }
      }
      if (updatedContact) {
        setContact(updatedContact);
        setSelectedRead(updatedContact.is_read ? "read" : "unread");
      }
    } catch (err) {
      // Có thể hiển thị thông báo lỗi nếu muốn
    } finally {
      setUpdatingRead(false);
    }
  };

  // Hàm cập nhật trạng thái status
  const handleUpdateStatus = async () => {
    if (!contact) return;
    if (statusDraft === contact.status) return;
    setUpdatingStatus(true);
    try {
      // Gửi PATCH với status là string
      await adminService.put(`/api/contact/${id}`, { status: String(statusDraft) });
      // Lấy lại dữ liệu mới nhất
      const res = await adminService.get(`/api/contact/${id}`);
      let updatedContact = null;
      if (res.data) {
        if (res.data.data) {
          updatedContact = res.data.data;
        } else if (res.data.contact) {
          updatedContact = res.data.contact;
        } else if (
          typeof res.data === "object" &&
          (res.data.name || res.data.email || res.data.phone)
        ) {
          updatedContact = res.data;
        }
      }
      if (updatedContact) {
        setContact(updatedContact);
        setStatusDraft(updatedContact.status || "new");
      }
    } catch (err) {
      // Hiển thị lỗi chi tiết từ backend (nếu có)
      let msg = "Cập nhật trạng thái thất bại!";
      if (err?.response?.data?.message) {
        msg += " " + err.response.data.message;
      } else if (err?.message) {
        msg += " " + err.message;
      }
      alert(msg);
      // Log chi tiết lỗi ra console để debug
      console.error("/api/contact/:id error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Nếu đang tải dữ liệu
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  // Nếu có lỗi
  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  // Nếu không tìm thấy liên hệ
  if (!contact) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
        Không tìm thấy liên hệ
      </div>
    );
  }

  return (
    <div
      className="container-xl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        padding: "32px 0",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 32,
          maxWidth: 600,
          margin: "40px auto",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>
          Chi tiết liên hệ
        </h2>
        <div style={{ marginBottom: 18 }}>
          <strong>Họ tên:</strong> <span>{contact.name}</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <strong>Điện thoại:</strong> <span>{contact.phone}</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <strong>Email:</strong> <span>{contact.email}</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <strong>Tiêu đề:</strong> <span>{contact.subject}</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <strong>Nội dung:</strong>
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: 8,
              padding: 16,
              marginTop: 6,
              whiteSpace: "pre-line", // Giữ nguyên định dạng dòng trong nội dung
            }}
          >
            {contact.message}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <strong>Trạng thái:</strong>{" "}
          <span
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              background:
                contact.status === "read"
                  ? "#dcfce7"
                  : contact.status === "replied"
                  ? "#e0e7ff"
                  : contact.status === "archived"
                  ? "#f3f4f6"
                  : "#fee2e2",
              color:
                contact.status === "read"
                  ? "#16a34a"
                  : contact.status === "replied"
                  ? "#6366f1"
                  : contact.status === "archived"
                  ? "#64748b"
                  : "#ef4444",
              marginRight: 12,
            }}
          >
            {contact.status === "new"
              ? "Chưa đọc"
              : contact.status === "read"
              ? "Đã đọc"
              : contact.status === "replied"
              ? "Đã phản hồi"
              : contact.status === "archived"
              ? "Đã lưu trữ"
              : "Không xác định"}
          </span>
          <select
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            style={{ marginRight: 8, padding: "4px 8px", borderRadius: 6 }}
          >
            <option value="new">Chưa đọc</option>
            <option value="read">Đã đọc</option>
            <option value="replied">Đã phản hồi</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <button
            className="btn btn-sm btn-success"
            onClick={handleUpdateStatus}
            disabled={updatingStatus || statusDraft === contact.status}
          >
            {updatingStatus ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
        <div style={{ marginBottom: 18 }}>
          <strong>Ngày gửi:</strong>{" "}
          <span>
            {contact.created_at
              ? new Date(contact.created_at).toLocaleString("vi-VN")
              : contact.createdAt
              ? new Date(contact.createdAt).toLocaleString("vi-VN")
              : ""}
          </span>
        </div>
        <button
          className="btn btn-secondary"
          style={{ marginTop: 16 }}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}
