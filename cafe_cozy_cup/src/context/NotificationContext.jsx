import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/notifications", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                params: {
                    t: Date.now(), // 🚀 Anti-cache → notif baru selalu muncul
                }
            });

            setNotifications(res.data.data);
        } catch (err) {
            console.log("Failed to fetch notifications", err);
        }
    };

    const markAsRead = async (id) => {
        try {
            const res = await axios.post(
                `http://127.0.0.1:8000/api/notifications/read/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            // Update state agar langsung berubah di UI
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, is_read: true } : n
                )
            );
        } catch (err) {
            console.log("Failed to mark as read", err);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Auto refresh setiap 3 detik
        const interval = setInterval(fetchNotifications, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
