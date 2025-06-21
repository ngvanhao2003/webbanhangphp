import React from "react";
import { Link } from 'react-router-dom';
import '../../assets/style.css';
import logo from '../../assets/img/logo.jpg';
import app from '../../assets/img/pay/app.jpg';
import play from '../../assets/img/pay/play.jpg';
import pay from '../../assets/img/pay/pay.png';

function Footer() {
    return (
        <>
            <footer id="section-p1">
                <div className="col">
                    <img src={logo} className="logo"/>
                    <h4>Thông tin Liên Hệ</h4>
                    <p><strong>Địa chỉ: </strong>VietNam, HCM, Quan 2</p>
                    <p><strong>Số điện thoại: </strong>+393300293039 / (+81) 30 0393 3933</p>
                    <p><strong>Giờ làm việc: </strong>10:00 - 18:00, Thứ 2 - Thứ 7</p>
                    <div className="follow">
                        <h4>Theo chúng tôi</h4>
                        <div className="icon">
                            <i className="fab fa-facebook-f"></i>
                            <i className="fab fa-twitter"></i>
                            <i className="fab fa-instagram"></i>
                            <i className="fab fa-pinterest-p"></i>
                            <i className="fab fa-youtube"></i>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <h4>Liên Hệ</h4>
                    <a href="#">Về chúng tôi</a>
                    <a href="#">Thông tin giao hàng</a>
                    <a href="#">Chính sách bảo mật</a>
                    <a href="#">Điều khoản & Điều kiện</a>
                    <a href="#">Liên hệ chúng tôi</a>
                </div>
                <div className="col">
                    <h4>Tài khoản của tôi</h4>
                    <a href="#">Đằng nhập</a>
                    <a href="#">Xem giỏ hàng</a>
                    <a href="#">Sản phẩm yêu thích</a>
                    <a href="#">Theo dõi đơn hàng của chúng tôi</a>
                    <a href="#">Hỗ trợ</a>
                </div>
                <div className="col install">
                    <h4>Tải ứng dụng</h4>
                    <p>Từ App Store hoặc Google Play</p>
                    <div className="row">
                        <img src={app} alt=""/>
                        <img src={play} alt=""/>
                    </div>
                    <p>Cổng thanh toán</p>
                    <img src={pay} alt=""/>
                </div>
                <div className="copyright">
                    <p>© 2025, Nguyễn Văn Hào</p>
                </div>
            </footer>
        </>
    );
}

export default Footer;
