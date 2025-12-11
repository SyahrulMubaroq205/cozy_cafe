// src/pages/Admin/Reviews.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [selectedReview, setSelectedReview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await API.get("/reviews");
            setReviews(res.data.data || []);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReviews = reviews
        .filter((r) =>
            r.user?.name.toLowerCase().includes(search.toLowerCase()) ||
            r.menu_item?.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sort === "newest")
                return new Date(b.created_at) - new Date(a.created_at);
            if (sort === "oldest")
                return new Date(a.created_at) - new Date(b.created_at);
            if (sort === "highest") return b.rating - a.rating;
            if (sort === "lowest") return a.rating - b.rating;
            return 0;
        });

    const renderStars = (rating) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <span
                        key={i}
                        className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const truncate = (text, maxLength = 70) => {
        if (!text) return "";
        return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/90 rounded-3xl p-6 shadow-lg border border-purple-200 max-w-7xl mx-auto mb-6"
        >
            <h2 className="text-2xl font-semibold mb-5 text-purple-700">
                ⭐ Customer Reviews
            </h2>

            {/* Search + Sort */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                <input
                    type="text"
                    placeholder="🔍 Search by customer or menu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 w-full md:w-1/2 focus:ring-2 focus:ring-purple-300 outline-none"
                />
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-300"
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200">
                {loading ? (
                    <p className="text-center py-5 text-gray-500 italic">
                        Loading reviews...
                    </p>
                ) : filteredReviews.length > 0 ? (
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-purple-100 text-purple-800 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-4 py-3 text-left w-12">ID</th>
                                <th className="px-4 py-3 text-left w-40">Customer</th>
                                <th className="px-4 py-3 text-left w-44">Menu</th>
                                <th className="px-4 py-3 text-left w-28">Rating</th>
                                <th className="px-4 py-3 text-left">Comment</th>
                                <th className="px-4 py-3 text-left w-36">Date</th>
                                <th className="px-4 py-3 text-center w-20">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredReviews.map((rev) => (
                                <tr
                                    key={rev.id}
                                    className="hover:bg-purple-50 transition duration-300"
                                >
                                    <td className="px-4 py-3 font-semibold text-gray-800">
                                        #{rev.id}
                                    </td>
                                    <td className="px-4 py-3">{rev.user?.name}</td>
                                    <td className="px-4 py-3 flex items-center gap-2">
                                        {rev.menu_item?.image && (
                                            <img
                                                src={rev.menu_item.image}
                                                alt={rev.menu_item.name}
                                                className="w-8 h-8 rounded-md object-cover"
                                            />
                                        )}
                                        <span>{rev.menu_item?.name}</span>
                                    </td>
                                    <td className="px-4 py-3">{renderStars(rev.rating)}</td>
                                    <td className="px-4 py-3">{truncate(rev.comment)}</td>
                                    <td className="px-4 py-3">
                                        {new Date(rev.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => setSelectedReview(rev)}
                                            className="text-blue-600 hover:text-blue-800 transition duration-200"
                                        >
                                            👁
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center py-5 text-gray-500 italic">
                        No reviews found
                    </p>
                )}
            </div>

            {/* Modal for full comment */}
            <AnimatePresence>
                {selectedReview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="bg-white rounded-2xl p-6 w-96 shadow-xl"
                        >
                            <h3 className="text-lg font-semibold text-purple-700 mb-2">
                                {selectedReview.menu_item?.name}
                            </h3>
                            <p className="text-gray-600 mb-2">
                                <strong>{selectedReview.user?.name}</strong>
                            </p>
                            <div className="mb-3">{renderStars(selectedReview.rating)}</div>
                            <p className="text-gray-700 mb-4">{selectedReview.comment}</p>
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
};

export default AdminReviews;
