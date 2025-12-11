import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentFinish = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const statusCode = searchParams.get("status_code");
    const transactionStatus = searchParams.get("transaction_status");

    // Safety check
    if (!orderId) {
      setStatus("error");
      setMessage("Order ID tidak ditemukan.");
      setLoading(false);
      return;
    }

    // Call backend untuk update status
    const updatePaymentStatus = async () => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/payment/update-status`,
          {
            order_id: orderId,
            status_code: statusCode,
            transaction_status: transactionStatus,
          }
        );

        if (res.data.success) {
          setStatus(transactionStatus);
          setMessage("Pembayaran berhasil diperbarui!");
        } else {
          setStatus("error");
          setMessage("Gagal memperbarui status transaksi.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Terjadi kesalahan saat memproses pembayaran.");
      }

      setLoading(false);
    };

    updatePaymentStatus();
  }, []);

  const handleGoHistory = () => {
    navigate("/payment-history");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const renderStatus = () => {
    if (loading) return <p className="text-gray-500">Tunggu sebentar...</p>;

    if (status === "settlement")
      return <p className="text-green-600 text-lg font-bold">Pembayaran Berhasil ✔</p>;

    if (status === "pending")
      return <p className="text-yellow-600 text-lg font-bold">Menunggu Pembayaran ⏳</p>;

    if (status === "deny" || status === "expire" || status === "cancel")
      return <p className="text-red-600 text-lg font-bold">Pembayaran Gagal ❌</p>;

    return <p className="text-red-600 text-lg font-bold">{message}</p>;
  };

  return (
    <div className="w-full min-h-[60vh] flex flex-col justify-center items-center text-center">
      <h1 className="text-2xl font-semibold mb-2">Status Pembayaran</h1>

      <div className="mb-4">{renderStatus()}</div>

      <p className="text-gray-600 mb-6">{message}</p>

      <div className="flex gap-4">
        <button
          onClick={handleGoHistory}
          className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition"
        >
          Lihat Riwayat Pembayaran
        </button>

        <button
          onClick={handleGoHome}
          className="bg-gray-200 px-5 py-2 rounded-md hover:bg-gray-300 transition"
        >
          Kembali ke Home
        </button>
      </div>
    </div>
  );
};

export default PaymentFinish;
