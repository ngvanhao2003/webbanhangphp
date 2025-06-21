import React from "react";
import Footer from '../../pages/footer/Footer';
import Header from '../../pages/header/Header';
import shop from '../../assets/img/h.png';
const About = () => {
  return (
    <>
      <style>{`
        #about {
          padding: 50px 0;
          background-color: #f9f9f9;
        }

        #about h2 {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }

        #about p {
          font-size: 18px;
          color: #666;
          text-align: center;
        }

        .about-info {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .about-info .info-item {
          text-align: center;
          flex: 1 1 30%;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          min-width: 250px;
        }

        .about-info .info-item i {
          font-size: 40px;
          color: #007bff;
          margin-bottom: 20px;
        }

        .about-info .info-item h4 {
          font-size: 22px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }

        .about-info .info-item p {
          font-size: 16px;
          color: #666;
        }

        .about-img {
          text-align: center;
          margin-top: 40px;
        }

        .about-img img {
          width: 80%;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          height: auto;
        }

        .about-description {
          margin-top: 40px;
          font-size: 18px;
          color: #333;
          text-align: justify;
          max-width: 900px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }
      `}</style>
        <Header />
      <section id="about" className="section-p1">
        <h2>Giới thiệu về chúng tôi</h2>
        <p>
          Chúng tôi là một cửa hàng thời trang trực tuyến chuyên cung cấp các bộ
          sưu tập quần áo đa dạng và phong cách, mang lại cho khách hàng những
          sản phẩm chất lượng với giá cả hợp lý.
        </p>

        <div className="about-info">
          <div className="info-item">
            <i className="fas fa-tshirt" aria-hidden="true"></i>
            <h4>Chất lượng sản phẩm</h4>
            <p>
              Chúng tôi luôn cam kết mang đến những sản phẩm thời trang chất lượng
              nhất, được chọn lọc từ các nhà cung cấp uy tín.
            </p>
          </div>
          <div className="info-item">
            <i className="fas fa-handshake" aria-hidden="true"></i>
            <h4>Dịch vụ tận tâm</h4>
            <p>
              Chúng tôi luôn đặt khách hàng lên hàng đầu, cung cấp dịch vụ hỗ trợ
              và chăm sóc khách hàng tận tình, chu đáo.
            </p>
          </div>
          <div className="info-item">
            <i className="fas fa-shipping-fast" aria-hidden="true"></i>
            <h4>Vận chuyển nhanh chóng</h4>
            <p>
              Chúng tôi cung cấp dịch vụ giao hàng nhanh chóng và an toàn đến mọi
              miền tổ quốc.
            </p>
          </div>
        </div>

        <div className="about-img">
          <img
            src={shop}
            alt="Cửa hàng thời trang"
            loading="lazy"
          />
        </div>

        <div className="about-description">
          <p>
            Tại cửa hàng của chúng tôi, bạn sẽ tìm thấy những bộ sưu tập quần áo
            thời trang từ các thương hiệu nổi tiếng, được cập nhật thường xuyên để
            đáp ứng xu hướng mới nhất. Bên cạnh đó, chúng tôi cũng cung cấp nhiều
            sản phẩm độc đáo và sáng tạo, phù hợp với từng cá tính và phong cách
            riêng biệt.
          </p>
          <p>
            Với mục tiêu mang lại cho khách hàng sự hài lòng tuyệt đối, chúng tôi
            luôn cố gắng không ngừng để nâng cao chất lượng sản phẩm, dịch vụ, và
            trải nghiệm mua sắm trực tuyến. Hãy đến với chúng tôi và khám phá những
            bộ sưu tập tuyệt vời đang chờ đón bạn!
          </p>
        </div>
      </section>
        <Footer />
    </>
  );
};

export default About;
