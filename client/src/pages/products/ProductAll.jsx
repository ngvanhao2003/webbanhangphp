import React, { useEffect, useState } from "react";
import Header from "../../pages/header/Header";
import Footer from "../../pages/footer/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";

const PRODUCTS_PER_PAGE = 8;

function ProductAll() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterPrice, setFilterPrice] = useState([0, 10000000]);
  const [searchName, setSearchName] = useState("");

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("http://localhost:3000/api/products?limit=1000")
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu sản phẩm");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setProducts(data.data);

          // Lấy danh mục duy nhất
          const cats = Array.from(
            new Set(
              data.data
                .map((p) => p.category?.category_name)
                .filter(Boolean)
            )
          );
          setCategories(cats);

          // Lấy thương hiệu duy nhất
          const brs = Array.from(
            new Set(
              data.data
                .map((p) => p.brand?.name)
                .filter(Boolean)
            )
          );
          setBrands(brs);
        } else {
          setError("Không lấy được dữ liệu sản phẩm");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // useEffect lấy categories
  useEffect(() => {
    fetch("http://localhost:3000/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data.data || data))
      .catch(() => setCategories([]));
  }, []);

  const filteredProducts = products.filter((product) => {
    const productCategory = product.category?.category_name;
    const productBrand = product.brand?.name;
    // Sử dụng sale_price nếu có, ngược lại dùng price
    const priceToCompare =
      product.sale_price && product.sale_price > 0
        ? product.sale_price
        : product.price;

    // Hàm loại bỏ dấu tiếng Việt
    const removeVietnameseTones = (str) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");

    if (filterCategory && productCategory !== filterCategory) return false;
    if (filterBrand && productBrand !== filterBrand) return false;
    if (priceToCompare < filterPrice[0] || priceToCompare > filterPrice[1]) return false;
    if (
      searchName &&
      !removeVietnameseTones(product.name).toLowerCase().includes(
        removeVietnameseTones(searchName).toLowerCase()
      )
    )
      return false;
    return true;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  // Sản phẩm của trang hiện tại
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: "smooth" }); // cuộn lên đầu trang khi chuyển trang
    }
  };

  // Hàm định dạng tiền VND
  const formatCurrencyVND = (amount) => {
    if (amount == null) return "";
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  if (loading) return <p style={{ padding: "20px" }}>Đang tải sản phẩm...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>Lỗi: {error}</p>;

  return (
    <>
      <Header />
      <section id="page-header" style={{ padding: "20px 20px 10px 20px" }}>
        <h2>Trang sản phẩm</h2>
        <p>Tiết kiệm nhiều hơn với phiếu giảm giá tới 70%</p>
      </section>

      <section
        id="product-layout"
        style={{
          display: "flex",
          gap: "30px",
          padding: "0 20px 40px 20px",
          minHeight: "700px",
          boxSizing: "border-box",
        }}
      >
        {/* Bộ lọc */}
        <aside
          id="filter-section"
          style={{
            width: "280px",
            padding: "25px",
            backgroundColor: "#f8f9fa",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            height: "fit-content",
            flexShrink: 0,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <h3
            style={{
              marginBottom: "20px",
              borderBottom: "2px solid #e63946",
              paddingBottom: "8px",
              color: "#e63946",
            }}
          >
            Bộ lọc sản phẩm
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >
            <div>
              <label
                style={{
                  fontWeight: "600",
                  marginBottom: "6px",
                  display: "inline-block",
                }}
              >
                Danh mục
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={selectStyle}
              >
                <option value="">-- Tất cả --</option>
                {categories.map((cat) => (
                  <option
                    key={cat.id || cat.category_name || cat}
                    value={cat.category_name || cat}
                  >
                    {cat.category_name || cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  fontWeight: "600",
                  marginBottom: "6px",
                  display: "inline-block",
                }}
              >
                Thương hiệu
              </label>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                style={selectStyle}
              >
                <option value="">-- Tất cả --</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  fontWeight: "600",
                  marginBottom: "6px",
                  display: "inline-block",
                }}
              >
                Khoảng giá (VND)
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="number"
                  min={0}
                  value={filterPrice[0]}
                  onChange={e =>
                    setFilterPrice([Number(e.target.value), filterPrice[1]])
                  }
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Từ"
                />
                <input
                  type="number"
                  min={0}
                  value={filterPrice[1]}
                  onChange={e =>
                    setFilterPrice([filterPrice[0], Number(e.target.value)])
                  }
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Đến"
                />
              </div>
              <div style={{ fontSize: 12, color: "#888", textAlign: "center", marginTop: 4 }}>
                Từ {formatCurrencyVND(filterPrice[0])} đến {formatCurrencyVND(filterPrice[1])}
              </div>
            </div>

            <div>
              <label
                style={{
                  fontWeight: "600",
                  marginBottom: "6px",
                  display: "inline-block",
                }}
              >
                Tìm kiếm tên sản phẩm
              </label>
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </aside>

        {/* Phần sản phẩm */}
        <section
          id="product1"
          style={{
            flexGrow: 1,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {filteredProducts.length === 0 && (
            <p style={{ fontSize: "18px", color: "#777", textAlign: "center" }}>
              Không có sản phẩm phù hợp.
            </p>
          )}
          <div className="pro-container">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                className="pro"
                onClick={() =>
                  (window.location.href = `/san-pham/${product.id}`)
                }
              >
                <div className="pro-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="pro-img"
                  />
                </div>
                <div className="pro-content">
                  <span className="pro-brand">
                    {(product.brand?.name || "UNIQLO").toUpperCase()}
                  </span>
                  <h3 className="pro-name">{product.name}</h3>
                  <div className="pro-stars">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="pro-price" title={formatCurrencyVND(product.price)}>
                    {product.sale_price && product.sale_price > 0 ? (
                      <>
                        <span style={{ textDecoration: "line-through", color: "#888", marginRight: 8 }}>
                          {formatCurrencyVND(product.price)}
                        </span>
                        <span style={{ color: "#e63946", fontWeight: "bold" }}>
                          {formatCurrencyVND(product.sale_price)}
                        </span>
                      </>
                    ) : (
                      formatCurrencyVND(product.price)
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div style={paginationContainerStyle}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={paginationButtonStyle}
              >
                &laquo; Trước
              </button>

              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      ...paginationButtonStyle,
                      ...(pageNum === currentPage ? paginationButtonActiveStyle : {}),
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={paginationButtonStyle}
              >
                Tiếp &raquo;
              </button>
            </div>
          )}
        </section>
      </section>

      {/* Giữ nguyên phần newsletter như bạn muốn */}
      <section id="newsletter" className="section-p1 section-m1">
        <div className="newstext">
          <h4>Đăng ký nhận bản tin của chúng tôi</h4>
          <p>
            Nhập thông tin cập nhật qua Email về cửa hàng mới nhất của chúng tôi và{" "}
            <span>các ưu đãi đặc biệt</span>
          </p>
        </div>
        <div className="form">
          <input type="text" placeholder="Nhập địa chỉ email của bạn" />
          <button className="normal">Đăng ký</button>
        </div>
      </section>

      <Footer />

      <style>{`
        .pro-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
          justify-content: center;
        }
        @media (max-width: 1024px) {
          .pro-container {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .pro-container {
            grid-template-columns: 1fr;
          }
        }
        .pro {
          cursor: pointer;
          background-color: white;
          border-radius: 16px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          border: 1.5px solid rgba(0, 128, 0, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 380px;
          max-width: 280px;
          margin: auto;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .pro:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
        .pro-image {
          flex: 0 0 60%;
          overflow: hidden;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #fff;
        }
        .pro-img {
          max-width: 90%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 12px;
          background-color: #fff;
        }
        .pro-content {
          flex: 1 1 40%;
          padding: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .pro-brand {
          font-size: 12px;
          color: #999999;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .pro-name {
          font-weight: 700;
          font-size: 18px;
          margin: 0 0 12px 0;
          color: #222222;
          line-height: 1.3;
          min-height: 48px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .pro-stars {
          color: #f5b700;
          font-size: 16px;
          margin-bottom: 8px;
        }
        .pro-price {
          font-weight: 600;
          font-size: 14px;
          color: #666666;
          white-space: normal;
          overflow-wrap: break-word;
        }
      `}</style>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.3s",
};

const selectStyle = {
  ...inputStyle,
  appearance: "none",
  backgroundColor: "white",
  cursor: "pointer",
};

const paginationContainerStyle = {
  marginTop: "30px",
  textAlign: "center",
};

const paginationButtonStyle = {
  margin: "0 6px",
  padding: "6px 14px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  backgroundColor: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const paginationButtonActiveStyle = {
  backgroundColor: "#e63946",
  color: "white",
  border: "1px solid #e63946",
};

export default ProductAll;
