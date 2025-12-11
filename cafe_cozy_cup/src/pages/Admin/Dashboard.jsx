// src/pages/Admin/Dashboard.jsx
import React, { useContext, useState, useMemo } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { Navigate } from "react-router-dom";
import { useOrdersPayments } from "../../context/OrderPaymentsContext";
import { NotificationContext } from "../../context/NotificationContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_COLORS = {
    total: "bg-purple-200 text-purple-800",
    pending: "bg-yellow-200 text-yellow-800",
    processing: "bg-blue-200 text-blue-800",
    completed: "bg-green-200 text-green-800",
    cancelled: "bg-red-200 text-red-800",
    paid: "bg-green-200 text-green-800",
    failed: "bg-red-200 text-red-800",
    customers: "bg-pink-200 text-pink-800",
};

const STATUS_DROPDOWN = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
};

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const { orders, updatePaymentStatus, updateOrderStatus } = useOrdersPayments();

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [filterDate, setFilterDate] = useState(null);
    const [highlightedDate, setHighlightedDate] = useState(null);
    const { notifications, markAsRead } = useContext(NotificationContext);
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    const [showNotifModal, setShowNotifModal] = useState(false);


    if (!user) return <Navigate to="/login" replace />;

    // --- Filtered & Sorted Orders ---
    const displayedOrders = useMemo(() => {
        let filtered = orders.filter((o) => {
            const matchesCustomer = o.user?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus ? o.status === filterStatus : true;
            const matchesDate = filterDate
                ? new Date(o.created_at).toLocaleDateString() === filterDate
                : true;
            return matchesCustomer && matchesStatus && matchesDate;
        });
        if (sortField) {
            filtered.sort((a, b) => {
                let aVal, bVal;
                if (sortField === "total_amount") {
                    aVal = parseFloat(a.total_amount);
                    bVal = parseFloat(b.total_amount);
                } else if (sortField === "created_at") {
                    aVal = new Date(a.created_at);
                    bVal = new Date(b.created_at);
                } else if (sortField === "date") {
                    aVal = new Date(a.created_at);
                    bVal = new Date(b.created_at);
                }
                return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
            });
        }
        return filtered;
    }, [orders, searchTerm, filterStatus, sortField, sortOrder, filterDate]);

    // --- Summary Stats ---
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const processingOrders = orders.filter((o) => o.status === "processing").length;
    const completedOrders = orders.filter((o) => o.status === "completed").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
    const uniqueCustomers = [...new Set(orders.map((o) => o.user_id))].length;

    // --- Income Calculations ---
    const calculateTodayIncome = () => {
        const today = new Date();
        return orders.reduce((acc, o) => {
            const orderDate = new Date(o.created_at);
            if (orderDate.toDateString() === today.toDateString() && o.status === "completed" && o.payment?.status === "paid") {
                return acc + parseFloat(o.total_amount);
            }
            return acc;
        }, 0);
    };
    const calculateTotalIncome = () => {
        return orders.reduce((acc, o) => {
            if (o.status === "completed" && o.payment?.status === "paid") {
                return acc + parseFloat(o.total_amount);
            }
            return acc;
        }, 0);
    };

    // --- Daily income for chart & table ---
    const dailyIncomeData = Object.values(
        orders.reduce((acc, o) => {
            const date = new Date(o.created_at).toLocaleDateString();
            if (!acc[date]) acc[date] = { date, income: 0 };
            if (o.status === "completed" && o.payment?.status === "paid") {
                acc[date].income += parseFloat(o.total_amount);
            }
            return acc;
        }, {})
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    // --- Handlers ---
    const handleSort = (field) => {
        if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        else {
            setSortField(field);
            setSortOrder("asc");
        }
    };
    const handleBarClick = (data) => {
        if (filterDate === data.date) setFilterDate(null);
        else setFilterDate(data.date);
    };

    return (
        <div className="min-h-screen rounded-2xl bg-gradient-to-br from-purple-100 via-purple-50 to-purple-100 p-6">
            {/* Header */}
            {showNotifModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-96 rounded-xl shadow-xl p-4">
                        <h2 className="text-lg font-bold mb-3">📨 Notifikasi</h2>

                        <div className="max-h-80 overflow-y-auto space-y-3">
                            {notifications.length === 0 ? (
                                <p className="text-center text-gray-500">Tidak ada notifikasi</p>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-3 rounded-lg border ${n.is_read ? "bg-gray-100" : "bg-purple-100"}`}
                                    >
                                        <p className="font-semibold">{n.title}</p>
                                        <p className="text-sm text-gray-700">{n.message}</p>
                                        {!n.is_read && (
                                            <button
                                                onClick={() => markAsRead(n.id)}
                                                className="mt-2 text-xs bg-purple-500 text-white px-2 py-1 rounded"
                                            >
                                                Tandai dibaca
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => setShowNotifModal(false)}
                            className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-4xl font-extrabold text-purple-700">
                    ☕ Cozy Admin Dashboard
                </h1>

                <div className="flex items-center gap-4">

                    {/* ICON NOTIFICATION */}
                    <button
                        onClick={() => setShowNotifModal(true)}
                        className="relative bg-purple-200 hover:bg-purple-300 p-2 rounded-full shadow transition"
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* LOGOUT */}
                    <button
                        onClick={logout}
                        className="bg-purple-300 text-purple-900 px-5 py-2 rounded-lg shadow hover:bg-purple-400 transition"
                    >
                        Logout
                    </button>

                </div>
            </header>

            {/* Summary Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 max-w-7xl mx-auto">
                <Card title="Total Orders" value={totalOrders} status="total" />
                <Card title="Pending Orders" value={pendingOrders} status="pending" />
                <Card title="Processing Orders" value={processingOrders} status="processing" />
                <Card title="Completed Orders" value={completedOrders} status="completed" />
                <Card title="Cancelled Orders" value={cancelledOrders} status="cancelled" />
                <Card title="Customers" value={uniqueCustomers} status="customers" />
            </section>

            {/* Income & Payment Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6 max-w-7xl mx-auto">
                <Card title="Today's Income" value={calculateTodayIncome()} status="processing" subtitle="Income Today" />
                <Card title="Total Income" value={calculateTotalIncome()} status="completed" subtitle="Overall Income" />
                <Card title="Paid Payments" value={orders.filter(o => o.payment?.status === "paid").length} status="paid" subtitle="Paid Orders" />
                <Card title="Pending Payments" value={orders.filter(o => o.payment?.status === "pending").length} status="pending" subtitle="Pending Orders" />
                <Card title="Failed Payments" value={orders.filter(o => o.payment?.status === "failed").length} status="failed" subtitle="Failed Orders" />
            </section>

            {/* Interactive Daily Income Chart */}
            <section className="bg-white/90 rounded-3xl p-6 shadow-lg border border-purple-200 max-w-7xl mx-auto mb-6">
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">📊 Daily Income Chart</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyIncomeData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `Rp ${value}`} />
                        <Bar dataKey="income" onClick={handleBarClick}>
                            {dailyIncomeData.map((entry) => (
                                <Cell
                                    key={entry.date}
                                    fill={entry.date === filterDate ? "#d946ef" : "#7e22ce"}
                                    style={{ cursor: "pointer" }}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </section>

            {/* Income History Table */}
            <section className="bg-white/90 rounded-3xl p-6 shadow-lg border border-purple-200 max-w-7xl mx-auto mb-6">
                <h2 className="text-2xl font-semibold mb-4 text-purple-700">📅 Income History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-purple-100 text-purple-800 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("date")}>Date</th>
                                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("income")}>Income</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {dailyIncomeData.map((d) => (
                                <tr
                                    key={d.date}
                                    className={`hover:bg-purple-50 transition duration-300 ${d.date === filterDate ? "bg-purple-200 font-bold" : ""}`}
                                    onMouseEnter={() => setHighlightedDate(d.date)}
                                    onMouseLeave={() => setHighlightedDate(null)}
                                >
                                    <td className="px-4 py-3">{d.date}</td>
                                    <td className="px-4 py-3 font-semibold">Rp {d.income}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Search & Filter Orders */}
            <section className="flex flex-col sm:flex-row gap-4 items-center mb-4 max-w-7xl mx-auto">
                <div className="relative w-full sm:w-1/2">
                    <input
                        type="text"
                        placeholder="Search by customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full sm:w-1/4 focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                    <option value="">Sort By</option>
                    <option value="total_amount">Total Amount</option>
                    <option value="created_at">Order Date</option>
                </select>
                {sortField && (
                    <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="px-3 py-2 border rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                    >
                        {sortOrder === "asc" ? "Asc ⬆️" : "Desc ⬇️"}
                    </button>
                )}
            </section>

            {/* Orders Table */}
            <section className="bg-white/90 rounded-3xl p-6 shadow-lg border border-purple-200 max-w-7xl mx-auto mb-6">
                <h2 className="text-2xl font-semibold mb-5 text-purple-700">🧾 Recent Orders</h2>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-purple-100 text-purple-800 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-left w-10">ID</th>
                                <th className="px-4 py-3 text-left w-40">Customer</th>
                                <th className="px-4 py-3 text-left">Items</th>
                                <th className="px-4 py-3 text-left w-28 cursor-pointer" onClick={() => handleSort("total_amount")}>Total</th>
                                <th className="px-4 py-3 text-left w-32">Payment</th>
                                <th className="px-4 py-3 text-left w-28 cursor-pointer" onClick={() => handleSort("created_at")}>Date</th>
                                <th className="px-4 py-3 text-left w-28">Status</th>
                                <th className="px-4 py-3 text-center w-20">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {displayedOrders.length > 0 ? (
                                displayedOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className={`hover:bg-purple-50 transition duration-300 ${filterDate && new Date(order.created_at).toLocaleDateString() === filterDate
                                            ? "bg-purple-100 font-semibold"
                                            : ""
                                            }`}
                                    >
                                        <td className="px-4 py-3 font-semibold text-gray-800">#{order.id}</td>
                                        <td className="px-4 py-3">{highlightSearch(order.user?.name, searchTerm)}</td>
                                        <td className="px-4 py-3">
                                            {order.order_items?.map((it) => (
                                                <span key={it.id} className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-sm mr-1 mb-1">
                                                    {it.menu_item?.name} × {it.quantity}
                                                </span>
                                            )) || "-"}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">Rp {order.total_amount}</td>
                                        <td className="px-4 py-3">
                                            {order.payment ? (
                                                <select
                                                    className={`border rounded-full px-2 py-1 ${STATUS_DROPDOWN[order.payment.status]} transition duration-200`}
                                                    value={order.payment.status}
                                                    onChange={(e) => updatePaymentStatus(order.payment.id, e.target.value)}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="failed">Failed</option>
                                                </select>
                                            ) : (
                                                <span className="italic text-gray-400">No Payment</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{new Date(order.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                className={`border rounded-full px-2 py-1 ${STATUS_DROPDOWN[order.status]} transition duration-200`}
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-blue-600 hover:text-blue-800 transition duration-200"
                                            >
                                                👁
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-5 text-gray-500 italic">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg w-full relative transform transition-transform duration-300 scale-95">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-3 right-3 text-gray-600 hover:text-black"
                        >
                            ✕
                        </button>
                        <h3 className="text-xl font-semibold mb-3 text-purple-700">Order #{selectedOrder.id}</h3>
                        <p><b>Customer:</b> {selectedOrder.user?.name}</p>
                        <p><b>Status:</b> {selectedOrder.status}</p>
                        <p><b>Payment:</b> {selectedOrder.payment?.status || "No Payment"}</p>
                        <p><b>Total:</b> Rp {selectedOrder.total_amount}</p>
                        <hr className="my-3" />
                        <ul className="list-disc pl-5 space-y-1">
                            {selectedOrder.order_items?.map((it) => (
                                <li key={it.id}>
                                    {it.menu_item?.name} × {it.quantity} | Rp {it.price}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

// Highlight matched search term
const highlightSearch = (text, term) => {
    if (!term || !text) return text;
    const parts = text.split(new RegExp(`(${term})`, "gi"));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === term.toLowerCase() ? (
                    <span key={i} className="bg-yellow-200 rounded px-1">{part}</span>
                ) : part
            )}
        </>
    );
};

// Card component
const Card = ({ title, value, status, subtitle }) => (
    <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition transform hover:scale-105 duration-300 flex flex-col items-center justify-center relative">
        <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-full ${STATUS_COLORS[status]}`}>
            {title.split(" ")[0]}
        </div>
        <h3 className="text-lg font-semibold mb-1 text-purple-700">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mb-2">{subtitle}</p>}
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);

export default Dashboard;
