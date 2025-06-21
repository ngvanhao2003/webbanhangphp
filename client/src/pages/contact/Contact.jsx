import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from '../../pages/footer/Footer';
import Header from '../../pages/header/Header';


const Contact = () => {
  // State lưu form input
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    title: "",
    message: "",
  });

  // Xử lý khi input thay đổi
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý submit form
const handleSubmit = async (e) => {
  e.preventDefault();
  const user = localStorage.getItem("user");
  if (!user) {
    toast.warn("Bạn cần đăng nhập để gửi yêu cầu.");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
    return;
  }
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.title,
        message: formData.message,
      })
    });
    if (!res.ok) throw new Error('Lỗi khi gửi form');
    const data = await res.json();
    toast.success('Cảm ơn bạn đã gửi yêu cầu!');
    setFormData({ name: "", phone: "", email: "", title: "", message: "" });
  } catch (err) {
    toast.error('Gửi yêu cầu thất bại. Vui lòng thử lại sau.');
  }
};


  return (
    <>
      <style>{`
        #contact {
          padding: 50px 0;
          background-color: #f9f9f9;
        }
        .contact-info h2 {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }
        p {
          text-align: center;
        }
        .contact-info p {
          font-size: 18px;
          text-align: center;
          color: #666;
        }
        .contact-info .info {
          display: flex;
          justify-content: space-around;
          margin-top: 30px;
          flex-wrap: wrap;
        }
        .contact-info .info-item {
          text-align: center;
          padding: 20px;
          flex: 1 1 250px;
          min-width: 200px;
        }
        .contact-info .info-item i {
          font-size: 40px;
          color: #333;
          margin-bottom: 10px;
        }
        .contact-info .info-item h4 {
          font-size: 18px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }
        .contact-info .info-item p {
          font-size: 16px;
          color: #666;
        }
        .contact-container {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 30px;
        }
        .contact-form, .map {
          width: 48%;
          min-width: 300px;
        }
        .contact-form {
          background-color: #fff;
          padding: 30px;
          border-radius: 5px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .contact-form h2 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .contact-form .form-group {
          margin-bottom: 15px;
        }
        .contact-form label {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          display: block;
          margin-bottom: 5px;
        }
        .contact-form input,
        .contact-form textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          color: #333;
          resize: vertical;
        }
        .contact-form button {
          padding: 12px 25px;
          background-color: #007BFF;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .contact-form button:hover {
          background-color: #0056b3;
        }
        .map iframe {
          width: 100%;
          height: 100%;
          min-height: 450px;
          border-radius: 5px;
          border: none;
        }
      `}</style>
        <Header />
      <section id="contact" className="section-p1">
        <div className="contact-info">
          <h2>Thông tin liên hệ</h2>
          <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn! Dưới đây là các phương thức liên hệ với chúng tôi.</p>

          <div className="info">
            <div className="info-item">
              <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
              <h4>Địa chỉ</h4>
              <p>123 Đường XYZ, Thành phố ABC, Việt Nam</p>
            </div>
            <div className="info-item">
              <i className="fas fa-phone-alt" aria-hidden="true"></i>
              <h4>Số điện thoại</h4>
              <p>+84 123 456 789</p>
            </div>
            <div className="info-item">
              <i className="fas fa-envelope" aria-hidden="true"></i>
              <h4>Email</h4>
              <p>support@example.com</p>
            </div>
          </div>
        </div>

        <div className="contact-container">
          <div className="map" aria-label="Bản đồ Google">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.128226704916!2d106.69519511477073!3d10.82302476135021!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fa5b118d429%3A0x31135b2442e7a3f6!2zQ8O0bmcgVnQuLCBI4bqjYQ!5e0!3m2!1svi!2s!4v1618257594692!5m2!1svi!2s"
              title="Bản đồ địa chỉ"
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div className="contact-form" aria-label="Form gửi liên hệ">
            <h2>Gửi yêu cầu</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nhập tên của bạn"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Tiêu đề</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Nhập tiêu đề"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Nhập số điện thoại của bạn"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Lời nhắn</label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Viết tin nhắn của bạn ở đây..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" className="normal">Gửi yêu cầu</button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
      <ToastContainer position="top-right" autoClose={2000} />
    </>
  );
};

export default Contact;
