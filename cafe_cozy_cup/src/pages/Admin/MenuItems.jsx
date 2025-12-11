// src/pages/Admin/MenuItems.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthProvider";
import API from "../../api/api";
import AdminPageWrapper from "./PageWrapper";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminMenuItems = () => {
    const { token } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [preview, setPreview] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        is_available: true,
        category_id: "",
        image: null,
    });

    // === Fetch categories ===
    const fetchCategories = async () => {
        try {
            const res = await API.get("/categories");
            setCategories(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    // === Fetch menu items ===
    const fetchItems = async () => {
        try {
            const res = await API.get("/admin/menu-items", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setItems(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchCategories();
            fetchItems();
        }
    }, [token]);

    // === Handle form input ===
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === "file") {
            const file = files[0];
            setFormData({ ...formData, image: file });
            if (file) setPreview(URL.createObjectURL(file));
        } else if (type === "checkbox") {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // === Modal control ===
    const openCreateModal = () => {
        setSelectedItem(null);
        setPreview(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            stock: "",
            is_available: true,
            category_id: "",
            image: null,
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            stock: item.stock,
            is_available: item.is_available,
            category_id: item.category_id,
            image: null,
        });
        setPreview(item.image);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setPreview(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            stock: "",
            is_available: true,
            category_id: "",
            image: null,
        });
    };

    // === Submit form (Create / Update) ===
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const hasFile = formData.image instanceof File;
            const url = selectedItem
                ? `/admin/menu-items/${selectedItem.id}`
                : "/admin/menu-items";

            let payload;
            let headers = { Authorization: `Bearer ${token}` };

            if (hasFile) {
                payload = new FormData();

                Object.entries(formData).forEach(([key, value]) => {
                    if (value !== null && value !== "") {
                        if (typeof value === "boolean") {
                            payload.append(key, value ? 1 : 0);
                        } else {
                            payload.append(key, value);
                        }
                    }
                });

                // kalau update → kirim PUT method override
                if (selectedItem) {
                    payload.append("_method", "PUT");
                }

                headers["Content-Type"] = "multipart/form-data";
            } else {
                // kalau tanpa file
                payload = {
                    ...formData,
                    is_available: formData.is_available ? 1 : 0,
                };
                headers["Content-Type"] = "application/json";
            }

            const res = await API.post(url, payload, { headers });

            toast.success(
                selectedItem
                    ? "✅ Menu item updated successfully!"
                    : "✅ Menu item created successfully!"
            );

            closeModal();
            fetchItems();
        } catch (err) {
            console.error("🔥 Error saving menu:", err.response?.data || err.message);

            const data = err.response?.data;
            const msg = data?.errors
                ? Object.entries(data.errors)
                    .map(([k, v]) => `${k}: ${v.join(", ")}`)
                    .join(" | ")
                : data?.message || "Unknown error";

            toast.error(`❌ Failed to save menu item: ${msg}`);
        } finally {
            setSaving(false);
        }
    };




    // === Delete item ===
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            await API.delete(`/admin/menu-items/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("🗑️ Menu item deleted!");
            fetchItems();
        } catch (err) {
            console.error(err);
            toast.error("❌ Failed to delete menu item!");
        }
    };

    // === Filter items by category ===
    const filteredItems = selectedCategory
        ? items.filter((item) => item.category_id === parseInt(selectedCategory))
        : items;

    if (loading)
        return (
            <AdminPageWrapper>
                <div className="flex flex-col justify-center items-center h-[70vh] text-gray-700">
                    <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-medium">Loading menu items...</p>
                </div>
            </AdminPageWrapper>
        );


    return (
        <AdminPageWrapper>
            <ToastContainer />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Admin Menu Items</h2>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-pink-500 transition"
                >
                    + Create Menu
                </button>
            </div>

            {/* Filter by Category */}
            <div className="mb-6 flex items-center justify-start gap-4">
                <label className="font-semibold text-gray-700">Filter by Category:</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Grid of menu items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        className="relative rounded-xl p-4 shadow-lg bg-gradient-to-br from-purple-500/30 via-pink-400/20 to-purple-300/20 backdrop-blur-md border border-white/20 hover:shadow-2xl transition-all"
                    >
                        <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <h3 className="text-lg font-semibold mb-1 text-gray-900 drop-shadow">
                            {item.name}
                        </h3>
                        <p className="text-gray-700 text-sm italic mb-1 line-clamp-2">
                            {item.description}
                        </p>
                        <p className="text-gray-800 text-sm mb-1">
                            Rp {parseInt(item.price).toLocaleString()}
                        </p>

                        {/* ✅ Tambahan info stok */}
                        <div className="flex items-center gap-2 mb-1">
                            {item.stock > 0 ? (
                                <span className="text-gray-700 text-xs">
                                    <span className="font-semibold">Stock:</span> {item.stock}
                                </span>
                            ) : (
                                <span className="text-red-600 text-xs font-semibold bg-red-100 px-2 py-1 rounded-full">
                                    Out of Stock
                                </span>
                            )}
                        </div>

                        <span className="inline-block bg-white/20 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                            {item.category?.name}
                        </span>

                        <div className="mt-2 flex gap-2 flex-wrap">
                            <button
                                onClick={() => handleEdit(item)}
                                className="px-2 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>


            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 font-bold text-2xl"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-4">
                            {selectedItem ? "Edit Menu Item" : "Create Menu Item"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Menu Name"
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                                required
                            />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Description"
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                                required
                            />
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Price"
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                                required
                            />
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="Stock"
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                                required
                            />
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <div>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="w-full"
                                />
                                {preview && (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="mt-2 w-full h-40 object-cover rounded-lg border"
                                    />
                                )}
                            </div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="is_available"
                                    checked={formData.is_available}
                                    onChange={handleChange}
                                />
                                Available
                            </label>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-pink-500 transition"
                            >
                                {saving
                                    ? "Saving..."
                                    : selectedItem
                                        ? "Update"
                                        : "Create"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminPageWrapper>
    );
};

export default AdminMenuItems;