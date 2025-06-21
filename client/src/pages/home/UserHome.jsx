import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import '../../assets/style.css';
import Footer from '../../pages/footer/Footer';
import Header from '../../pages/header/Header';
import axios from '../../axios';

function HomePage() {
  const [newestProducts, setNewestProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);

  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [errorBanners, setErrorBanners] = useState(null);

  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [loadingBestSelling, setLoadingBestSelling] = useState(true);
  const [errorBestSelling, setErrorBestSelling] = useState(null);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ loading: false, error: null, success: null });

  // Lấy sản phẩm bán chạy từ order
  useEffect(() => {
    async function fetchBestSellingProducts() {
      setLoadingBestSelling(true);
      setErrorBestSelling(null);
      try {
        const response = await axios.get('/api/orders/best-selling?limit=8');
        if (!response.data || !response.data.success) {
          throw new Error(response.data?.error || "Dữ liệu trả về không hợp lệ");
        }
        setBestSellingProducts(response.data.data || []);
      } catch (error) {
        setErrorBestSelling('Lỗi khi tải sản phẩm bán chạy: ' + (error.message || error));
      } finally {
        setLoadingBestSelling(false);
      }
    }
    fetchBestSellingProducts();
  }, []);

  // Lấy sản phẩm mới nhất
  useEffect(() => {
    async function fetchNewestProducts() {
      setLoadingProducts(true);
      setErrorProducts(null);
      try {
        const response = await axios.get('/api/products?limit=8&status=1');
        if (!response.data || !response.data.success) {
          throw new Error("Dữ liệu trả về không hợp lệ");
        }
        let products = response.data.data || [];
        products = products
        .filter(product => product.status === 1)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setNewestProducts(products.slice(0, 8));
      } catch (error) {
        setErrorProducts('Lỗi khi tải sản phẩm mới nhất.');
        console.error(error);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchNewestProducts();
  }, []);

  // Lấy banner
  useEffect(() => {
    async function fetchBanner() {
      try {
        const response = await fetch('/api/banners');
        if (!response.ok) {
          throw new Error('Không thể lấy dữ liệu banner');
        }
        const data = await response.json();
        setBanners(data);
      } catch (error) {
        setErrorBanners(error.message);
      } finally {
        setLoadingBanners(false);
      }
    }
    fetchBanner();
  }, []);

  const formatCurrencyVND = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setNewsletterStatus({ loading: true, error: null, success: null });
    try {
      // Gửi email đăng ký lên server (giả sử endpoint là /api/newsletter)
      const response = await axios.post('/api/newsletter', { email: newsletterEmail });
      if (response.data && response.data.success) {
        setNewsletterStatus({ loading: false, error: null, success: 'Đăng ký thành công!' });
        setNewsletterEmail('');
      } else {
        throw new Error(response.data?.error || 'Đăng ký thất bại');
      }
    } catch (error) {
      setNewsletterStatus({ loading: false, error: error.message || 'Đăng ký thất bại', success: null });
    }
  };

  // Lọc banner theo vị trí
  const firstBanner = banners.find((banner) => banner.position === 1);
  const TwoBanner = banners.find((banner) => banner.position === 2);
  const ThreeBanner = banners.find((banner) => banner.position === 3);
  const FourBanner = banners.find((banner) => banner.position === 4);
  const FiveBanner = banners.find((banner) => banner.position === 5);
  const SixBanner = banners.find((banner) => banner.position === 6);

  return (
    <>
      <Header />
      {/* Banner chính */}
      {loadingBanners ? (
        <p>Đang tải banner...</p>
      ) : errorBanners ? (
        <p style={{ color: 'red' }}>{errorBanners}</p>
      ) : firstBanner ? (
        <section id="hero"
            key={firstBanner.id}
            style={{
              backgroundImage: `url(${firstBanner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
            <h4>{firstBanner.title}</h4>
            <h2>Ưu đãi siêu giá trị</h2>
            <h1>Trên tất cả sản phẩm</h1>
            <p>Tiết kiệm nhiều hơn với phiếu giảm giá & giảm giá tới 70%</p>
            <Link to={'/san-pham'}><button>Mua ngay</button></Link>
        </section>
      ) : (
        <p>Không có banner với position = 1.</p>
      )}

      {/* Sản phẩm mới nhất */}
      <section id="product1" className="section-p1">
        <h2>Sản phẩm mới nhất</h2>
        <p>Bộ Sưu Tập Mùa Hè Thiết Kế Hiện Đại</p>
        {loadingProducts ? (
          <p>Đang tải sản phẩm mới nhất...</p>
        ) : errorProducts ? (
          <p style={{ color: 'red' }}>{errorProducts}</p>
        ) : (
          <div className="pro-container">
            {newestProducts
            .map((product) => (
              <Link
                key={product.id || product._id}
                to={`/san-pham/${product.id || product._id}`}
                className="pro"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  src={
                    product.image && product.image.startsWith('http')
                      ? product.image
                      : `http://localhost:3000${product.image}`
                  }
                  alt={product.name}
                  style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
                  maxWidth: '200px',
                  maxHeight: '200px',
                  margin: '0 auto'
                }}
                />
                <div className="des">
                  <span>{product.brand?.name || 'Thương hiệu'}</span>
                  <h5>{product.name}</h5>
                  <div className="star">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                  <h4>
                    {product.sale_price && product.sale_price > 0 ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>
                          {formatCurrencyVND(product.price)}
                        </span>
                        <span style={{ color: '#e60023', fontWeight: 'bold' }}>
                          {formatCurrencyVND(product.sale_price)}
                        </span>
                      </>
                    ) : (
                      formatCurrencyVND(product.price)
                    )}
                  </h4>
                </div>
                <div className="cart-icon">
                  <FontAwesomeIcon icon={faCartPlus} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Banner nhỏ */}
      <section id="banner" className="section-1">
        <h4>Dịch vụ sửa chữa</h4>
        <h2>
          Lên đến <span>Giảm 70%</span> - Tất cả áo phông và phụ kiện
        </h2>
        <button className="normal">Tìm hiểu thêm</button>
      </section>

      {/* Sản phẩm bán chạy */}
<section id="product1" className="section-p1">
  <h2>Sản phẩm bán chạy</h2>
  <p>Top sản phẩm được mua nhiều nhất</p>
  {loadingBestSelling ? (
    <p>Đang tải sản phẩm bán chạy...</p>
  ) : errorBestSelling ? (
    <p style={{ color: 'red' }}>{errorBestSelling}</p>
  ) : bestSellingProducts.length === 0 ? (
    <p>Không có sản phẩm bán chạy.</p>
  ) : (
    <div className="pro-container">
      {bestSellingProducts.map((product) => (
        <Link
          key={product.id || product._id}
          to={`/san-pham/${product.id || product._id}`}
          className="pro"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <img
            src={product.image && product.image.startsWith('http') ? product.image : `http://localhost:3000${product.image}`}
            alt={product.name}
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              maxWidth: '200px',
              maxHeight: '200px',
              margin: '0 auto',
            }}
          />
          <div className="des">
            <span>{product.brand?.name || 'Thương hiệu'}</span>
            <h5>{product.name}</h5>
            <div className="star">
              {[...Array(5)].map((_, i) => (
                <i key={i} className="fas fa-star"></i>
              ))}
            </div>
            <h4>
              {product.sale_price && product.sale_price > 0 ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 8 }}>
                    {formatCurrencyVND(product.price)}
                  </span>
                  <span style={{ color: '#e60023', fontWeight: 'bold' }}>
                    {formatCurrencyVND(product.sale_price)}
                  </span>
                </>
              ) : (
                formatCurrencyVND(product.price)
              )}
            </h4>
          </div>
          <div className="cart-icon">
            <FontAwesomeIcon icon={faCartPlus} />
          </div>
        </Link>
      ))}
    </div>
  )}
</section>

      {/* Banner phụ */}
      <section id="sm-banner" className="section-p1">
        {loadingBanners ? (
          <p>Đang tải banner...</p>
        ) : errorBanners ? (
          <p style={{ color: 'red' }}>{errorBanners}</p>
        ) : (
          <>
            {TwoBanner && (
              <div className="banner-box"
                key={TwoBanner.id}
                style={{
                  backgroundImage: `url(${TwoBanner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                <h4>Ưu đãi</h4>
                <h2>{TwoBanner.title}</h2>
                <span>{TwoBanner.description}</span>
                <button className="white">Tìm hiểu thêm</button>
              </div>
            )}

            {ThreeBanner && (
              <div className="banner-box banner-box2"
                key={ThreeBanner.id}
                style={{
                  backgroundImage: `url(${ThreeBanner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                <h4>Mùa hè rực rỡ</h4>
                <h2>{ThreeBanner.title}</h2>
                <span>{ThreeBanner.description}</span>
                <button className="white">Tìm hiểu thêm</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Banner cuối */}
      <section id="banner3">
        {loadingBanners ? (
          <p>Đang tải banner...</p>
        ) : errorBanners ? (
          <p style={{ color: 'red' }}>{errorBanners}</p>
        ) : (
          <>
            {FourBanner && (
              <div className="banner-box"
                key={FourBanner.id}
                style={{
                  backgroundImage: `url(${FourBanner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  <h2>MÙA QUẦN ÁO</h2>
                  <h3>Bộ sưu tập mùa đông GIẢM 50%</h3>
              </div>
            )}

            {FiveBanner && (
              <div className="banner-box2"
                key={FiveBanner.id}
                style={{
                  backgroundImage: `url(${FiveBanner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                <h2>MÙA QUẦN ÁO</h2>
                <h3>Xuân / Hè</h3>
              </div>
            )}

            {SixBanner && (
              <div className="banner-box3"
                key={SixBanner.id}
                style={{
                  backgroundImage: `url(${SixBanner.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                <h2>ÁO PHÔNG</h2>
                <h3>Bản in đẹp</h3>
              </div>
            )}
          </>
        )}
      </section>

      {/* Đăng ký nhận tin */}
      <section id="newsletter" className="section-p1 section-m1">
        <div className="newstext">
          <h4>Đăng ký nhận bản tin của chúng tôi</h4>
          <p>
            Nhập thông tin cập nhật qua Email về cửa hàng mới nhất của chúng tôi
            và <span>các ưu đãi đặc biệt</span>
          </p>
        </div>
        <form className="form" onSubmit={handleNewsletterSubmit} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="email"
            placeholder="Nhập địa chỉ email của bạn"
            value={newsletterEmail}
            onChange={e => setNewsletterEmail(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button className="normal" type="submit" disabled={newsletterStatus.loading}>
            {newsletterStatus.loading ? 'Đang gửi...' : 'Đăng ký'}
          </button>
        </form>
        {newsletterStatus.error && (
          <div style={{ color: 'red', marginTop: 8 }}>{newsletterStatus.error}</div>
        )}
        {newsletterStatus.success && (
          <div style={{ color: 'green', marginTop: 8 }}>{newsletterStatus.success}</div>
        )}
      </section>
      <Footer />
    </>
  );
}

export default HomePage;