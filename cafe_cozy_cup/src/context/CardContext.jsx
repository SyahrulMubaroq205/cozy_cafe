import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // ➕ Tambah item ke cart
    const addToCart = (item) => {
        setCart((prev) => {
            // Gunakan ID yang pasti (bisa dari item.id atau item.menu_item_id)
            const id = item.id || item.menu_item_id;

            const existing = prev.find((i) => i.menu_item_id === id);

            if (existing) {
                // kalau udah ada, tambahkan quantity-nya
                return prev.map((i) =>
                    i.menu_item_id === id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            } else {
                // kalau belum ada, tambahkan baru
                return [
                    ...prev,
                    {
                        menu_item_id: id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                    },
                ];
            }
        });
    };


    // ➖ Kurangi jumlah item
    const decreaseFromCart = (item) => {
        setCart((prev) => {
            const id = item.id || item.menu_item_id;
            const existing = prev.find((i) => i.menu_item_id === id);
            if (!existing) return prev;

            if (existing.quantity > 1) {
                return prev.map((i) =>
                    i.menu_item_id === id
                        ? { ...i, quantity: i.quantity - 1 }
                        : i
                );
            } else {
                return prev.filter((i) => i.menu_item_id !== id);
            }
        });
    };


    // ❌ Hapus item sepenuhnya
    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((i) => i.menu_item_id !== id));
    };

    // 🧹 Hapus semua item
    const clearCart = () => setCart([]);

    // 💰 Total harga semua item
    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                decreaseFromCart,
                removeFromCart,
                clearCart,
                total,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
