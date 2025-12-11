import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Ambil data user dari localStorage saat awal load
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    // Persist login setelah reload
    useEffect(() => {
        if (token && !user) {
            const savedUser = localStorage.getItem("user");
            if (savedUser) setUser(JSON.parse(savedUser));
        }
    }, [token, user]);

    // LOGIN
    const login = (userData, tokenValue) => {
        setUser(userData);
        setToken(tokenValue);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenValue);

        if (userData.role === "admin") navigate("/admin/dashboard");
        else navigate("/menu");
    };

    // REGISTER (auto login)
    const register = (userData, tokenValue) => {
        setUser(userData);
        setToken(tokenValue);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", tokenValue);
        navigate("/menu");
    };

    // LOGOUT
    const logout = () => {
        setUser(null);
        setToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        navigate("/");
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                token, 
                login, 
                register, 
                logout 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
