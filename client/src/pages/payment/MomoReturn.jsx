import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MomoReturn() {
  const navigate = useNavigate();

  useEffect(() => {
    // Có thể gọi API xác nhận kết quả thanh toán ở đây nếu muốn
    // Sau khi xác nhận xong, chuyển về trang chủ
    const timer = setTimeout(() => {
      navigate("/");
    }, 2000); // Chờ 2 giây cho user thấy thông báo

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <h2>Thanh toán MoMo thành công!</h2>
      <p>Bạn sẽ được chuyển về trang chủ trong giây lát...</p>
    </div>
  );
}

export default MomoReturn;