/**
 * App.jsx - Root component with React Router configuration.
 * Admin/Manager see the management dashboard; Viewer sees an e-commerce storefront.
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Inventory from './pages/Inventory';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';

const isAuthenticated = () => !!localStorage.getItem('opm_user');
const getUserRole = () => {
  const raw = localStorage.getItem('opm_user');
  return raw ? JSON.parse(raw).role : null;
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

/** Redirects to the appropriate home page based on role */
const RoleBasedHome = () => {
  const role = getUserRole();
  return role === 'viewer' ? <Navigate to="/shop" replace /> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <CartProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoleBasedHome />} />
            {/* Admin/Manager routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="inventory" element={<Inventory />} />
            {/* Viewer (e-commerce) routes */}
            <Route path="shop" element={<Shop />} />
            <Route path="cart" element={<Cart />} />
            <Route path="my-orders" element={<MyOrders />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
