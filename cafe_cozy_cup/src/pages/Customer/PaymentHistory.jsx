import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthProvider";
import API from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

const PaymentHistory = () => {
    const { token } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [newCount, setNewCount] = useState(0);
    const prevCount = useRef(0);

    const fetchPayments = async () => {
        try {
            const res = await API.get("/payments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = res.data.data || [];

            // hitung jumlah order baru
            if (prevCount.current > 0 && data.length > prevCount.current) {
                setNewCount(data.length - prevCount.current);
                setTimeout(() => setNewCount(0), 3000); // fade out
            }

            prevCount.current = data.length;
            setPayments(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch payment history.");
        }
    };

    useEffect(() => {
        fetchPayments();
        const interval = setInterval(fetchPayments, 5000);
        return () => clearInterval(interval);
    }, [token]);

    const getStatusClass = (status) => {
        switch (status) {
            case "paid":
                return "bg-green-100 text-green-800";
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "failed":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="pt-24 p-4 max-w-7xl mx-auto relative">
            <ToastContainer />
            <h2 className="text-3xl font-bold mb-6 text-purple-700 text-center">
                🧾 Payment History
            </h2>

            {/* Badge New Orders */}
            <AnimatePresence>
                {newCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.8 }}
                        className="absolute top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold"
                    >
                        {newCount} New Order{newCount > 1 ? "s" : ""}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            <section className="bg-white/90 rounded-3xl p-6 shadow-lg border border-purple-200">
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-purple-100 text-purple-800 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-left">ID</th>
                                <th className="px-4 py-3 text-left">Customer</th>
                                <th className="px-4 py-3 text-left">Items</th>
                                <th className="px-4 py-3 text-left">Total</th>
                                <th className="px-4 py-3 text-left">Payment Method</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            <AnimatePresence>
                                {payments.length > 0 ? (
                                    payments.map((payment) => {
                                        const order = payment.order;
                                        const items = order?.orderItems || [];
                                        return (
                                            <motion.tr
                                                key={payment.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.3 }}
                                                className="hover:bg-purple-50 transition"
                                            >
                                                <td className="px-4 py-3 font-semibold text-gray-800">
                                                    #{order?.order_number || payment.order_id}
                                                </td>
                                                <td className="px-4 py-3">{order?.user?.name || "Unknown"}</td>
                                                <td className="px-4 py-3">
                                                    {items.map((i) => `${i.menuItem?.name || i.name} (${i.quantity})`).join(", ") || "-"}
                                                </td>
                                                <td className="px-4 py-3 font-semibold">Rp {Number(order?.total_amount || payment.amount).toLocaleString()}</td>
                                                <td className="px-4 py-3 capitalize">{payment.payment_method}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(payment.status)}`}>
                                                        {payment.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => setSelectedPayment(payment)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        👁 Show
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-gray-500 italic">
                                            No payments found
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Detail Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg w-full relative">
                        <button onClick={() => setSelectedPayment(null)} className="absolute top-3 right-3 text-gray-600 hover:text-black">✕</button>
                        <h3 className="text-xl font-semibold mb-3 text-purple-700">
                            Payment #{selectedPayment.id}
                        </h3>
                        <p><b>Customer:</b> {selectedPayment.order?.user?.name}</p>
                        <p><b>Status:</b> {selectedPayment.status}</p>
                        <p><b>Payment Method:</b> {selectedPayment.payment_method}</p>
                        <p><b>Total:</b> Rp {Number(selectedPayment.order?.total_amount || selectedPayment.amount).toLocaleString()}</p>
                        <hr className="my-3" />
                        <ul className="list-disc pl-5 space-y-1">
                            {selectedPayment.order?.orderItems?.map((it, i) => (
                                <li key={i}>{it.menuItem?.name} × {it.quantity}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;
