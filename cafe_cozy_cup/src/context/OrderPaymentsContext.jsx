import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/api";
import { AuthContext } from "./AuthProvider";
import { toast } from "react-toastify";

const OrderPaymentsContext = createContext();
export const useOrdersPayments = () => useContext(OrderPaymentsContext);

const OrdersPaymentsProvider = ({ children }) => {
    const { token } = useContext(AuthContext);

    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch orders
    const fetchOrders = async () => {
        if (!token) return;
        try {
            const res = await API.get("/orders", { headers: { Authorization: `Bearer ${token}` } });
            setOrders(res.data.data || []);
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error("Failed to fetch orders!");
        }
    };

    // Fetch payments
    const fetchPayments = async () => {
        if (!token) return;
        try {
            const res = await API.get("/payments", { headers: { Authorization: `Bearer ${token}` } });
            setPayments(res.data.data || []);
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error("Failed to fetch payments!");
        }
    };

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetchOrders();
        fetchPayments();
        const interval = setInterval(() => {
            fetchOrders();
            fetchPayments();
        }, 10000);
        setLoading(false);
        return () => clearInterval(interval);
    }, [token]);

    // Update order status
    const updateOrderStatus = async (orderId, status) => {
        if (!token) return;
        try {
            await API.patch(
                `/orders/${orderId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
            toast.success("Order status updated!");
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error("Failed to update order status!");
        }
    };

    // Update payment status
    const updatePaymentStatus = async (paymentId, status) => {
        if (!token) return;
        try {
            await API.patch(
                `/payments/${paymentId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPayments((prev) => prev.map((p) => (p.id === paymentId ? { ...p, status } : p)));
            setOrders((prev) =>
                prev.map((o) => (o.payment?.id === paymentId ? { ...o, payment: { ...o.payment, status } } : o))
            );
            toast.success("Payment status updated!");
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error("Failed to update payment status!");
        }
    };

    return (
        <OrderPaymentsContext.Provider
            value={{ orders, payments, loading, updateOrderStatus, updatePaymentStatus }}
        >
            {children}
        </OrderPaymentsContext.Provider>
    );
};

export default OrdersPaymentsProvider;
