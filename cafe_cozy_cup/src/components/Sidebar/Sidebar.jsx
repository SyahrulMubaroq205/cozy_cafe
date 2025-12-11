import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiCoffee, FiShoppingCart, FiCreditCard, FiStar } from "react-icons/fi";

const Sidebar = () => {
    const linkClasses = ({ isActive }) =>
        `flex items-center gap-2 px-4 py-3 rounded-lg transition-colors duration-200 font-medium ${
            isActive
                ? "bg-purple-600 text-white shadow-md"
                : "text-white hover:bg-white/20 hover:text-purple-100"
        }`;

    return (
        <nav className="flex flex-col space-y-4">
            <NavLink to="/admin/dashboard" className={linkClasses}>
                <FiHome /> Dashboard
            </NavLink>
            <NavLink to="/admin/menu-items" className={linkClasses}>
                <FiCoffee /> Menu Items
            </NavLink>
            <NavLink to="/admin/orders" className={linkClasses}>
                <FiShoppingCart /> Orders
            </NavLink>
            <NavLink to="/admin/payments" className={linkClasses}>
                <FiCreditCard /> Payments
            </NavLink>
            <NavLink to="/admin/reviews" className={linkClasses}>
                <FiStar /> Reviews
            </NavLink>
        </nav>
    );
};

export default Sidebar;
