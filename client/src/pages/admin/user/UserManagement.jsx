import React, { useEffect, useState } from "react";
import adminService from "../../../services/admin.service";
import { Link, useNavigate } from "react-router-dom";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    customerUsers: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await adminService.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersList = Array.isArray(res.data)
        ? res.data
        : res.data.users || [];
      setUsers(usersList);

      // Calculate stats
      const totalUsers = usersList.length;
      const activeUsers = usersList.filter((user) => user.status === 1).length;
      const adminUsers = usersList.filter(
        (user) => user.role === "admin"
      ).length;
      const customerUsers = usersList.filter(
        (user) => user.role === "customer" || user.role === "client"
      ).length;

      setStats({
        totalUsers,
        activeUsers,
        adminUsers,
        customerUsers,
      });
    } catch (err) {
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await adminService.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUsers = users.filter((u) => u.id !== id);
      setUsers(updatedUsers);

      // Update stats after deletion
      const totalUsers = updatedUsers.length;
      const activeUsers = updatedUsers.filter(
        (user) => user.status === 1
      ).length;
      const adminUsers = updatedUsers.filter(
        (user) => user.role === "admin"
      ).length;
      const customerUsers = updatedUsers.filter(
        (user) => user.role === "customer" || user.role === "client"
      ).length;

      setStats({
        totalUsers,
        activeUsers,
        adminUsers,
        customerUsers,
      });
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  // Chuyển sang trang chỉnh sửa riêng biệt
  const handleEditClick = (user) => {
    navigate(`/admin/user/${user.id}/edit`);
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
          Quản lý Người dùng
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
            <span style={{ fontSize: 28, marginRight: 8 }}>👥</span> Tổng quan
            Người dùng
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Quản lý và theo dõi tài khoản người dùng
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý tài khoản người dùng trong hệ thống. Bạn có thể
            thêm, sửa, xóa và quản lý trạng thái các tài khoản.
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
                👤
              </span>{" "}
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng người dùng</div>
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
              <span role="img" aria-label="active">
                ✅
              </span>{" "}
              {stats.activeUsers}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>
              Người dùng kích hoạt
            </div>
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
              <span role="img" aria-label="admin">
                🔑
              </span>{" "}
              {stats.adminUsers}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Quản trị viên</div>
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
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="customers">
                👨‍👩‍👧‍👦
              </span>{" "}
              {stats.customerUsers}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Khách hàng</div>
          </div>
        </div>

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <h3
              style={{
                fontWeight: 700,
                fontSize: 20,
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 20 }}>📋</span> Danh sách người dùng
            </h3>
            <Link
              to="/admin/user/add"
              className="btn"
              style={{
                background:
                  "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "10px 20px",
                fontWeight: 600,
                fontSize: 15,
                boxShadow: "0 4px 14px rgba(79, 172, 254, 0.4)",
                transition: "all 0.2s",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "translateY(-2px)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <i className="fas fa-user-plus"></i> Thêm người dùng
            </Link>
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
                Đang tải dữ liệu người dùng...
              </p>
            </div>
          ) : error ? (
            <div
              className="alert alert-danger"
              style={{
                padding: 16,
                borderRadius: 12,
                background: "#fee2e2",
                color: "#ef4444",
                fontSize: 16,
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
                    <th
                      style={{
                        padding: 16,
                        textAlign: "left",
                        borderTopLeftRadius: 12,
                      }}
                    >
                      Avatar
                    </th>
                    <th style={{ padding: 16, textAlign: "left" }}>
                      Tên đăng nhập
                    </th>
                    <th style={{ padding: 16, textAlign: "left" }}>Họ tên</th>
                    <th style={{ padding: 16, textAlign: "left" }}>Email</th>
                    <th style={{ padding: 16, textAlign: "left" }}>Vai trò</th>
                    <th style={{ padding: 16, textAlign: "left" }}>
                      Trạng thái
                    </th>
                    <th
                      style={{
                        padding: 16,
                        textAlign: "center",
                        borderTopRightRadius: 12,
                      }}
                    >
                      Chức năng
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          padding: 32,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            color: "#64748b",
                            fontWeight: 500,
                          }}
                        >
                          Không có người dùng nào
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#94a3b8",
                            marginTop: 8,
                          }}
                        >
                          Hãy thêm người dùng mới bằng nút "Thêm người dùng"
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        style={{
                          verticalAlign: "middle",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                          transition: "background 0.2s",
                          "&:hover": {
                            background: "#f8fafc",
                          },
                        }}
                      >
                        <td style={{ padding: "16px 12px" }}>
                          <img
                            src={
                              user.avatar || "/images/users/default-avatar.png"
                            }
                            alt="avatar"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              objectFit: "cover",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                            }}
                          />
                        </td>
                        <td style={{ padding: "16px 12px", fontWeight: 500 }}>
                          {user.username}
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          {user.full_name}
                        </td>
                        <td style={{ padding: "16px 12px" }}>{user.email}</td>
                        <td style={{ padding: "16px 12px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 12px",
                              borderRadius: 12,
                              fontSize: 14,
                              fontWeight: 500,
                              background:
                                user.role === "admin"
                                  ? "#e0f2fe"
                                  : user.role === "editor"
                                  ? "#fef3c7"
                                  : "#f0fdf4",
                              color:
                                user.role === "admin"
                                  ? "#0284c7"
                                  : user.role === "editor"
                                  ? "#d97706"
                                  : "#16a34a",
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: "16px 12px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 12px",
                              borderRadius: 12,
                              fontSize: 14,
                              fontWeight: 500,
                              background:
                                user.status === 1 ? "#dcfce7" : "#fee2e2",
                              color: user.status === 1 ? "#16a34a" : "#ef4444",
                            }}
                          >
                            {user.status === 1 ? "Kích hoạt" : "Vô hiệu hóa"}
                          </span>
                        </td>
                        <td
                          style={{ padding: "16px 12px", textAlign: "center" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(user);
                              }}
                              title="Chỉnh sửa"
                              style={{
                                background:
                                  "linear-gradient(135deg, #5b86e5 0%, #36d1c4 100%)",
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
                                boxShadow: "0 4px 10px rgba(91, 134, 229, 0.2)",
                                transition: "transform 0.15s",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(-2px)")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(0)")
                              }
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(user.id);
                              }}
                              title="Xóa"
                              style={{
                                background:
                                  "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
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
                                boxShadow: "0 4px 10px rgba(255, 88, 88, 0.2)",
                                transition: "transform 0.15s",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(-2px)")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(0)")
                              }
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
