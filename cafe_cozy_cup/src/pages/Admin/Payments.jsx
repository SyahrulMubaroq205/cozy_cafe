import React, { useState, useContext } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../context/AuthProvider";
import { useOrdersPayments } from "../../context/OrderPaymentsContext";
import AdminPageWrapper from "./PageWrapper";

const STATUS_COLORS = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
};

const AdminPayments = () => {
    const { user } = useContext(AuthContext);
    const { payments, updatePaymentStatus, loading } = useOrdersPayments();
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [filter, setFilter] = useState("all");

    const filteredPayments = filter === "all" ? payments : payments.filter((p) => p.status === filter);

    if (loading)
        return (
            <AdminPageWrapper>
                <div className="flex flex-col justify-center items-center h-[70vh] text-gray-700">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-medium">Loading menu items...</p>
                </div>
            </AdminPageWrapper>
        );

    return (
        <div className="min-h-screen rounded-2xl p-6 bg-gradient-to-br from-purple-200 via-purple-100 to-purple-50">
            <ToastContainer />
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-purple-800 text-center md:text-left">
                    Admin Dashboard - Payments
                </h1>
                <select
                    className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-700 shadow-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-purple-100 text-purple-800 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-4 py-3 text-left">Order #</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-left">Amount</th>
                            <th className="px-4 py-3 text-left">Method</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className="hover:bg-purple-50 transition cursor-pointer"
                                    onClick={() => setSelectedPayment(payment)}
                                >
                                    <td className="px-4 py-3 font-semibold">
                                        {payment.order?.order_number || `#${payment.order_id}`}
                                    </td>
                                    <td className="px-4 py-3">
                                        {payment.order?.user?.name || `ID ${payment.order?.user_id}`}
                                    </td>
                                    <td className="px-4 py-3 font-semibold">Rp {payment.amount}</td>
                                    <td className="px-4 py-3">{payment.payment_method}</td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[payment.status]}`}
                                        >
                                            {payment.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center flex justify-center gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPayment(payment);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            👁 Show
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-gray-500 italic">
                                    No payments found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setSelectedPayment(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-2xl"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-purple-700">Payment Detail</h2>
                        <div className="space-y-2 text-gray-700">
                            <p>
                                <strong>Order:</strong>{" "}
                                {selectedPayment.order?.order_number || `#${selectedPayment.order_id}`}
                            </p>
                            <p>
                                <strong>Customer:</strong>{" "}
                                {selectedPayment.order?.user?.name || `ID ${selectedPayment.order?.user_id}`}
                            </p>
                            <p>
                                <strong>Amount:</strong> Rp {selectedPayment.amount}
                            </p>
                            <p>
                                <strong>Method:</strong> {selectedPayment.payment_method}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <span
                                    className={`px-2 py-1 rounded-full ${STATUS_COLORS[selectedPayment.status]}`}
                                >
                                    {selectedPayment.status.toUpperCase()}
                                </span>
                            </p>
                            {selectedPayment.transaction_id && (
                                <p>
                                    <strong>Transaction ID:</strong> {selectedPayment.transaction_id}
                                </p>
                            )}
                        </div>

                        {/* Admin Controls */}
                        {user?.role === "admin" && (
                            <div className="mt-6 flex flex-wrap gap-3">
                                {["pending", "paid", "failed"].map((status) => (
                                    <button
                                        key={status}
                                        disabled={selectedPayment.status === status}
                                        onClick={() => updatePaymentStatus(selectedPayment.id, status)}
                                        className={`px-4 py-2 rounded-full font-medium text-sm border transition ${selectedPayment.status === status
                                            ? "bg-gray-200 cursor-not-allowed"
                                            : "bg-purple-50 border-purple-300 hover:bg-purple-100"
                                            }`}
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

export default AdminPayments;
