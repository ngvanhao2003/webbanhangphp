// ...existing code...
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../../pages/header/Header";
import Footer from "../../pages/footer/Footer";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [stockWarning, setStockWarning] = useState("");

  const [relatedProducts, setRelatedProducts] = useState([]);

  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);

  // Kiểm tra đăng nhập
  const isLoggedIn = !!localStorage.getItem("token");

  // Kiểm tra quyền đánh giá (đã mua và đã giao hàng)
  const [canReview, setCanReview] = useState(false);
  useEffect(() => {
    if (!isLoggedIn) {
      setCanReview(false);
      return;
    }
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3000/api/products/${id}/can-review`, {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => setCanReview(!!data.canReview))
      .catch(() => setCanReview(false));
  }, [id, isLoggedIn]);

  const formatCurrencyVND = (amount) =>
    amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "";

  // Lấy đánh giá sản phẩm
  const fetchReviews = () => {
    setReviewLoading(true);
    fetch(`http://localhost:3000/api/products/${id}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReviews(data.data || []);
        } else {
          setReviews([]);
        }
        setReviewLoading(false);
      })
      .catch(() => {
        setReviews([]);
        setReviewLoading(false);
      });
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:3000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          const prod = data.data;
          setProduct(prod);
          setSelectedSize(prod.variants?.[0]?.size || "");
          const categoryId = prod.category?.id || prod.category?._id || "";
          if (categoryId) {
            const queryParams = new URLSearchParams();
            queryParams.append("category_id", categoryId);
            queryParams.append("limit", "10");
            fetch(`http://localhost:3000/api/products?${queryParams.toString()}`)
              .then((res) => res.json())
              .then((relData) => {
                if (relData.success) {
                  const filtered = relData.data.filter((p) => {
                    const pCategoryId = p.category?.id || p.category?._id || "";
                    const pId = p.id || p._id;
                    return (
                      pCategoryId === categoryId &&
                      pId !== id
                    );
                  });
                  if (filtered.length > 0) {
                    setRelatedProducts(filtered.slice(0, 4));
                  } else {
                    setRelatedProducts([]);
                  }
                } else {
                  setRelatedProducts([]);
                }
              })
              .catch(() => setRelatedProducts([]));
          } else {
            setRelatedProducts([]);
          }
        } else {
          setError("Không tìm thấy sản phẩm");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Lỗi khi tải sản phẩm");
        setLoading(false);
      });
  }, [id]);

  // Lấy tồn kho của size đang chọn, trừ số lượng đã có trong cart
  const getSelectedStock = () => {
    if (!product || !product.variants) return 0;
    const found = product.variants.find((v) => v.size === selectedSize);
    if (!found) return 0;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const prodId = product.id || product._id;
    const cartItem = cart.find(
      (item) => item.id === prodId && item.selectedSize === selectedSize
    );
    if (cartItem) {
      return Math.max(0, found.stock - cartItem.quantity);
    }
    return found.stock;
  };

  useEffect(() => {
    const stock = getSelectedStock();
    if (quantity > stock) {
      setStockWarning("Không đủ hàng cho size này!");
    } else {
      setStockWarning("");
    }
  }, [selectedSize, quantity, product]);

  const handleAddToCart = () => {
    if (!product) return;
    const stock = getSelectedStock();
    if (quantity > stock) {
      setStockWarning("Không đủ hàng cho size này!");
      return;
    }
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const prodId = product.id || product._id;
    const existingIndex = cart.findIndex(
      (item) => item.id === prodId && item.selectedSize === selectedSize
    );
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: prodId,
        name: product.name,
        selectedSize,
        quantity,
        price:
          product.sale_price && product.sale_price > 0
            ? product.sale_price
            : product.price,
        image: product.image,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    toast.success(
      `Đã thêm ${quantity} sản phẩm "${product.name}" (size ${selectedSize}) vào giỏ hàng!`
    );
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Gửi đánh giá sản phẩm lên server
const handleAddFeedback = async () => {
  if (newComment.trim() === "") return;
  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("Bạn cần đăng nhập để đánh giá!");
    return;
  }
  // Đảm bảo id là ObjectId hợp lệ (24 ký tự hex)
  if (!/^[a-fA-F0-9]{24}$/.test(id)) {
    toast.error("ID sản phẩm không hợp lệ.");
    return;
  }
  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        productId: id, // Đảm bảo key là productId, đúng với backend
        rating,
        comment: newComment.trim()
      })
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Đã gửi đánh giá!");
      setNewComment("");
      setRating(5);
      // fetchReviews();
      // setCanReview(false); // Sau khi đánh giá xong, không cho đánh giá tiếp
      window.location.reload(); // Reload lại trang khi gửi đánh giá thành công
    } else {
      toast.error(data.message || "Gửi đánh giá thất bại!");
    }
  } catch (err) {
    toast.error("Lỗi khi gửi đánh giá!");
  }
};

  // Lấy đánh giá trang hiện tại
  const paginatedReviews = reviews.slice(
    (currentReviewPage - 1) * REVIEWS_PER_PAGE,
    currentReviewPage * REVIEWS_PER_PAGE
  );
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);

  // Khi có đánh giá mới hoặc thay đổi sản phẩm thì về trang 1
  useEffect(() => {
    setCurrentReviewPage(1);
  }, [reviews, id]);

  if (loading)
    return <p style={{ padding: 20, textAlign: "center" }}>Đang tải sản phẩm...</p>;
  if (error)
    return (
      <p style={{ padding: 20, color: "red", textAlign: "center" }}>{error}</p>
    );
  if (!product) return null;

  return (
    <>
      <Header />
      <div
        style={{
          maxWidth: 1000,
          margin: "30px auto",
          fontFamily: "Arial, sans-serif",
          padding: "0 15px",
        }}
      >
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          {/* Ảnh sản phẩm */}
          <div style={{ flex: "1 1 400px", minWidth: 300 }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: "100%", borderRadius: 12, objectFit: "contain" }}
            />
          </div>

          {/* Thông tin sản phẩm */}
          <div style={{ flex: "1 1 400px", minWidth: 300 }}>
            <h2>{product.name}</h2>
            <p style={{ fontStyle: "italic", color: "#555" }}>
              Thương hiệu: {product.brand?.name || "Không xác định"}
            </p>
            <p>{product.detail || product.description}</p>

            <div style={{ marginTop: 20 }}>
              <label
                style={{ fontWeight: "bold", marginRight: 8 }}
                htmlFor="selectSize"
              >
                Kích thước:
              </label>
              <select
                id="selectSize"
                value={selectedSize}
                onChange={(e) => {
                  setSelectedSize(e.target.value);
                  setQuantity(1);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              >
                {product.variants?.map((v, i) => (
                  <option key={i} value={v.size}>
                    {v.size}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 20 }}>
              <label
                style={{ fontWeight: "bold", marginRight: 8 }}
                htmlFor="quantityInput"
              >
                Số lượng:
              </label>
              <input
                id="quantityInput"
                type="number"
                min={1}
                max={getSelectedStock()}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                style={{
                  width: 60,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />
              <span style={{ marginLeft: 10, color: "#888" }}>
                (Tồn kho: {getSelectedStock()})
              </span>
              {stockWarning && (
                <div style={{ color: "red", marginTop: 6 }}>{stockWarning}</div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!!stockWarning || getSelectedStock() === 0}
              style={{
                marginTop: 30,
                backgroundColor: "#e63946",
                color: "white",
                border: "none",
                padding: "12px 24px",
                fontSize: 16,
                borderRadius: 8,
                cursor: !!stockWarning || getSelectedStock() === 0 ? "not-allowed" : "pointer",
                opacity: !!stockWarning || getSelectedStock() === 0 ? 0.6 : 1,
              }}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>

        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: 60 }}>
            <h3>Sản phẩm liên quan</h3>
            <div
              style={{
                display: "flex",
                gap: 20,
                marginTop: 12,
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              {relatedProducts.map((rp) => (
                <div
                  key={rp.id || rp._id}
                  style={{
                    width: 180,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 10,
                    cursor: "pointer",
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                  onClick={() =>
                    (window.location.href = `/san-pham/${rp.id || rp._id}`)
                  }
                >
                  <img
                    src={rp.image}
                    alt={rp.name}
                    style={{
                      width: "100%",
                      height: 150,
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                  />
                  <p style={{ marginTop: 8, fontWeight: "bold" }}>{rp.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Đánh giá khách hàng */}
        <section style={{ marginTop: 60 }}>
          <h3>Đánh giá khách hàng</h3>
          <div style={{ marginBottom: 20 }}>
            {isLoggedIn ? (
              canReview ? (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <span>Chọn số sao: </span>
                    {[1,2,3,4,5].map(star => (
                      <span
                        key={star}
                        style={{
                          cursor: "pointer",
                          color: star <= rating ? "#f39c12" : "#ccc",
                          fontSize: 22,
                          marginRight: 2
                        }}
                        onClick={() => setRating(star)}
                      >★</span>
                    ))}
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Viết phản hồi của bạn..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                    }}
                  />
                  <button
                    onClick={handleAddFeedback}
                    style={{
                      marginTop: 10,
                      backgroundColor: "#457b9d",
                      color: "white",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Gửi đánh giá
                  </button>
                </>
              ) : (
                <div style={{ color: "#888", fontStyle: "italic" }}>
                  Bạn chỉ có thể đánh giá khi đã mua và đơn hàng đã giao thành công sản phẩm này.
                </div>
              )
            ) : (
              <div style={{ color: "#888", fontStyle: "italic" }}>
                Bạn cần <span style={{ color: "#e63946", fontWeight: "bold" }}>đăng nhập</span> để gửi đánh giá.
              </div>
            )}
          </div>

          {reviewLoading ? (
              <p>Đang tải đánh giá...</p>
            ) : reviews.length === 0 ? (
              <p>Chưa có đánh giá nào.</p>
            ) : (
              <>
                {paginatedReviews.map((rv) => (
                  <div
                    key={rv._id}
                    style={{
                      borderBottom: "1px solid #ddd",
                      padding: "10px 0",
                    }}
                  >
                    <strong>
                      {rv.user_id?.username || "Ẩn danh"}
                    </strong>
                    <span style={{ marginLeft: 10, color: "#f39c12" }}>
                      {Array.from({ length: rv.rating }, (_, i) => "★").join("")}
                    </span>
                    <p style={{ margin: "6px 0" }}>{rv.comment}</p>
                  </div>
                ))}
                {totalReviewPages > 1 && (
                  <div style={{ marginTop: 16, textAlign: "center" }}>
                    <button
                      onClick={() => setCurrentReviewPage((p) => Math.max(1, p - 1))}
                      disabled={currentReviewPage === 1}
                      style={{
                        marginRight: 8,
                        padding: "4px 12px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        background: currentReviewPage === 1 ? "#eee" : "#fff",
                        cursor: currentReviewPage === 1 ? "not-allowed" : "pointer"
                      }}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalReviewPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentReviewPage(i + 1)}
                        style={{
                          margin: "0 2px",
                          padding: "4px 10px",
                          borderRadius: 4,
                          border: "1px solid #ccc",
                          background: currentReviewPage === i + 1 ? "#457b9d" : "#fff",
                          color: currentReviewPage === i + 1 ? "#fff" : "#333",
                          fontWeight: currentReviewPage === i + 1 ? "bold" : "normal",
                          cursor: "pointer"
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentReviewPage((p) => Math.min(totalReviewPages, p + 1))}
                      disabled={currentReviewPage === totalReviewPages}
                      style={{
                        marginLeft: 8,
                        padding: "4px 12px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        background: currentReviewPage === totalReviewPages ? "#eee" : "#fff",
                        cursor: currentReviewPage === totalReviewPages ? "not-allowed" : "pointer"
                      }}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            )}
        </section>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;