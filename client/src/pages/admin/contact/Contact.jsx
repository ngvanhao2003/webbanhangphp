import React, { useEffect, useState } from "react";
import Footer from "../footer/Footer";
import adminService from "../../../services/admin.service";
import { Link, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx"; // Thêm thư viện XLSX

export default function Contact() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalContacts: 0,
    newContacts: 0,
    readContacts: 0,
    respondedContacts: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 5; // 5 bài trên 1 trang
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await adminService.get('/api/contact');
        console.log("API response:", res.data); // Kiểm tra dữ liệu trả về

        // Ưu tiên lấy đúng trường chứa mảng liên hệ
        let data = [];
        if (Array.isArray(res.data)) {
          data = res.data;
        } else if (Array.isArray(res.data.contacts)) {
          data = res.data.contacts;
        } else if (Array.isArray(res.data.data)) {
          data = res.data.data;
        } else {
          data = [];
        }
        setContacts(data);

        // Update stats using the new 'status' field
        const totalContacts = data.length;
        const newContacts = data.filter(
          (contact) => contact.status === 'new' || contact.status === undefined
        ).length;
        const readContacts = data.filter(
          (contact) => contact.status === 'read'
        ).length;
        const respondedContacts = data.filter(
          (contact) => contact.status === 'replied'
        ).length;

        setStats({
          totalContacts,
          newContacts,
          readContacts,
          respondedContacts,
        });
      } catch (err) {
        setError("Không thể tải dữ liệu liên hệ");
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  // Export ra Excel
  const handleExportToExcel = () => {
    if (!contacts || contacts.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      contacts.map((contact, idx) => ({
        "STT": idx + 1,
        "Họ tên": contact.name,
        "Điện thoại": contact.phone,
        "Email": contact.email,
        "Tiêu đề": contact.subject,
        "Nội dung": contact.message,
        "Trạng thái":
          contact.status === 'new'
            ? "Chưa đọc"
            : contact.status === 'read'
            ? "Đã đọc"
            : contact.status === 'replied'
            ? "Đã phản hồi"
            : contact.status === 'archived'
            ? "Đã lưu trữ"
            : "Không xác định",
        "Đã phản hồi": contact.status === 'replied' ? "Đã phản hồi" : "Chưa phản hồi",
        "Ngày gửi": contact.created_at
          ? new Date(contact.created_at).toLocaleString("vi-VN")
          : (contact.createdAt ? new Date(contact.createdAt).toLocaleString("vi-VN") : ""),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh_sach_lien_he");
    XLSX.writeFile(wb, "Contact_List.xlsx");
  };

  // Function handlers for the buttons (nếu muốn dùng sau này)
  const handleToggleRead = (contactId) => {};
  const handleViewDetails = (contactId) => {
    navigate(`/admin/contact/${contactId}`);
  };
  const handleReply = (contactId) => {};
  const handleDelete = async (contactId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) return;
    try {
      await adminService.delete(`/api/contact/${contactId}`);
      setContacts((prev) => prev.filter((c) => c._id !== contactId && c.id !== contactId));
      setStats((prev) => ({
        ...prev,
        totalContacts: prev.totalContacts - 1,
      }));
    } catch (err) {
      alert("Xóa liên hệ thất bại!");
    }
  };

  // Phân trang: lấy dữ liệu cho trang hiện tại
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  // Ensure contacts is always an array before slicing
  const currentContacts = Array.isArray(contacts)
    ? contacts.slice(indexOfFirstContact, indexOfLastContact)
    : [];
  const totalPages = Math.ceil((Array.isArray(contacts) ? contacts.length : 0) / contactsPerPage);

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
          Quản lý Liên hệ
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
            <span style={{ fontSize: 28, marginRight: 8 }}>📞</span> Tổng quan
            Liên hệ
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Quản lý và phản hồi các yêu cầu liên hệ
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý liên hệ trong hệ thống. Bạn có thể xem, phản
            hồi và quản lý trạng thái các tin nhắn liên hệ từ khách hàng.
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
              <span role="img" aria-label="total">
                📊
              </span>{" "}
              {stats.totalContacts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng số liên hệ</div>
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
              <span role="img" aria-label="new">
                🔔
              </span>{" "}
              {stats.newContacts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Liên hệ mới</div>
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
              <span role="img" aria-label="read">
                👁️
              </span>{" "}
              {stats.readContacts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Đã đọc</div>
          </div>
          <div
            className="dashboard-stat-card"
            style={{
              flex: "1 1 200px",
              background: "linear-gradient(135deg, #ff8008 0%, #ffc837 100%)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(255, 128, 8, 0.12)",
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
              <span role="img" aria-label="responded">
                ✅
              </span>{" "}
              {stats.respondedContacts}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Đã phản hồi</div>
          </div>
        </div>

        <div className="dashboard-main-content mb-5">
          <section
            style={{
              background: "white",
              borderRadius: 18,
              padding: 32,
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <h2
                style={{ fontWeight: 700, fontSize: 24, marginBottom: 0 }}
                className="mb-0"
              >
                Danh sách Liên hệ
              </h2>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                }}
              >
                <button
                  onClick={handleExportToExcel}
                  className="btn btn-success"
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    backgroundColor: "#28a745",
                    borderRadius: 8,
                    padding: "6px 12px",
                    color: "#fff",
                    marginLeft: "10px"
                  }}
                >
                  Xuất Excel
                </button>
              </div>
            </div>
            <div className="dashboard-table-wrapper mt-4">
              <div className="dashboard-table">
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 32,
                    }}
                  >
                    <div className="spinner-border text-primary" role="status"></div>
                    <span className="ml-2">Đang tải...</span>
                  </div>
                ) : error ? (
                  <div
                    style={{
                      padding: 24,
                      background: "#fee2e2",
                      color: "#ef4444",
                      borderRadius: 8,
                      fontWeight: 500,
                    }}
                  >
                    {error}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table
                      className="table table-hover"
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 15,
                      }}
                    >
                      <thead
                        style={{
                          background: "linear-gradient(90deg, #e6f7ff, #f0f7ff)",
                        }}
                      >
                        <tr>
                          <th className="text-center" style={{ padding: 16, width: "30px", borderTopLeftRadius: 12 }}>
                            <input type="checkbox" />
                          </th>
                          <th style={{ padding: 16 }}>Họ tên</th>
                          <th style={{ padding: 16 }}>Điện thoại</th>
                          <th style={{ padding: 16 }}>Email</th>
                          <th style={{ padding: 16 }}>Tiêu đề</th>
                          <th style={{ padding: 16 }}>Trạng thái</th>
                          <th className="text-center" style={{ padding: 16, width: "200px", borderTopRightRadius: 12 }}>
                            Chức năng
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentContacts && currentContacts.length > 0 ? (
                          currentContacts.map((item, idx) => (
                            <tr
                              key={item._id || item.id || `contact-${idx}`}
                              style={{
                                borderBottom: "1px solid #f0f0f0",
                                transition: "background 0.2s",
                                "&:hover": {
                                  background: "#f8fafc",
                                },
                              }}
                            >
                              <td className="text-center" style={{ padding: "16px 12px" }}>
                                <input type="checkbox" value={item._id} name="checkId[]" />
                              </td>
                              <td style={{ padding: "16px 12px" }}>{item.name}</td>
                              <td style={{ padding: "16px 12px" }}>{item.phone}</td>
                              <td style={{ padding: "16px 12px" }}>{item.email}</td>
                              <td style={{ padding: "16px 12px" }}>{item.subject}</td>
                              <td style={{ padding: "16px 12px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "6px 12px",
                                    borderRadius: 12,
                                    fontSize: 14,
                                    fontWeight: 500,
                                    background:
                                      item.status === 'read'
                                        ? "#dcfce7"
                                        : item.status === 'replied'
                                        ? "#e0e7ff"
                                        : item.status === 'archived'
                                        ? "#f3f4f6"
                                        : "#fee2e2",
                                    color:
                                      item.status === 'read'
                                        ? "#16a34a"
                                        : item.status === 'replied'
                                        ? "#6366f1"
                                        : item.status === 'archived'
                                        ? "#64748b"
                                        : "#ef4444",
                                  }}
                                >
                                  {item.status === 'new'
                                    ? "Chưa đọc"
                                    : item.status === 'read'
                                    ? "Đã đọc"
                                    : item.status === 'replied'
                                    ? "Đã phản hồi"
                                    : item.status === 'archived'
                                    ? "Đã lưu trữ"
                                    : "Không xác định"}
                                </span>
                              </td>
                              <td className="text-center" style={{ padding: "16px 12px" }}>
                                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                  {/* Nút xem, xóa, v.v... giữ nguyên */}
                                  <button
                                    type="button"
                                    title="Xem chi tiết"
                                    style={{
                                      background: "#8b5cf6",
                                      border: "none",
                                      color: "#fff",
                                      borderRadius: 12,
                                      width: 40,
                                      height: 40,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 16,
                                      cursor: "pointer",
                                      boxShadow: "0 4px 10px rgba(139, 92, 246, 0.2)",
                                      transition: "transform 0.15s",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                    onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                                    onClick={() => handleViewDetails(item._id)}
                                  >
                                    <i className="far fa-eye"></i>
                                  </button>
                                  <button
                                    type="button"
                                    title="Xóa"
                                    style={{
                                      background: "#f43f5e",
                                      border: "none",
                                      color: "#fff",
                                      borderRadius: 12,
                                      width: 40,
                                      height: 40,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: 16,
                                      cursor: "pointer",
                                      boxShadow: "0 4px 10px rgba(244, 63, 94, 0.2)",
                                      transition: "transform 0.15s",
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                    onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                                    onClick={() => handleDelete(item._id)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center" style={{ padding: 32 }}>
                              <div style={{ fontSize: 18, color: "#64748b", fontWeight: 500 }}>
                                Không có dữ liệu liên hệ
                              </div>
                              <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                                Chưa có khách hàng nào gửi yêu cầu liên hệ
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    {/* PHÂN TRANG */}
                    {contacts.length > contactsPerPage && (
                      <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                        <nav>
                          <ul className="pagination">
                            <li className={`page-item${currentPage === 1 ? " disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                &laquo;
                              </button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                              <li
                                key={i}
                                className={`page-item${currentPage === i + 1 ? " active" : ""}`}
                              >
                                <button
                                  className="page-link"
                                  onClick={() => setCurrentPage(i + 1)}
                                >
                                  {i + 1}
                                </button>
                              </li>
                            ))}
                            <li className={`page-item${currentPage === totalPages ? " disabled" : ""}`}>
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                &raquo;
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    )}
                    {/* HẾT PHÂN TRANG */}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
