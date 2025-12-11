import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { CartContext } from "../../context/CardContext";
import API from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiFilter } from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";
import ReviewSection from "../../components/ReviewCustomer/ReviewSection";

const MenuItemsPublic = () => {
    const { token, user } = useContext(AuthContext);
    const { cart, addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [openReview, setOpenReview] = useState(null);
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(true);

    // === Ambil kategori ===
    useEffect(() => {
        API.get("/categories")
            .then((res) => setCategories(res.data.data || []))
            .catch(() => toast.error("Gagal memuat kategori"));
    }, []);

    // === Ambil menu + rating ===
    useEffect(() => {
        (async () => {
            try {
                const res = await API.get("/menu-items");
                const menus = res.data.data || [];
                setItems(menus);

                const ratingPromises = menus.map((item) =>
                    API.get(`/reviews/menu-item/${item.id}`)
                        .then((res2) => ({
                            id: item.id,
                            avg: res2.data.average_rating || 0,
                            total: res2.data.total_reviews || 0,
                        }))
                        .catch(() => ({ id: item.id, avg: 0, total: 0 }))
                );

                const ratingsData = await Promise.all(ratingPromises);
                const ratingMap = Object.fromEntries(
                    ratingsData.map((r) => [r.id, { avg: r.avg, total: r.total }])
                );

                setRatings(ratingMap);
            } catch {
                toast.error("Gagal memuat menu");
            } finally {
                setLoading(false); 
            }
        })();
    }, []);

    const handleAdd = (item) => {
        if (!user) {
            toast.info("Silakan login terlebih dahulu");
            return navigate("/login");
        }

        if (item.stock === 0) return toast.error("Stok habis!");

        addToCart(item);
        toast.success(`${item.name} ditambahkan ke keranjang`);
    };

    const filteredItems = selectedCategory
        ? items.filter((item) => item.category_id === parseInt(selectedCategory))
        : items;

    const getAverageRating = (menuItemId) => ratings[menuItemId]?.avg || 0;

    // === Skeleton Card ===
    const SkeletonCard = () => (
        <div className="rounded-2xl p-4 border border-purple-100 bg-white animate-pulse">
            <div className="h-40 bg-gray-200 rounded-xl mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-9 bg-gray-200 rounded-xl"></div>
        </div>
    );

    return (
        <div className="pt-24 p-4 max-w-7xl mx-auto flex gap-6">
            <ToastContainer />

            <div className="flex-1">
                <h2 className="text-3xl font-bold text-purple-700 mb-4">
                    Menu Kami
                </h2>

                {/* BEAUTIFUL CATEGORY DROPDOWN */}
                <div className="mb-6">
                    <label className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                        <FiFilter size={18} />
                        Filter berdasarkan kategori
                    </label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mt-2 w-full sm:w-64 px-3 py-2 rounded-xl bg-white border border-purple-200 shadow-sm
                        focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">

                    {/* === SKELETON SAAT LOADING === */}
                    {loading &&
                        Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}

                    {/* === DATA ASLI === */}
                    {!loading &&
                        filteredItems.map((item) => {
                            const avg = getAverageRating(item.id);
                            const id = item.id;

                            return (
                                <div
                                    key={id}
                                    className="rounded-2xl p-4 shadow-md bg-white border border-purple-100
                                    hover:shadow-lg hover:-translate-y-1 transition duration-200 flex flex-col"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-44 object-cover rounded-xl mb-3"
                                    />

                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {item.name}
                                    </h3>

                                    <div className="text-yellow-400 text-sm mb-2">
                                        {"★".repeat(Math.round(avg))}
                                        <span className="text-gray-300">
                                            {"★".repeat(5 - Math.round(avg))}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-1">
                                            ({avg.toFixed(1)}/5)
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">
                                        {item.description}
                                    </p>

                                    <p className="text-purple-700 font-bold mb-3">
                                        Rp {parseInt(item.price).toLocaleString()}
                                    </p>

                                    <button
                                        onClick={() => handleAdd(item)}
                                        disabled={item.stock === 0}
                                        className="py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 
                                        disabled:opacity-50 transition text-sm"
                                    >
                                        {item.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
                                    </button>

                                    <button
                                        onClick={() =>
                                            setOpenReview(openReview === id ? null : id)
                                        }
                                        className="mt-3 text-purple-600 text-sm font-semibold hover:underline"
                                    >
                                        {openReview === id ? "Sembunyikan Ulasan" : "Lihat Ulasan"}
                                    </button>

                                    {openReview === id && (
                                        <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-purple-100">
                                            <ReviewSection
                                                menuItemId={item.id}
                                                token={token}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* CART */}
            {user && cart.length > 0 && (
                <div className="w-80 bg-white shadow-xl rounded-2xl p-4 h-fit sticky top-28 border border-purple-100">
                    <h3 className="text-xl font-bold text-purple-700 mb-3">
                        Keranjang
                    </h3>

                    <button
                        onClick={() => navigate("/checkout")}
                        className="w-full mt-4 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        Checkout ({cart.length})
                    </button>
                </div>
            )}
        </div>
    );
};

export default MenuItemsPublic;
