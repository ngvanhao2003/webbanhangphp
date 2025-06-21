import React, { useState, useEffect, useRef } from "react";
import axios from '../../../axios';
import Chart from 'chart.js/auto';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        totalUsers: 0,
        totalProducts: 0,
        recentOrders: [],
        monthlySales: [],
        ordersByStatus: {
            pending: 0,
            processing: 0,
            completed: 0,
            cancelled: 0
        },
        loading: true,
        error: null
    });
    
    const salesChartRef = useRef(null);
    const orderChartRef = useRef(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                
                if (!token) {
                    console.error("Token không tồn tại");
                    setStats(prevState => ({
                        ...prevState,
                        loading: false,
                        error: "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn."
                    }));
                    return;
                }
                
                console.log("Đang gọi API dashboard...");
                
                const response = await axios.get('/api/admin/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Lấy tất cả đơn hàng để thống kê
                const ordersRes = await axios.get('/api/orders?limit=10000', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const allOrders = ordersRes.data || [];

                const normalizedOrders = allOrders.map(order => {
                    let status = 'cancelled';
                    if (order.status === 'completed' || order.status === 'delivered') status = 'completed';
                    else if (order.status === 'processing' || order.status === 'in_progress' || order.status === 'shipped') status = 'processing';
                    else if (order.status === 'pending' || order.status === 'waiting') status = 'pending';
                    return {
                        ...order,
                        status
                    };
                });

                const ordersByStatus = {
                    pending: normalizedOrders.filter(o => o.status === 'pending').length,
                    processing: normalizedOrders.filter(o => o.status === 'processing').length,
                    completed: normalizedOrders.filter(o => o.status === 'completed').length,
                    cancelled: normalizedOrders.filter(o => o.status === 'cancelled').length
                };

                const revenue = normalizedOrders
                    .filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + (o.total_amount || o.totalAmount || 0), 0);

                const monthlySalesData = Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    const ordersInMonth = normalizedOrders.filter(o => o.status === 'completed' && new Date(o.created_at).getMonth() + 1 === month);
                    return {
                        month,
                        revenue: ordersInMonth.reduce((sum, o) => sum + (o.total_amount || o.totalAmount || 0), 0),
                        orders: ordersInMonth.length
                    };
                });

                setStats({
                    totalOrders: normalizedOrders.length,
                    revenue: revenue,
                    totalUsers: response.data.totalUsers || 0,
                    totalProducts: response.data.totalProducts || 0,
                    recentOrders: (response.data.recentOrders || []).map(order => {
                        let status = 'cancelled';
                        if (order.status === 'completed' || order.status === 'delivered') status = 'completed';
                        else if (order.status === 'processing' || order.status === 'in_progress' || order.status === 'shipped') status = 'processing';
                        else if (order.status === 'pending' || order.status === 'waiting') status = 'pending';
                        return {
                            ...order,
                            status
                        };
                    }),
                    monthlySales: monthlySalesData,
                    ordersByStatus: ordersByStatus,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu dashboard:", error);
                if (error.response) {
                    console.error("Lỗi phản hồi từ server:", error.response.status, error.response.data);
                    setStats(prevState => ({
                        ...prevState,
                        loading: false,
                        error: `Lỗi từ server: ${error.response.status} - ${error.response.data.message || "Không có thông tin lỗi"}`
                    }));
                } else if (error.request) {
                    console.error("Không nhận được phản hồi từ server");
                    setStats(prevState => ({
                        ...prevState,
                        loading: false,
                        error: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server đã khởi động chưa."
                    }));
                } else {
                    setStats(prevState => ({
                        ...prevState,
                        loading: false,
                        error: "Có lỗi xảy ra. Vui lòng thử lại sau."
                    }));
                }
            }
        };

        fetchDashboardData();
    }, []);
    
    useEffect(() => {
        if (!stats.loading && !stats.error && stats.monthlySales.length > 0 && salesChartRef.current) {
            if (salesChartRef.current.chart) {
                salesChartRef.current.chart.destroy();
            }
            
            const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
            
            const ctx = salesChartRef.current.getContext('2d');
            salesChartRef.current.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: stats.monthlySales.map(item => months[item.month - 1]),
                    datasets: [
                        {
                            label: 'Doanh thu (VNĐ)',
                            data: stats.monthlySales.map(item => item.revenue),
                            borderColor: 'rgba(60, 141, 188, 0.8)',
                            backgroundColor: 'rgba(60, 141, 188, 0.2)',
                            pointRadius: 4,
                            pointColor: '#3b8bba',
                            pointBackgroundColor: '#3b8bba',
                            fill: true
                        },
                        {
                            label: 'Đơn hàng',
                            data: stats.monthlySales.map(item => item.orders),
                            borderColor: 'rgba(210, 214, 222, 1)',
                            backgroundColor: 'rgba(210, 214, 222, 0.2)',
                            pointRadius: 4,
                            pointColor: '#c1c7d1',
                            pointBackgroundColor: '#c1c7d1',
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }, [stats]);
    
    useEffect(() => {
        if (!stats.loading && !stats.error && orderChartRef.current) {
            if (orderChartRef.current.chart) {
                orderChartRef.current.chart.destroy();
            }
            
            const { pending, processing, completed, cancelled } = stats.ordersByStatus;
            
            const ctx = orderChartRef.current.getContext('2d');
            orderChartRef.current.chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Chờ xác nhận', 'Đang xử lý', 'Hoàn thành', 'Đã hủy'],
                    datasets: [
                        {
                            data: [pending, processing, completed, cancelled],
                            backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545']
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }, [stats]);

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    return (
        <div className="dashboard-wrapper" style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
            padding: '32px 0'
        }}>
            <div className="container-xl">
                <h1 className="dashboard-title" style={{ fontWeight: 800, fontSize: 40, marginBottom: 24, letterSpacing: 1 }}>Dashboard</h1>
                <div className="dashboard-welcome-card" style={{
                    background: 'linear-gradient(90deg, #36d1c4 0%, #5b86e5 100%)',
                    color: '#fff',
                    borderRadius: 18,
                    padding: 32,
                    marginBottom: 32,
                    boxShadow: '0 8px 32px rgba(44, 62, 80, 0.12)'
                }}>
                    <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 28, marginRight: 8 }}>📊</span> Tổng quan
                    </h2>
                    <div style={{ fontSize: 18, marginBottom: 8 }}>Chào mừng đến với trang quản trị</div>
                    <div style={{ fontSize: 15, opacity: 0.9 }}>Đây là trang tổng quan thống kê dữ liệu của hệ thống. Từ đây, bạn có thể theo dõi đơn hàng, doanh số, khách hàng và sản phẩm.</div>
                    <div style={{ fontSize: 13, marginTop: 12, opacity: 0.8 }}>Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}</div>
                </div>
                <div className="dashboard-stats-row" style={{
                    display: 'flex',
                    gap: 24,
                    marginBottom: 32,
                    flexWrap: 'wrap',
                    justifyContent: 'space-between'
                }}>
                    <div
                        className="dashboard-stat-card"
                        style={{
                            flex: '1 1 200px',
                            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            color: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            boxShadow: '0 4px 16px rgba(67, 233, 123, 0.12)',
                            minWidth: 220,
                            marginRight: 8,
                            cursor: 'pointer',
                            transition: 'transform 0.15s',
                        }}
                        onClick={() => window.location.href = '/admin/order'}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}><span role="img" aria-label="cart">🛒</span> {stats.totalOrders}</div>
                        <div style={{ fontSize: 15, opacity: 0.9 }}>Đơn hàng</div>
                    </div>
                    <div
                        className="dashboard-stat-card"
                        style={{
                            flex: '1 1 200px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.12)',
                            minWidth: 220,
                            marginRight: 8,
                            cursor: 'pointer',
                            transition: 'transform 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}><span role="img" aria-label="money">💰</span> {formatCurrency(stats.revenue)}</div>
                        <div style={{ fontSize: 15, opacity: 0.9 }}>Doanh thu</div>
                    </div>
                    <div
                        className="dashboard-stat-card"
                        style={{
                            flex: '1 1 200px',
                            background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
                            color: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            boxShadow: '0 4px 16px rgba(247, 151, 30, 0.12)',
                            minWidth: 220,
                            marginRight: 8,
                            cursor: 'pointer',
                            transition: 'transform 0.15s',
                        }}
                        onClick={() => window.location.href = '/admin/user'}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}><span role="img" aria-label="user">👤</span> {stats.totalUsers}</div>
                        <div style={{ fontSize: 15, opacity: 0.9 }}>Người dùng</div>
                    </div>
                    <div
                        className="dashboard-stat-card"
                        style={{
                            flex: '1 1 200px',
                            background: 'linear-gradient(135deg, #f953c6 0%, #b91d73 100%)',
                            color: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            boxShadow: '0 4px 16px rgba(249, 83, 198, 0.12)',
                            minWidth: 220,
                            cursor: 'pointer',
                            transition: 'transform 0.15s',
                        }}
                        onClick={() => window.location.href = '/admin/product'}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}><span role="img" aria-label="box">📦</span> {stats.totalProducts}</div>
                        <div style={{ fontSize: 15, opacity: 0.9 }}>Sản phẩm</div>
                    </div>
                </div>
                <div className="dashboard-charts-row" style={{
                    display: 'flex',
                    gap: 32,
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'stretch'
                }}>
                    <div className="dashboard-chart-card" style={{
                        flex: '2 1 500px',
                        background: '#fff',
                        borderRadius: 18,
                        padding: 24,
                        boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)',
                        marginBottom: 24,
                        minWidth: 350
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 20 }}>📈</span> Doanh thu theo tháng
                        </div>
                        <div style={{ height: 320 }}>
                            <canvas ref={salesChartRef} style={{ width: '100%', height: 320 }}></canvas>
                        </div>
                    </div>
                    <div className="dashboard-chart-card" style={{
                        flex: '1 1 300px',
                        background: '#fff',
                        borderRadius: 18,
                        padding: 24,
                        boxShadow: '0 4px 24px rgba(44, 62, 80, 0.08)',
                        marginBottom: 24,
                        minWidth: 280
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 20 }}>🟢</span> Trạng thái đơn hàng
                        </div>
                        <div style={{ height: 320 }}>
                            <canvas ref={orderChartRef} style={{ width: '100%', height: 320 }}></canvas>
                        </div>
                        <div style={{ marginTop: 16, fontSize: 15, color: '#888' }}>
                            <div><span style={{ color: '#f7971e', fontWeight: 700 }}>Chờ xác nhận:</span> {stats.ordersByStatus.pending}</div>
                            <div><span style={{ color: '#667eea', fontWeight: 700 }}>Đang xử lý:</span> {stats.ordersByStatus.processing}</div>
                            <div><span style={{ color: '#43e97b', fontWeight: 700 }}>Hoàn thành:</span> {stats.ordersByStatus.completed}</div>
                            <div><span style={{ color: '#f953c6', fontWeight: 700 }}>Đã huỷ:</span> {stats.ordersByStatus.cancelled}</div>
                        </div>
                    </div>
                </div>
                {stats.error && (
                    <div style={{ color: 'red', fontWeight: 600, marginTop: 24, fontSize: 18 }}>{stats.error}</div>
                )}
            </div>
        </div>
    );
}
