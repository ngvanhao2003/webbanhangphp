import React, { useState, useEffect } from "react";
import Header from "../../pages/header/Header";
import Footer from "../../pages/footer/Footer";

function Profile() {
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    gender: "Nam",
    dob: "",
    avatar: null,
  });
  const [originalData, setOriginalData] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success !== false) {
          const user = data.user || data;
          const userData = {
            full_name: user.full_name || "",
            phone: user.phone || "",
            email: user.email || "",
            address: user.address || "",
            gender: user.gender || "Nam",
            dob: user.dob ? user.dob.slice(0, 10) : "",
            avatar: user.avatar || null,
          };
          setFormData(userData);
          setOriginalData(userData);
          setPreviewAvatar(user.avatar || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  function getChangedFields(newData, original) {
    const changed = {};
    for (const key in newData) {
      // So sánh đơn giản (đối với avatar có thể cần xử lý riêng)
      // Nếu avatar là file thì luôn coi là thay đổi
      if (key === "avatar") {
        if (newData.avatar && newData.avatar !== original.avatar) {
          changed.avatar = newData.avatar;
        }
      } else {
        if (newData[key] !== original[key]) {
          changed[key] = newData[key];
        }
      }
    }
    return changed;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("User chưa đăng nhập");
      return;
    }
    setLoading(true);

    const changedData = getChangedFields(formData, originalData);

    if (Object.keys(changedData).length === 0) {
      alert("Bạn chưa thay đổi thông tin nào.");
      setLoading(false);
      return;
    }

    // Nếu có avatar là file, bạn cần gửi formData, ví dụ ở đây chưa hỗ trợ upload ảnh
    // Bạn có thể xử lý upload ảnh riêng biệt

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedData),
      });
      const data = await res.json();
      if (data.success === false) {
        alert("Cập nhật thất bại: " + (data.message || "Lỗi server"));
      } else {
        alert("Cập nhật thành công");
        setOriginalData(formData);
      }
    } catch (error) {
      alert("Lỗi khi cập nhật thông tin");
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <img
            src={
              previewAvatar
                ? (typeof previewAvatar === "string"
                  ? previewAvatar
                  : URL.createObjectURL(previewAvatar))
                : "https://via.placeholder.com/120?text=Avatar"
            }
            alt="Avatar"
            style={styles.avatar}
          />
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={styles.name}>{formData.full_name || "Chưa có tên"}</div>
            <div style={styles.email}>{formData.email || "Chưa có email"}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.title}>Thông tin cá nhân</h2>

          <div style={styles.inputGroupFull}>
            <label>Họ và tên</label>
            <input
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Họ và tên"
              style={styles.input}
              autoComplete="off"
              required
            />
          </div>

          <div style={styles.inputGroupFull}>
            <label>Số điện thoại</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Số điện thoại"
              style={styles.input}
              autoComplete="off"
            />
          </div>

          <div style={styles.inputGroupFull}>
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              style={styles.input}
              autoComplete="off"
            />
          </div>

          <div style={styles.inputGroupFull}>
            <label>Địa chỉ</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Địa chỉ"
              style={styles.input}
              autoComplete="off"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label>Giới tính</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={styles.select}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label>Ngày sinh</label>
              <input
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroupFull}>
            <label>Chọn ảnh đại diện</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={styles.fileInput}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "40px auto",
    display: "flex",
    gap: 40,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  leftPanel: {
    flex: "0 0 180px",
    textAlign: "center",
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  name: {
    fontWeight: "700",
    fontSize: 18,
    marginTop: 8,
  },
  email: {
    fontSize: 14,
    marginTop: 6,
    color: "#555",
    fontStyle: "italic",
  },
  form: {
    flex: "1 1 auto",
  },
  title: {
    marginBottom: 20,
    fontWeight: "700",
    fontSize: 20,
    borderBottom: "2px solid #4caf50",
    paddingBottom: 6,
    color: "#4caf50",
  },
  row: {
    display: "flex",
    gap: 20,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  inputGroupFull: {
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "8px 12px",
    fontSize: 14,
    borderRadius: 4,
    border: "1px solid #ccc",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  select: {
    padding: "8px 12px",
    fontSize: 14,
    borderRadius: 4,
    border: "1px solid #ccc",
    outline: "none",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
  },
  fileInput: {
    cursor: "pointer",
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: "#1976d2",
    color: "#fff",
    padding: "10px 22px",
    fontSize: 16,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "700",
    display: "block",
    marginLeft: "auto",
  },
};

export default Profile;
