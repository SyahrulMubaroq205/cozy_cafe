import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { CartContext } from "../../context/CardContext";
import API from "../../api/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import ReviewSection from "../../components/ReviewCustomer/ReviewSection";

const MenuItems = () => {
    const { token, user } = useContext(AuthContext);
    const { cart, addToCart, removeFromCart, decreaseFromCart } =
        useContext(CartContext);
    const navigate = useNavigate();

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [openReview, setOpenReview] = useState(null);
    const [ratings, setRatings] = useState({});
    const [newCartItem, setNewCartItem] = useState(null);

    // === Ambil kategori ===
    useEffect(() => {
        if (!token) return;
        API.get("/categories", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => setCategories(res.data.data || []))
            .catch(() => toast.error("Gagal memuat kategori"));
    }, [token]);

    // === Ambil menu + rating ===
    useEffect(() => {
        if (!token) return;
        (async () => {
            try {
                const res = await API.get("/menu-items", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const menus = res.data.data || [];
                setItems(menus);

                // Ambil rating tiap menu secara paralel
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
            }
        })();
    }, [token]);

    // === Update rating setelah tambah review baru ===
    const handleNewReview = async (menuItemId) => {
        try {
            const res = await API.get(`/reviews/menu-item/${menuItemId}`);
            const data = res.data;
            if (data.success) {
                setRatings((prev) => ({
                    ...prev,
                    [menuItemId]: {
                        avg: data.average_rating || 0,
                        total: data.total_reviews || 0,
                    },
                }));
            }
        } catch {
            console.error("Gagal memperbarui rating");
        }
    };

    // === Dapatkan rata-rata rating ===
    const getAverageRating = (menuItemId) =>
        ratings[menuItemId]?.avg || 0;

    // === Filter kategori ===
    const filteredItems = selectedCategory
        ? items.filter((item) => item.category_id === parseInt(selectedCategory))
        : items;

    // === Tambah ke keranjang ===
    const handleAdd = (item) => {
        if (item.stock === 0) return toast.error("Stok habis!");
        addToCart(item);
        toast.success(`${item.name} ditambahkan ke keranjang`);
        setNewCartItem(item.id);
        setTimeout(() => setNewCartItem(null), 500);
    };

    return (
        <div className="pt-24 p-4 max-w-7xl mx-auto flex gap-6">
            <ToastContainer />

            {/* === LIST MENU === */}
            <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4 text-purple-600">
                    Selamat datang, {user?.name}
                </h2>

                {/* Filter Kategori */}
                <div className="mb-4">
                    <label className="mr-2 font-semibold">Kategori:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="">Semua</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Grid Menu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                    {filteredItems.map((item) => {
                        const avg = getAverageRating(item.id);
                        const uniqueId = item.id;

                        return (
                            <div
                                key={uniqueId}
                                className="rounded-xl p-4 shadow-md bg-white border border-purple-100 transition flex flex-col hover:shadow-lg hover:scale-[1.02] duration-200"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-40 object-cover rounded-lg mb-2"
                                />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {item.name}
                                </h3>

                                {/* ⭐ Rating */}
                                <div className="text-yellow-400 text-sm mb-1">
                                    {"★".repeat(Math.round(avg))}
                                    <span className="text-gray-300">
                                        {"★".repeat(5 - Math.round(avg))}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">
                                        ({avg.toFixed(1)}/5)
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {item.description}
                                </p>
                                <p className="text-purple-700 font-semibold mb-1">
                                    Rp {parseInt(item.price).toLocaleString()}
                                </p>

                                <button
                                    onClick={() => handleAdd(item)}
                                    disabled={item.stock === 0}
                                    className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm"
                                >
                                    {item.stock > 0 ? "Tambah ke Keranjang" : "Stok Habis"}
                                </button>

                                {/* Tombol Review */}
                                <button
                                    onClick={() =>
                                        setOpenReview(openReview === uniqueId ? null : uniqueId)
                                    }
                                    className="mt-2 text-purple-600 text-sm font-semibold hover:underline"
                                >
                                    {openReview === uniqueId
                                        ? "Sembunyikan Ulasan"
                                        : "Lihat Ulasan"}
                                </button>

                                {/* Section Review */}
                                {openReview === uniqueId && (
                                    <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-purple-100 animate-fadeIn">
                                        <ReviewSection
                                            menuItemId={item.id}
                                            token={token}
                                            onNewReview={() => handleNewReview(item.id)}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* === CART === */}
            {cart.length > 0 && (
                <div className="w-80 bg-white shadow-xl rounded-2xl p-4 h-fit sticky top-28 border border-purple-100 animate-fadeIn">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold text-purple-700">🛒 Keranjang</h3>
                        <button
                            onClick={() => cart.forEach((c) => removeFromCart(c.menu_item_id))}
                            className="text-red-500 text-sm hover:underline"
                        >
                            ✕ Hapus Semua
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {cart.map((c) => (
                            <div
                                key={c.menu_item_id}
                                className={`flex justify-between items-center border-b pb-2 ${newCartItem === c.menu_item_id ? "animate-fadeIn" : ""
                                    }`}
                            >
                                <div>
                                    <p className="font-semibold text-sm">{c.name}</p>
                                    <p className="text-xs text-gray-500">
                                        Rp {parseInt(c.price).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => decreaseFromCart(c)}
                                        className="bg-purple-100 text-purple-700 px-2 rounded-md"
                                    >
                                        -
                                    </button>
                                    <span>{c.quantity}</span>
                                    <button
                                        onClick={() => addToCart(c)}
                                        className="bg-purple-100 text-purple-700 px-2 rounded-md"
                                    >
                                        +
                                    </button>
                                    <button
                                        onClick={() => removeFromCart(c.menu_item_id)}
                                        className="text-red-500 ml-2 text-sm hover:underline"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

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

export default MenuItems;
