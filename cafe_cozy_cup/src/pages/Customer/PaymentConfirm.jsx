import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthProvider";
import { toast } from "react-toastify";

const PaymentConfirm = () => {
    const { orderNumber } = useParams();
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [snapToken, setSnapToken] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await API.get(`/orders/${orderNumber}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setOrder(res.data.data);
                setSnapToken(res.data.data.payment?.snap_token);
            } catch (err) {
                toast.error("Order not found!");
                navigate("/payment-history");
            }
        };

        fetchOrder();
    }, [orderNumber]);

    const handlePay = () => {
        if (!snapToken) {
            toast.error("Snap token not found!");
            return;
        }

        window.snap.pay(snapToken, {
            onSuccess: function () {
                toast.success("Pembayaran berhasil!");
                navigate("/payment-history");
            },
            onPending: function () {
                toast.info("Menunggu pembayaran...");
            },
            onError: function () {
                toast.error("Pembayaran gagal!");
            },
            onClose: function () {
                toast.warn("Pembayaran dibatalkan");
            },
        });
    };

    return (
        <div className="pt-24 px-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Konfirmasi Pembayaran</h2>

            {!order ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="border p-4 rounded-xl shadow">
                        <p><b>Order Number:</b> {order.order_number}</p>
                        <p><b>Total:</b> Rp {parseInt(order.total_amount).toLocaleString()}</p>
                        <p><b>Status:</b> {order.status}</p>
                    </div>

                    <button
                        onClick={handlePay}
                        className="w-full mt-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                    >
                        Bayar Sekarang
                    </button>
                </>
            )}
        </div>
    );
};

export default PaymentConfirm;
