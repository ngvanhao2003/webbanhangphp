import React, { useEffect, useState } from "react";
import axios from "../../../axios";
import { useParams, useNavigate } from "react-router-dom";

const BannerEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id || id === "undefined") {
      setError("Không tìm thấy banner");
      setLoading(false);
      return;
    }
    const fetch = async () => {
      setLoading(true);
      try {
        // Nếu id là số hoặc chuỗi hợp lệ thì mới gọi API
        const res = await axios.get(`/api/banners/${id}`);
        // Nếu không có dữ liệu hoặc trả về null/undefined thì báo lỗi
        if (!res.data || res.data === null) {
          setError("Không tìm thấy banner");
          setBanner(null);
        } else {
          // Map API fields to form fields
          const apiData = res.data;
          setBanner({
            ...apiData,
            // Map the field names for the form
            image: apiData.image_url || "",
            link: apiData.link_url || "",
          });
          setError(null);
        }
      } catch (err) {
        setError("Không tìm thấy banner");
        setBanner(null);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    setBanner({ ...banner, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convert form fields to match the API expectations
      const apiData = {
        title: banner.title,
        image_url: banner.image,
        link_url: banner.link,
        position: banner.position,
        status: banner.status,
      };

      await axios.put(`/api/banners/${id}`, apiData);
      alert("Cập nhật banner thành công!");
      navigate("/admin/banner");
    } catch (err) {
      alert("Cập nhật thất bại!");
    }
    setSaving(false);
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!banner) return null;

  return (
    <div
      className="admin-banner-edit-page"
      style={{ padding: 24, maxWidth: 500, margin: "0 auto" }}
    >
      <h2 style={{ marginBottom: 24 }}>Chỉnh sửa Banner</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px #f0f1f2",
          padding: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <label>Tiêu đề</label>
          <input
            name="title"
            value={banner.title || ""}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Link</label>
          <input
            name="link"
            value={banner.link || ""}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Hình ảnh (URL)</label>
          <input
            name="image"
            value={banner.image || ""}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <img
            src={banner.image}
            alt="banner"
            style={{ maxWidth: 200, maxHeight: 100, borderRadius: 4 }}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginLeft: 12 }}
          onClick={() => navigate("/admin/banner")}
        >
          Quay lại
        </button>
      </form>
    </div>
  );
};

export default BannerEditPage;
