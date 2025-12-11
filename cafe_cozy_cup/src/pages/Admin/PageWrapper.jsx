// src/pages/Admin/AdminPageWrapper.jsx
import React from "react";
import Sidebar from "../../components/Sidebar/Sidebar";

const AdminPageWrapper = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-purple-700 via-purple-500 to-purple-300 text-white shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-8 text-center tracking-wide">Admin Panel</h2>
                <Sidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
        </div>
    );
};

export default AdminPageWrapper;
