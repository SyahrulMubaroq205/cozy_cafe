// src/pages/Customer/Payment.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import API from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Payment = () => {
    const { token, user } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);

    // Ambil semua payment milik user
    useEffect(() => {
        if (!token) return;
        API.get("/payments", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setPayments(res.data.data || []))
            .catch(err => {
                console.error(err);
                toast.error("Failed to load payments");
            });
    }, [token]);

    return (
        <div className="p-4 pt-20 max-w-3xl mx-auto">
            <ToastContainer />
            <h2 className="text-2xl font-bold mb-4 text-purple-600">Payment History</h2>

            {payments.length === 0 ? (
                <p>No payment records yet.</p>
            ) : (
                <div className="space-y-4">
                    {payments.map(pay => (
                        <div key={pay.id} className="bg-white rounded-xl shadow-lg p-4 border border-purple-200">
                            <div className="flex justify-between mb-2">
                                <span>Order ID: {pay.order_id}</span>
                                <span>Status: <strong>{pay.status}</strong></span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span>Amount:</span>
                                <span>Rp {parseInt(pay.amount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment Method:</span>
                                <span>{pay.payment_method}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Payment;
