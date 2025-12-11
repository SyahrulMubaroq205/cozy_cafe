import React, { useContext, useState, useEffect } from "react";
import API from "../../api/api";
import { AuthContext } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { CartContext } from "../../context/CardContext";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Checkout = () => {
    const { cart, clearCart, total } = useContext(CartContext);
    const { token } = useContext(AuthContext);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute("data-client-key", import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);


const handlePayment = async () => {
    try {
        setLoading(true);

        // 1. BUAT ORDER DULU
        const createOrder = await axios.post(
            `${import.meta.env.VITE_API}/orders`,
            {
                items: cart,
                total: total,
                payment_method: paymentMethod,
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log("CREATE ORDER:", createOrder.data);

        const orderId = createOrder.data?.data?.id;
        if (!orderId) {
            toast.error("Gagal membuat order!");
            setLoading(false);
            return;
        }

        // 2. AMBIL DETAIL ORDER UNTUK SNAP TOKEN
        const res = await axios.get(
            `${import.meta.env.VITE_API}/orders/${orderId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("ORDER RESPONSE:", res.data);

        const snapToken = res.data?.data?.snap_token;

        if (!snapToken) {
            toast.error("Checkout gagal: snap token tidak ditemukan");
            setLoading(false);
            return;
        }

        if (!window.snap || !window.snap.pay) {
            toast.error("Midtrans Snap gagal dimuat");
            setLoading(false);
            return;
        }

        // 3. POPUP MIDTRANS
        window.snap.pay(snapToken, {
            onSuccess: function () {
                toast.success("Pembayaran berhasil!");
                clearCart();
                navigate("/payment-history");
            },
            onPending: function () {
                toast.info("Menunggu pembayaran...");
            },
            onError: function () {
                toast.error("Pembayaran gagal!");
            },
            onClose: function () {
                toast.warn("Pembayaran ditutup sebelum selesai.");
            },
        });

        setLoading(false);
    } catch (err) {
        console.log("PAYMENT ERROR:", err);
        toast.error("Checkout gagal: server error!");
        setLoading(false);
    }
};




    return (
        <div className="pt-24 px-6 max-w-4xl mx-auto">
            <ToastContainer />
            <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
                Checkout Summary
            </h2>

            {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg mb-4">🛒 Your cart is empty.</p>
                    <button
                        onClick={() => navigate("/menu")}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        Back to Menu
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Order Details
                    </h3>

                    <div className="divide-y divide-gray-200 mb-4">
                        {cart.map((item) => (
                            <div
                                key={item.menu_item_id}
                                className="flex justify-between items-center py-3"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {item.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {item.quantity} × Rp{" "}
                                        {parseInt(item.price).toLocaleString()}
                                    </p>
                                </div>
                                <p className="font-semibold text-purple-700">
                                    Rp {(item.price * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between text-lg font-bold mb-6">
                        <span>Total:</span>
                        <span className="text-purple-700">
                            Rp {total.toLocaleString()}
                        </span>
                    </div>


                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {loading ? "Processing..." : "Lanjutkan Pembayaran"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Checkout;
