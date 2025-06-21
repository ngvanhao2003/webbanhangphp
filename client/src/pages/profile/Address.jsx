import React from "react";
import Header from "../../pages/header/Header";
import Footer from "../../pages/footer/Footer";

const addresses = [
  {
    id: 1,
    fullName: "Đỗ Tấn Thành Thành",
    phone: "+844762216048",
    address: "2123123",
  },
  {
    id: 2,
    fullName: "dqw",
    phone: "eqweq",
    address: "123213",
  },
];

function AddressList() {
  return (
    <>
    <Header />
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Địa Chỉ Của Tôi</h2>
        <button style={styles.addButton}>+ Thêm Địa Chỉ Mới</button>
      </div>

      <div>
        {addresses.map(({ id, fullName, phone, address }) => (
          <div key={id} style={styles.addressCard}>
            <div style={styles.addressInfo}>
              <p><strong>Họ Và Tên</strong> {fullName}</p>
              <p><strong>Số Điện Thoại</strong> {phone}</p>
              <p><strong>Địa Chỉ</strong> {address}</p>
            </div>
            <div style={styles.actions}>
              <button style={styles.linkButton}>Sửa</button>
              <button style={{ ...styles.linkButton, marginLeft: 12, color: "#c00" }}>Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
    <Footer />
    </>
  );
}

const styles = {
  container: {
    maxWidth: 700,
    margin: "20px auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontWeight: "700",
    fontSize: 20,
  },
  addButton: {
    backgroundColor: "#f36f21",
    border: "none",
    color: "#fff",
    padding: "8px 16px",
    fontWeight: "700",
    borderRadius: 4,
    cursor: "pointer",
  },
  addressCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #ddd",
    padding: "12px 0",
  },
  addressInfo: {
    lineHeight: 1.6,
    fontSize: 14,
  },
  actions: {
    display: "flex",
    alignItems: "center",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#2196f3",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: 14,
    padding: 0,
  },
};

export default AddressList;
