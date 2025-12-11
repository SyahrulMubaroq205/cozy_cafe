import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import API from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

const AdminOrdersCRUD = () => {
    const { token, user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [filter, setFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Fetch orders
    const fetchOrders = async () => {
        if (!token) return;
        try {
            const res = await API.get("/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch orders!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [token]);

    const filteredOrders =
        filter === "all" ? orders : orders.filter((order) => order.status === filter);

    const handleDelete = async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await API.delete(`/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Order deleted!");
            fetchOrders();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete order!");
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            setUpdating(true);
            await API.patch(
                `/orders/${orderId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Order status updated!");
            fetchOrders();
            setSelectedOrder(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status!");
        } finally {
            setUpdating(false);
        }
    };

    if (loading)
        return (
            <div className="flex flex-col justify-center items-center h-[70vh] text-gray-700">
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium">Loading orders...</p>
            </div>
        );

    return (
        <div className="min-h-screen rounded-2xl p-6 bg-gradient-to-br from-purple-200 via-purple-100 to-purple-50">
            <ToastContainer />
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-purple-800 text-center md:text-left">
                    Admin Dashboard - Orders
                </h1>
                <select
                    className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-purple-100 text-purple-800 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-4 py-3 text-left">Order #</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-left">Items</th>
                            <th className="px-4 py-3 text-left">Total</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-purple-50 transition cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                    <td className="px-4 py-3 font-semibold">#{order.order_number}</td>
                                    <td className="px-4 py-3">{order.user?.name || `ID ${order.user_id}`}</td>
                                    <td className="px-4 py-3">
                                        {order.order_items?.map((item) => `${item.menu_item?.name} (${item.quantity})`).join(", ") || "-"}
                                    </td>
                                    <td className="px-4 py-3 font-semibold">Rp {order.total_amount}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center flex justify-center gap-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            👁 Show
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            🗑 Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-gray-500 italic">
                                    No orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-2xl"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-bold mb-4 text-purple-700">
                            Order Detail
                        </h2>

                        <div className="space-y-2 text-gray-700">
                            <p><strong>Order:</strong> #{selectedOrder.order_number}</p>
                            <p><strong>Customer:</strong> {selectedOrder.user?.name}</p>
                            <p><strong>Total:</strong> Rp {selectedOrder.total_amount}</p>
                            <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full ${STATUS_COLORS[selectedOrder.status]}`}>{selectedOrder.status.toUpperCase()}</span></p>

                            <h4 className="mt-4 font-semibold">Items:</h4>
                            <ul className="pl-4 list-disc">
                                {selectedOrder.order_items?.map((item) => (
                                    <li key={item.id}>{item.menu_item?.name} x {item.quantity} - Rp {item.subtotal}</li>
                                ))}
                            </ul>

                            {selectedOrder.payment && (
                                <div className="mt-2">
                                    <p><strong>Payment:</strong> {selectedOrder.payment.payment_method} - {selectedOrder.payment.status}</p>
                                </div>
                            )}
                        </div>

                        {/* Admin controls */}
                        {user?.role === "admin" && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {["pending", "processing", "completed", "cancelled"].map((status) => (
                                    <button
                                        key={status}
                                        disabled={updating || selectedOrder.status === status}
                                        onClick={() => updateStatus(selectedOrder.id, status)}
                                        className={`px-4 py-2 rounded-full font-medium text-sm border transition ${selectedOrder.status === status ? "bg-gray-200 cursor-not-allowed" : "bg-purple-50 border-purple-300 hover:bg-purple-100"}`}
                                    >
                                        Set {status.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrdersCRUD;
