import React, { useState, useEffect, useCallback, useRef } from "react";
import Footer from "../footer/Footer";
import { Link } from "react-router-dom";
import axios from "../../../axios";
import { toast } from "react-toastify"; // Thêm dòng này

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    parentCategories: 0,
  });

  // For creating/editing category
  const [categoryData, setCategoryData] = useState({
    id: null,
    name: "",
    slug: "",
    parent_id: "",
    image: null,
    status: 1,
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter states
  const [filterName, setFilterName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Import/Export loading state
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      let url = "/api/categories";
      if (showTrash) {
        url += "?deleted=true";
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Map dữ liệu từ API sang đúng định dạng cho component
      const mapped = (response.data || []).map((item) => ({
        id: item.id,
        name: item.category_name, // API trả về category_name
        slug: item.slug,
        parent_id: item.parent || "", // parent là ObjectId (string) hoặc ''
        image_url: item.image_url || "",
        status: Number(item.status),
        description: item.description || "",
        sort_order: item.sort_order,
        created_at: item.created_at,
      }));
      setCategories(mapped);

      // Calculate stats
      const totalCategories = mapped.length;
      const activeCategories = mapped.filter((cat) => cat.status === 1).length;
      const inactiveCategories = mapped.filter(
        (cat) => cat.status === 0
      ).length;
      const parentCategories = mapped.filter(
        (cat) => cat.parent_id === ""
      ).length;

      setStats({
        totalCategories,
        activeCategories,
        inactiveCategories,
        parentCategories,
      });

      if (!mapped.length) {
        console.warn("API /api/categories trả về:", response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Không thể tải danh mục sản phẩm. Vui lòng thử lại sau.");
      setLoading(false);
    }
  }, [showTrash]);

  // Update the stats when deleting or restoring categories
  const updateStats = (updatedCategories) => {
    const totalCategories = updatedCategories.length;
    const activeCategories = updatedCategories.filter(
      (cat) => cat.status === 1
    ).length;
    const inactiveCategories = updatedCategories.filter(
      (cat) => cat.status === 0
    ).length;
    const parentCategories = updatedCategories.filter(
      (cat) => cat.parent_id === ""
    ).length;

    setStats({
      totalCategories,
      activeCategories,
      inactiveCategories,
      parentCategories,
    });
  };

  // Load categories on component mount and when dependencies change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset to first page when categories or trash view changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categories, showTrash]);

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setCategoryData({
        ...categoryData,
        [name]: files[0],
      });
    } else if (name === "name" && !isEditing) {
      // Auto-generate slug when typing name (only for new categories)
      setCategoryData({
        ...categoryData,
        name: value,
        slug: generateSlug(value),
      });
    } else {
      setCategoryData({
        ...categoryData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryData.name) {
      alert("Tên danh mục là bắt buộc!");
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem("adminToken");

      // Prepare category data for API
      const formattedData = {
        category_name: categoryData.name,
        slug: categoryData.slug,
        sort_order: categoryData.sort_order || 1,
        parent: categoryData.parent_id || "",
        status: parseInt(categoryData.status),
        description: categoryData.description || "",
      };

      let response;

      if (isEditing) {
        // Update existing category
        response = await axios.put(
          `/api/categories/${categoryData.id}`,
          formattedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Show success message
        alert("Cập nhật danh mục thành công!");
      } else {
        // Create new category
        response = await axios.post("/api/categories", formattedData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Show success message
        alert("Tạo danh mục mới thành công!");
      }

      // Reset form and refresh categories
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Không thể lưu danh mục. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setCategoryData({
      id: null,
      name: "",
      slug: "",
      parent_id: "",
      image: null,
      status: 1,
      description: "",
    });
    setIsEditing(false);
  };

  // Set form for editing
  const handleEdit = (category) => {
    setCategoryData({
      id: category.id,
      name: category.name || "",
      slug: category.slug || "",
      parent_id: category.parent_id || "",
      image: null, // Don't set image, allow user to upload new one if needed
      status: category.status || 1,
      description: category.description || "",
    });
    setIsEditing(true);
  };

  // Toggle trash view
  const toggleTrash = () => {
    setShowTrash(!showTrash);
    resetForm();
    setSelectedCategories([]);
    setSelectAll(false);
  };

  // Handle checkbox selection
  const handleSelectCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Handle select all checkboxes
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categories.map((category) => category.id));
    }
    setSelectAll(!selectAll);
  };

  // Open delete confirmation modal
  const openDeleteModal = (categoryId = null) => {
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setShowDeleteModal(false);
  };

  // Delete categories
  // const handleDelete = async () => {
  //   try {
  //     setProcessing(true);
  //     const token = localStorage.getItem("adminToken");

  //     const idToDelete = categoryToDelete;

  //     if (!idToDelete) {
  //       alert("Vui lòng chọn một danh mục để xóa");
  //       setProcessing(false);
  //       return;
  //     }

  //     // Use the RESTful DELETE endpoint
  //     await axios.delete(`/api/categories/${idToDelete}`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     closeDeleteModal();

  //     // Update local state
  //     const updatedCategories = categories.filter(
  //       (cat) => cat.id !== idToDelete
  //     );
  //     setCategories(updatedCategories);
  //     setSelectedCategories([]);

  //     // Update stats
  //     updateStats(updatedCategories);

  //     // Show success message
  //     alert("Danh mục đã được xóa thành công!");
  //   } catch (error) {
  //     console.error("Error deleting category:", error);
  //     alert("Không thể xóa danh mục. Vui lòng thử lại.");
  //   } finally {
  //     setProcessing(false);
  //   }
  // };
  const handleDelete = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("adminToken");

      if (!categoryToDelete) {
        alert("Vui lòng chọn danh mục để xóa");
        setProcessing(false);
        return;
      }

      await axios.delete(`/api/categories/${categoryToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Xóa khỏi state ngay để cập nhật UI
      const updatedCategories = categories.filter(cat => cat.id !== categoryToDelete);
      setCategories(updatedCategories);
      setSelectedCategories([]);
      updateStats(updatedCategories);

      toast.success("Danh mục đã được xóa vĩnh viễn!"); // Sử dụng toast thay cho alert
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Không thể xóa danh mục. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };


  // Restore categories from trash
  const handleRestore = async (categoryId = null) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("adminToken");

      const idsToRestore = categoryId ? [categoryId] : selectedCategories;

      if (idsToRestore.length === 0) {
        alert("Vui lòng chọn ít nhất một danh mục để khôi phục");
        setProcessing(false);
        return;
      }

      await axios.post(
        `/api/categories/restore`,
        { categoryIds: idsToRestore },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Fetch fresh data after restore
      fetchCategories();
      setSelectedCategories([]);
    } catch (error) {
      console.error("Error restoring categories:", error);
      alert("Không thể khôi phục danh mục. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  // Toggle category status
  const handleToggleStatus = async (categoryId, currentStatus) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("adminToken");

      await axios.patch(
        `/api/categories/${categoryId}/status`,
        { status: currentStatus === 1 ? 0 : 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update status in the local state
      const updatedCategories = categories.map((category) =>
        category.id === categoryId
          ? { ...category, status: category.status === 1 ? 0 : 1 }
          : category
      );

      setCategories(updatedCategories);

      // Update stats
      updateStats(updatedCategories);
    } catch (error) {
      console.error("Error toggling category status:", error);
      alert("Không thể cập nhật trạng thái danh mục. Vui lòng thử lại.");
    } finally {
      setProcessing(false);
    }
  };

  // Build hierarchical tree of categories for select dropdown
  const buildCategoryOptions = (cats, parentId = "", level = 0) => {
    const result = [];

    const indent = Array(level).fill("\u00A0\u00A0\u00A0\u00A0").join("");

    cats
      .filter((c) => c.parent_id === parentId)
      .forEach((category) => {
        result.push(
          <option key={category.id} value={category.id}>
            {indent}
            {level > 0 ? "└ " : ""}
            {category.name}
          </option>
        );

        result.push(...buildCategoryOptions(cats, category.id, level + 1));
      });

    return result;
  };

  // Format category table with proper hierarchy for display
  const formatCategoryDisplay = (cats, parentId = "", level = 0) => {
    const result = [];

    cats
      .filter((c) => c.parent_id === parentId)
      .forEach((category) => {
        result.push({
          ...category,
          displayName: `${Array(level)
            .fill("\u00A0\u00A0\u00A0\u00A0")
            .join("")}${level > 0 ? "└ " : ""}${category.name}`,
          level,
        });

        result.push(...formatCategoryDisplay(cats, category.id, level + 1));
      });

    return result;
  };

  // Filter logic
  const filteredCategories = formatCategoryDisplay(categories).filter(cat => {
    const matchName = filterName.trim() === "" || cat.name.toLowerCase().includes(filterName.trim().toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && cat.status === 1) ||
      (filterStatus === "unpublished" && cat.status === 0);
    return matchName && matchStatus;
  });

  // Pagination logic
  const allDisplayCategories = filteredCategories;
  const totalPages = Math.ceil(allDisplayCategories.length / itemsPerPage);
  const paginatedCategories = allDisplayCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryName = (id) => {
    if (id === "") return "None";
    const category = categories.find((cat) => cat.id === id);
    return category ? category.name : "Unknown";
  };

  // Export Excel handler
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get("/api/categories/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      // Kiểm tra nếu backend trả về lỗi dạng JSON thay vì file Excel
      const contentType = response.headers["content-type"];
      if (
        contentType &&
        (contentType.includes("application/json") || contentType.includes("text/plain"))
      ) {
        // Đọc lỗi từ blob
        const text = await response.data.text();
        let message = "Xuất file thất bại!";
        try {
          const json = JSON.parse(text);
          if (json && json.message) message = json.message;
        } catch {}
        alert(message);
        return;
      }

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "categories.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Xuất file thất bại! Vui lòng kiểm tra lại API hoặc kết nối mạng.");
    } finally {
      setExporting(false);
    }
  };

  // Import Excel handler
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setImporting(true);
      const token = localStorage.getItem("adminToken");
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("/api/categories/import", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Nhập file thành công!"); // Thông báo ở đầu trang
      fetchCategories();
    } catch (err) {
      toast.error("Nhập file thất bại!"); // Thông báo ở đầu trang
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="dashboard-wrapper"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        padding: "32px 0",
      }}
    >
      <div className="container-xl">
        <h1
          className="dashboard-title"
          style={{
            fontWeight: 800,
            fontSize: 40,
            marginBottom: 24,
            letterSpacing: 1,
          }}
        >
          Quản lý Danh mục
        </h1>

        <div
          className="dashboard-welcome-card"
          style={{
            background: "linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%)",
            color: "#fff",
            borderRadius: 18,
            padding: 32,
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(44, 62, 80, 0.12)",
          }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 28,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 28, marginRight: 8 }}>📂</span> Tổng quan
            Danh mục
          </h2>
          <div style={{ fontSize: 18, marginBottom: 8 }}>
            Quản lý và theo dõi các danh mục sản phẩm
          </div>
          <div style={{ fontSize: 15, opacity: 0.9 }}>
            Đây là trang quản lý danh mục sản phẩm trong hệ thống. Bạn có thể
            thêm, sửa, xóa và quản lý trạng thái các danh mục.
          </div>
          <div style={{ fontSize: 13, marginTop: 12, opacity: 0.8 }}>
            Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
          </div>
        </div>

        <div
          className="dashboard-stats-row"
          style={{
            display: "flex",
            gap: 24,
            marginBottom: 32,
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <div
            className="dashboard-stat-card"
            style={{
              flex: "1 1 200px",
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(67, 233, 123, 0.12)",
              minWidth: 220,
              marginRight: 8,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="total">
                📊
              </span>{" "}
              {stats.totalCategories}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Tổng danh mục</div>
          </div>

          <div
            className="dashboard-stat-card"
            style={{
              flex: "1 1 200px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(102, 126, 234, 0.12)",
              minWidth: 220,
              marginRight: 8,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="active">
                ✅
              </span>{" "}
              {stats.activeCategories}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Danh mục xuất bản</div>
          </div>

          <div
            className="dashboard-stat-card"
            style={{
              flex: "1 1 200px",
              background: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(247, 151, 30, 0.12)",
              minWidth: 220,
              marginRight: 8,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="inactive">
                ⏸️
              </span>{" "}
              {stats.inactiveCategories}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>
              Danh mục chưa xuất bản
            </div>
          </div>

          <div
            className="dashboard-stat-card"
            style={{
              flex: "1 1 200px",
              background: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
              color: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 16px rgba(249, 83, 198, 0.12)",
              minWidth: 220,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "scale(1.04)")
            }
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              <span role="img" aria-label="parent">
                📁
              </span>{" "}
              {stats.parentCategories}
            </div>
            <div style={{ fontSize: 15, opacity: 0.9 }}>Danh mục gốc</div>
          </div>
        </div>

        <div className="wrapper">
          <section className="content-header">
            <div className="container-fluid">
              <div className="row mb-2">
                <div className="col-sm-6">
                  <h1>Quản lý danh mục</h1>
                </div>
                <div className="col-sm-6">
                  <ol className="breadcrumb float-sm-right">
                    <li className="breadcrumb-item">
                      <Link to="/admin">Home</Link>
                    </li>
                    <li className="breadcrumb-item active">Danh mục</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="card">
              <div
                className="card-header d-flex justify-content-between align-items-center bg-white border-bottom mb-2"
                style={{
                  borderRadius: "0.5rem 0.5rem 0 0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div>
                  <h2 className="h4 mb-0 font-weight-bold text-primary">
                    <i className="fas fa-list-alt mr-2"></i>Quản lý danh mục
                  </h2>
                </div>
              </div>
              <div
                className="card-body p-4"
                style={{
                  background: "#f8f9fa",
                  borderRadius: "0 0 0.5rem 0.5rem",
                }}
              >
                {/* --- IMPORT/EXPORT BUTTONS START --- */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 12 }}>
                  <button
                    className="btn"
                    style={{
                      background: "#27ae60",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "8px 20px",
                      fontWeight: 600,
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      position: "relative",
                    }}
                    onClick={handleExportExcel}
                    disabled={exporting}
                  >
                    <i className="fas fa-download"></i> Export
                    {exporting && (
                      <span className="spinner-border spinner-border-sm ml-2" role="status" />
                    )}
                  </button>
                  <button
                    className="btn"
                    style={{
                      background: "#16a085",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "8px 20px",
                      fontWeight: 600,
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      position: "relative",
                    }}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={importing}
                  >
                    <i className="fas fa-upload"></i> Import
                    {importing && (
                      <span className="spinner-border spinner-border-sm ml-2" role="status" />
                    )}
                  </button>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImportExcel}
                  />
                </div>
                {/* --- IMPORT/EXPORT BUTTONS END --- */}

                {/* --- FILTER BAR START --- */}
                <div
                  className="row mb-3"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 600 }}>🔍 Search</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <label htmlFor="filterName" style={{ fontWeight: 500, marginBottom: 0 }}>
                        Category name
                      </label>
                      <input
                        id="filterName"
                        type="text"
                        className="form-control"
                        style={{ width: 180, borderRadius: 8, padding: "4px 10px" }}
                        placeholder="Enter name..."
                        value={filterName}
                        onChange={e => setFilterName(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <label htmlFor="filterStatus" style={{ fontWeight: 500, marginBottom: 0 }}>
                        Published
                      </label>
                      <select
                        id="filterStatus"
                        className="form-control"
                        style={{ width: 120, borderRadius: 8, padding: "4px 10px" }}
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All</option>
                        <option value="published">Published</option>
                        <option value="unpublished">Unpublished</option>
                      </select>
                    </div>
                    <button
                      className="btn"
                      style={{
                        background: "#3498db",
                        color: "#fff",
                        borderRadius: 8,
                        padding: "6px 18px",
                        fontWeight: 600,
                        marginLeft: 8,
                        border: "none",
                      }}
                      onClick={() => {
                        setFilterName("");
                        setFilterStatus("all");
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                {/* --- FILTER BAR END --- */}

                <div className="row mb-4">
                  <div className="col-md-4">
                    <div
                      className="card shadow-sm"
                      style={{
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "none",
                      }}
                    >
                      <div
                        className="card-header"
                        style={{
                          background:
                            "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                          color: "#fff",
                          padding: "16px",
                          borderBottom: "none",
                        }}
                      >
                        <h3
                          style={{ fontSize: 18, fontWeight: 600, margin: 0 }}
                        >
                          {isEditing
                            ? "Cập nhật danh mục"
                            : "Thêm danh mục mới"}
                        </h3>
                      </div>
                      <div className="card-body p-4">
                        <form onSubmit={handleSubmit}>
                          <div className="form-group mb-3">
                            <label
                              htmlFor="name"
                              style={{
                                fontWeight: 500,
                                marginBottom: 8,
                                display: "block",
                              }}
                            >
                              Tên danh mục{" "}
                              <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="name"
                              name="name"
                              value={categoryData.name}
                              onChange={handleInputChange}
                              style={{ borderRadius: 8, padding: "10px 12px" }}
                              required
                            />
                          </div>

                          <div className="form-group mb-3">
                            <label
                              htmlFor="slug"
                              style={{
                                fontWeight: 500,
                                marginBottom: 8,
                                display: "block",
                              }}
                            >
                              Slug
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="slug"
                              name="slug"
                              value={categoryData.slug}
                              onChange={handleInputChange}
                              style={{ borderRadius: 8, padding: "10px 12px" }}
                            />
                            <small className="form-text text-muted">
                              Để trống để tự động tạo từ tên
                            </small>
                          </div>

                          <div className="form-group mb-3">
                            <label
                              htmlFor="parent_id"
                              style={{
                                fontWeight: 500,
                                marginBottom: 4,
                                display: "block",
                              }}
                            >
                              Danh mục cha
                            </label>
                            <select
                              className="form-control"
                              id="parent_id"
                              name="parent_id"
                              value={categoryData.parent_id}
                              onChange={handleInputChange}
                              style={{ borderRadius: 8, padding: "5px 12px" }}
                            >
                              <option value="">-- Không có --</option>
                              {buildCategoryOptions(categories)}
                            </select>
                          </div>

                          <div className="form-group mb-3">
                            <label
                              htmlFor="status"
                              style={{
                                fontWeight: 500,
                                marginBottom: 8,
                                display: "block",
                              }}
                            >
                              Trạng thái
                            </label>
                            <select
                              className="form-control"
                              id="status"
                              name="status"
                              value={categoryData.status}
                              onChange={handleInputChange}
                              style={{ borderRadius: 8, padding: "5px 12px" }}
                            >
                              <option value="1">Xuất bản</option>
                              <option value="0">Chưa xuất bản</option>
                            </select>
                          </div>

                          <div className="form-group mb-3">
                            <label
                              htmlFor="description"
                              style={{
                                fontWeight: 500,
                                marginBottom: 8,
                                display: "block",
                              }}
                            >
                              Mô tả
                            </label>
                            <textarea
                              className="form-control"
                              id="description"
                              name="description"
                              rows="3"
                              value={categoryData.description}
                              onChange={handleInputChange}
                              style={{ borderRadius: 8, padding: "10px 12px" }}
                            ></textarea>
                          </div>

                          <div className="d-flex mt-4">
                            <button
                              type="submit"
                              className="btn"
                              disabled={processing}
                              style={{
                                background:
                                  "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                                color: "#fff",
                                fontWeight: 600,
                                borderRadius: 8,
                                padding: "10px 20px",
                                border: "none",
                                marginRight: 10,
                              }}
                            >
                              {processing ? (
                                <>
                                  <span
                                    className="spinner-border spinner-border-sm mr-2"
                                    role="status"
                                    aria-hidden="true"
                                  ></span>
                                  <span>Đang xử lý...</span>
                                </>
                              ) : (
                                <>{isEditing ? "Cập nhật" : "Thêm"} danh mục</>
                              )}
                            </button>

                            {isEditing && (
                              <button
                                type="button"
                                className="btn"
                                onClick={resetForm}
                                style={{
                                  background: "#f1f5f9",
                                  color: "#64748b",
                                  fontWeight: 600,
                                  borderRadius: 8,
                                  padding: "10px 20px",
                                  border: "none",
                                }}
                              >
                                Hủy
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-8">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 24,
                      }}
                    >
                      <h3
                        style={{
                          fontWeight: 700,
                          fontSize: 20,
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>📋</span>{" "}
                        {showTrash ? "Thùng rác" : "Danh sách danh mục"}
                      </h3>

                      {selectedCategories.length > 0 && (
                        <div className="btn-group">
                          {showTrash ? (
                            <>
                              <button
                                className="btn"
                                onClick={() => handleRestore()}
                                disabled={processing}
                                style={{
                                  background:
                                    "linear-gradient(135deg, #5b86e5 0%, #36d1c4 100%)",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 12,
                                  padding: "8px 16px",
                                  fontWeight: 600,
                                  fontSize: 15,
                                  cursor: "pointer",
                                  boxShadow:
                                    "0 4px 10px rgba(91, 134, 229, 0.2)",
                                  marginRight: 8,
                                  transition: "transform 0.15s",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.transform =
                                    "translateY(-2px)")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.transform =
                                    "translateY(0)")
                                }
                              >
                                <i className="fas fa-trash-restore mr-1"></i>{" "}
                                Khôi phục ({selectedCategories.length})
                              </button>
                              <button
                                className="btn"
                                onClick={() => openDeleteModal()}
                                disabled={processing}
                                style={{
                                  background:
                                    "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 12,
                                  padding: "8px 16px",
                                  fontWeight: 600,
                                  fontSize: 15,
                                  cursor: "pointer",
                                  boxShadow:
                                    "0 4px 10px rgba(255, 88, 88, 0.2)",
                                  transition: "transform 0.15s",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.transform =
                                    "translateY(-2px)")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.transform =
                                    "translateY(0)")
                                }
                              >
                                <i className="fas fa-trash mr-1"></i> Xóa vĩnh
                                viễn ({selectedCategories.length})
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn"
                              onClick={() => openDeleteModal()}
                              disabled={processing}
                              style={{
                                background:
                                  "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
                                color: "#fff",
                                border: "none",
                                borderRadius: 12,
                                padding: "8px 16px",
                                fontWeight: 600,
                                fontSize: 15,
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(255, 88, 88, 0.2)",
                                transition: "transform 0.15s",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(-2px)")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(0)")
                              }
                            >
                              <i className="fas fa-trash mr-1"></i> Xóa đã chọn
                              ({selectedCategories.length})
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {loading ? (
                      <div className="text-center py-5">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                          style={{ width: 48, height: 48 }}
                        >
                          <span className="sr-only">Đang tải...</span>
                        </div>
                        <p
                          className="mt-3"
                          style={{ fontSize: 18, color: "#64748b" }}
                        >
                          Đang tải dữ liệu danh mục...
                        </p>
                      </div>
                    ) : error ? (
                      <div
                        className="alert alert-danger"
                        style={{
                          padding: 16,
                          borderRadius: 12,
                          background: "#fee2e2",
                          color: "#ef4444",
                          fontSize: 16,
                        }}
                      >
                        {error}
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table
                          className="table table-hover"
                          style={{
                            borderRadius: 12,
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 15,
                          }}
                        >
                          <thead
                            style={{
                              background:
                                "linear-gradient(90deg, #e6f7ff, #f0f7ff)",
                            }}
                          >
                            <tr>
                              <th
                                className="text-center"
                                style={{
                                  padding: 16,
                                  width: "30px",
                                  borderTopLeftRadius: 12,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectAll}
                                  onChange={handleSelectAll}
                                />
                              </th>
                              {/* <th
                                className="text-center"
                                style={{ padding: 16, width: "80px", textAlign: 'center' }}
                              >
                                Hình
                              </th> */}
                              <th style={{ padding: 16, textAlign: 'center' }}>Tên danh mục</th>
                              <th style={{ padding: 16, textAlign: 'center' }}>Danh mục cha</th>
                              <th style={{ padding: 16, textAlign: 'center' }}>Slug</th>
                              <th
                                className="text-center"
                                style={{ padding: 16, width: "120px" }}
                              >
                                Trạng thái
                              </th>
                              <th
                                className="text-center"
                                style={{
                                  padding: 16,
                                  width: "180px",
                                  borderTopRightRadius: 12,
                                }}
                              >
                                Chức năng
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedCategories.length > 0 ? (
                              paginatedCategories.map(
                                (category) => (
                                  <tr
                                    key={category.id}
                                    style={{
                                      borderBottom: "1px solid #f0f0f0",
                                      transition: "background 0.2s",
                                      "&:hover": {
                                        background: "#f8fafc",
                                      },
                                    }}
                                  >
                                    <td
                                      className="text-center"
                                      style={{ padding: "16px 12px" }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(
                                          category.id
                                        )}
                                        onChange={() =>
                                          handleSelectCategory(category.id)
                                        }
                                      />
                                    </td>
                                    {/* <td
                                      className="text-center"
                                      style={{ padding: "16px 12px" }}
                                    >
                                      <img
                                        src={
                                          category.image_url ||
                                          "/images/categories/default.png"
                                        }
                                        alt={category.name}
                                        style={{
                                          width: 50,
                                          height: 50,
                                          borderRadius: 8,
                                          objectFit: "cover",
                                          background: "#f8fafc",
                                          boxShadow:
                                            "0 2px 8px rgba(0,0,0,0.05)",
                                        }}
                                      />
                                    </td> */}
                                    <td
                                      style={{ padding: "16px 12px", textAlign: 'center' }}
                                      dangerouslySetInnerHTML={{
                                        __html: category.displayName,
                                      }}
                                    ></td>
                                    <td style={{ padding: "16px 12px", textAlign: 'center' }}>
                                      {getCategoryName(category.parent_id)}
                                    </td>
                                    <td style={{ padding: "16px 12px", textAlign: 'center' }}>
                                      {category.slug}
                                    </td>
                                    <td
                                      className="text-center"
                                      style={{ padding: "16px 12px" }}
                                    >
                                      <span
                                        style={{
                                          display: "inline-block",
                                          padding: "6px 12px",
                                          borderRadius: 12,
                                          fontSize: 14,
                                          fontWeight: 500,
                                          background:
                                            category.status === 1
                                              ? "#dcfce7"
                                              : "#fee2e2",
                                          color:
                                            category.status === 1
                                              ? "#16a34a"
                                              : "#ef4444",
                                        }}
                                      >
                                        {category.status === 1
                                          ? "Xuất bản"
                                          : "Chưa xuất bản"}
                                      </span>
                                    </td>
                                    <td
                                      className="text-center"
                                      style={{ padding: "16px 12px" }}
                                    >
                                      {showTrash ? (
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: 10,
                                            justifyContent: "center",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              handleRestore(category.id)
                                            }
                                            disabled={processing}
                                            title="Khôi phục"
                                            style={{
                                              background:
                                                "linear-gradient(135deg, #5b86e5 0%, #36d1c4 100%)",
                                              border: "none",
                                              color: "#fff",
                                              borderRadius: 12,
                                              width: 40,
                                              height: 40,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: 16,
                                              cursor: "pointer",
                                              boxShadow:
                                                "0 4px 10px rgba(91, 134, 229, 0.2)",
                                              transition: "transform 0.15s",
                                            }}
                                            onMouseOver={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(-2px)")
                                            }
                                            onMouseOut={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(0)")
                                            }
                                          >
                                            <i className="fas fa-trash-restore"></i>
                                          </button>
                                          <button
                                            onClick={() =>
                                              openDeleteModal(category.id)
                                            }
                                            disabled={processing}
                                            title="Xóa vĩnh viễn"
                                            style={{
                                              background:
                                                "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
                                              border: "none",
                                              color: "#fff",
                                              borderRadius: 12,
                                              width: 40,
                                              height: 40,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: 16,
                                              cursor: "pointer",
                                              boxShadow:
                                                "0 4px 10px rgba(255, 88, 88, 0.2)",
                                              transition: "transform 0.15s",
                                            }}
                                            onMouseOver={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(-2px)")
                                            }
                                            onMouseOut={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(0)")
                                            }
                                          >
                                            <i className="fas fa-times"></i>
                                          </button>
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            display: "flex",
                                            gap: 10,
                                            justifyContent: "center",
                                          }}
                                        >
                                          <button
                                            onClick={() =>
                                              handleToggleStatus(
                                                category.id,
                                                category.status
                                              )
                                            }
                                            disabled={processing}
                                            title={
                                              category.status === 1
                                                ? "Ẩn"
                                                : "Hiện"
                                            }
                                            style={{
                                              background:
                                                category.status === 1
                                                  ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                                  : "#94a3b8",
                                              border: "none",
                                              color: "#fff",
                                              borderRadius: 12,
                                              width: 40,
                                              height: 40,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: 16,
                                              cursor: "pointer",
                                              boxShadow:
                                                "0 4px 10px rgba(67, 233, 123, 0.15)",
                                              transition: "transform 0.15s",
                                            }}
                                            onMouseOver={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(-2px)")
                                            }
                                            onMouseOut={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(0)")
                                            }
                                          >
                                            <i
                                              className={`fas fa-toggle-${
                                                category.status === 1
                                                  ? "on"
                                                  : "off"
                                              }`}
                                            ></i>
                                          </button>
                                          <button
                                            onClick={() => handleEdit(category)}
                                            disabled={processing}
                                            title="Chỉnh sửa"
                                            style={{
                                              background:
                                                "linear-gradient(135deg, #5b86e5 0%, #36d1c4 100%)",
                                              border: "none",
                                              color: "#fff",
                                              borderRadius: 12,
                                              width: 40,
                                              height: 40,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: 16,
                                              cursor: "pointer",
                                              boxShadow:
                                                "0 4px 10px rgba(91, 134, 229, 0.2)",
                                              transition: "transform 0.15s",
                                            }}
                                            onMouseOver={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(-2px)")
                                            }
                                            onMouseOut={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(0)")
                                            }
                                          >
                                            <i className="fas fa-edit"></i>
                                          </button>
                                          <button
                                            onClick={() =>
                                              openDeleteModal(category.id)
                                            }
                                            disabled={processing}
                                            title="Xóa"
                                            style={{
                                              background:
                                                "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
                                              border: "none",
                                              color: "#fff",
                                              borderRadius: 12,
                                              width: 40,
                                              height: 40,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              fontSize: 16,
                                              cursor: "pointer",
                                              boxShadow:
                                                "0 4px 10px rgba(255, 88, 88, 0.2)",
                                              transition: "transform 0.15s",
                                            }}
                                            onMouseOver={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(-2px)")
                                            }
                                            onMouseOut={(e) =>
                                              (e.currentTarget.style.transform =
                                                "translateY(0)")
                                            }
                                          >
                                            <i className="fas fa-trash"></i>
                                          </button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                )
                              )
                            ) : (
                              <tr>
                                <td
                                  colSpan="7"
                                  style={{ textAlign: "center", padding: 32 }}
                                >
                                  <div
                                    style={{
                                      fontSize: 18,
                                      color: "#64748b",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {showTrash
                                      ? "Thùng rác trống"
                                      : "Không có danh mục nào"}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 14,
                                      color: "#94a3b8",
                                      marginTop: 8,
                                    }}
                                  >
                                    {showTrash
                                      ? "Các danh mục đã xóa sẽ xuất hiện ở đây"
                                      : "Hãy thêm danh mục mới bằng form bên trái"}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                        {/* Pagination controls */}
                        {totalPages > 1 && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              marginTop: 20,
                              gap: 8,
                            }}
                          >
                            <button
                              className="btn"
                              style={{
                                borderRadius: 8,
                                padding: "6px 14px",
                                border: "1px solid #e5e7eb",
                                background: "#f1f5f9",
                                color: "#64748b",
                                fontWeight: 600,
                                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                opacity: currentPage === 1 ? 0.5 : 1,
                              }}
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(currentPage - 1)}
                            >
                              &lt;
                            </button>
                            {Array.from({ length: totalPages }, (_, idx) => (
                              <button
                                key={idx + 1}
                                className="btn"
                                style={{
                                  borderRadius: 8,
                                  padding: "6px 14px",
                                  border: "1px solid #e5e7eb",
                                  background: currentPage === idx + 1 ? "#2563eb" : "#fff",
                                  color: currentPage === idx + 1 ? "#fff" : "#2563eb",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                                onClick={() => setCurrentPage(idx + 1)}
                              >
                                {idx + 1}
                              </button>
                            ))}
                            <button
                              className="btn"
                              style={{
                                borderRadius: 8,
                                padding: "6px 14px",
                                border: "1px solid #e5e7eb",
                                background: "#f1f5f9",
                                color: "#64748b",
                                fontWeight: 600,
                                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                opacity: currentPage === totalPages ? 0.5 : 1,
                              }}
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(currentPage + 1)}
                            >
                              &gt;
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div
            className="modal-backdrop"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1050,
            }}
          >
            <div
              className="modal-dialog"
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                width: "100%",
                maxWidth: 500,
                margin: 0,
                overflow: "hidden",
              }}
            >
              <div className="modal-content" style={{ border: "none" }}>
                <div
                  className="modal-header"
                  style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h4
                    className="modal-title"
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#1e293b",
                      margin: 0,
                    }}
                  >
                    Xóa vĩnh viễn danh mục
                  </h4>
                  <button
                    type="button"
                    className="close"
                    onClick={closeDeleteModal}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 24,
                      cursor: "pointer",
                      padding: 0,
                      color: "#64748b",
                    }}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body" style={{ padding: "24px" }}>
                  <p
                    style={{ fontSize: 16, color: "#475569", marginBottom: 16 }}
                  >
                    Bạn có chắc chắn muốn xóa vĩnh viễn danh mục này không? Hành động này không thể hoàn tác.
                  </p>
                  <div
                    className="alert"
                    style={{
                      padding: "12px 16px",
                      background: "#fffbeb",
                      borderRadius: 8,
                      borderLeft: "4px solid #f59e0b",
                      color: "#92400e",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <i
                        className="fas fa-exclamation-triangle"
                        style={{ fontSize: 18 }}
                      ></i>
                      <div>
                        <p style={{ margin: 0, fontSize: 15 }}>
                          Danh mục đã xóa sẽ không thể khôi phục lại được.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="modal-footer"
                  style={{
                    padding: "16px 24px",
                    borderTop: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    className="btn"
                    onClick={closeDeleteModal}
                    style={{
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      borderRadius: 12,
                      padding: "10px 20px",
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#e2e8f0")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#f1f5f9")
                    }
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleDelete}
                    disabled={processing}
                    style={{
                      background:
                        "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 12,
                      padding: "10px 20px",
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: "pointer",
                      boxShadow: "0 4px 10px rgba(255, 88, 88, 0.2)",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    {processing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span className="ml-2">Đang xử lý...</span>
                      </>
                    ) : (
                      "Xóa vĩnh viễn"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
