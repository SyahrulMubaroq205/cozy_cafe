import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import API from "../../api/api";
import { toast } from "react-toastify";

const ReviewSection = ({ menuItemId, onNewReview }) => {
    const { token, user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Get semua review 
    const fetchReviews = async () => {
        if (!menuItemId) return;
        setLoading(true);
        try {
            const res = await API.get(`/reviews/menu-item/${menuItemId}`);
            const data = res.data;

            if (data.success) {
                setReviews(Array.isArray(data.data) ? data.data : []);
                setAverageRating(data.average_rating || 0);
                setTotalReviews(data.total_reviews || 0);
            } else {
                setReviews([]);
            }
        } catch (err) {
            console.error("Gagal memuat ulasan:", err);
            toast.error("Gagal memuat ulasan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuItemId]);

    // Kirim review baru
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Silakan login terlebih dahulu");
        if (!rating) return toast.error("Pilih rating terlebih dahulu!");
        if (comment.trim().length < 3)
            return toast.error("Komentar minimal 3 karakter");

        setSubmitting(true);
        try {
            const res = await API.post(
                "/reviews",
                { menu_item_id: menuItemId, rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success("Ulasan berhasil dikirim!");
                setComment("");
                setRating(0);
                await fetchReviews();
                onNewReview?.(); 
            } else {
                toast.error("Gagal mengirim ulasan");
            }
        } catch (err) {
            console.error("Gagal kirim ulasan:", err.response?.data || err.message);
            toast.error("Terjadi kesalahan saat mengirim ulasan");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-xl p-4 mt-3 border border-gray-100 w-full transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-800">
                    Ulasan Pelanggan
                </h3>
                <span className="text-sm text-yellow-500 font-medium">
                    ⭐ {averageRating.toFixed(1)} ({totalReviews})
                </span>
            </div>

            {/* Form Tambah Review */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-3">
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-xl transition-transform duration-150 ${star <= rating
                                    ? "text-yellow-400 scale-110"
                                    : "text-gray-300 hover:text-yellow-200"
                                }`}
                        >
                            ★
                        </button>
                    ))}
                </div>

                <textarea
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
                    placeholder="Tulis ulasanmu di sini..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    disabled={submitting}
                />

                <button
                    type="submit"
                    disabled={submitting}
                    className={`self-start px-3 py-1.5 rounded-lg text-sm font-medium text-white transition 
                    ${submitting
                            ? "bg-yellow-300 cursor-not-allowed"
                            : "bg-yellow-500 hover:bg-yellow-600"
                        }`}
                >
                    {submitting ? "Mengirim..." : "Kirim"}
                </button>
            </form>

            {/* Daftar Review */}
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {loading ? (
                    <p className="text-gray-500 italic text-sm text-center py-2">
                        Memuat ulasan...
                    </p>
                ) : reviews.length > 0 ? (
                    reviews.map((rev) => (
                        <div
                            key={rev.id}
                            className="border border-gray-200 rounded-lg p-2 bg-white shadow-sm slideFadeIn"
                        >
                            <div className="flex items-center justify-between mb-1 text-sm">
                                <span className="font-semibold text-gray-800">
                                    {rev.user?.name || "Pengguna"}
                                </span>
                                <span className="text-yellow-400 text-xs">
                                    {"★".repeat(rev.rating)}
                                    <span className="text-gray-300">
                                        {"★".repeat(5 - rev.rating)}
                                    </span>
                                </span>
                            </div>
                            <p className="text-gray-700 text-sm leading-snug">
                                {rev.comment}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic text-sm text-center py-2">
                        Belum ada ulasan.
                    </p>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
