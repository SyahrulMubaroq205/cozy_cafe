import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthProvider, { AuthContext } from "./context/AuthProvider";

// Auth pages
import Login from "./pages/Auth/Login";

// Public pages
import LandingPage from "./pages/Customer/LandingPage";
import MenuItemsPublic from "./pages/Customer/MenuItemPublic";

// Customer pages
import Checkout from "./pages/Customer/Checkout";
import Payment from "./pages/Customer/Payment";
import PaymentHistory from "./pages/Customer/PaymentHistory";

// ➕ Tambahan untuk callback Midtrans (ini file lo bikin nanti)
import PaymentFinish from "./pages/Customer/PaymentFinish";

// Admin pages
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminMenuItems from "./pages/Admin/MenuItems";
import AdminOrders from "./pages/Admin/Orders";
import AdminPayments from "./pages/Admin/Payments";
import AdminReviews from "./pages/Admin/Reviews";

// Layouts
import Layout from "./components/Layout/Layout";
import AdminPageWrapper from "./pages/Admin/PageWrapper";

// Context
import { CartProvider } from "./context/CardContext";
import OrdersPaymentsProvider from "./context/OrderPaymentsContext";
import Register from "./pages/Auth/Register";

function App() {
  return (
    <Router>
      <AuthProvider>
        <OrdersPaymentsProvider>
          <CartProvider>
            <Routes>
              {/* AUTH */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* PUBLIC ROUTES */}
              <Route
                path="/"
                element={
                  <Layout>
                    <LandingPage />
                  </Layout>
                }
              />

              <Route
                path="/menu"
                element={
                  <Layout>
                    <MenuItemsPublic />
                  </Layout>
                }
              />

              {/* CUSTOMER ROUTES */}
              <Route
                path="/checkout"
                element={
                  <PrivateRoute role="customer">
                    <Layout>
                      <Checkout />
                    </Layout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/payment"
                element={
                  <PrivateRoute role="customer">
                    <Layout>
                      <Payment />
                    </Layout>
                  </PrivateRoute>
                }
              />

              <Route
                path="/payment-history"
                element={
                  <PrivateRoute role="customer">
                    <Layout>
                      <PaymentHistory />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* ➕ MIDTRANS CALLBACK ROUTE (baru) */}
              <Route
                path="/payment/finish"
                element={
                  <Layout>
                    <PaymentFinish />
                  </Layout>
                }
              />

              {/* ADMIN ROUTES */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute role="admin">
                    <AdminPageWrapper>
                      <AdminDashboard />
                    </AdminPageWrapper>
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/menu-items"
                element={
                  <PrivateRoute role="admin">
                    <AdminMenuItems />
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/orders"
                element={
                  <PrivateRoute role="admin">
                    <AdminPageWrapper>
                      <AdminOrders />
                    </AdminPageWrapper>
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/payments"
                element={
                  <PrivateRoute role="admin">
                    <AdminPageWrapper>
                      <AdminPayments />
                    </AdminPageWrapper>
                  </PrivateRoute>
                }
              />

              <Route
                path="/admin/reviews"
                element={
                  <PrivateRoute role="admin">
                    <AdminPageWrapper>
                      <AdminReviews />
                    </AdminPageWrapper>
                  </PrivateRoute>
                }
              />

              <Route
                path="/order/:order_number"
                element={
                  <PrivateRoute role="customer">
                    <Layout>
                      <Payment />
                    </Layout>
                  </PrivateRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </OrdersPaymentsProvider>
      </AuthProvider>
    </Router>
  );
}

const PrivateRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;

  return children;
};

export default App;
