import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Outlet, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/dashboard/index.jsx";
import Analytics from "./components/analytics/index.jsx";
import UrlAnalytics from "./components/analytics/UrlAnalytics.jsx";
import Login from "./components/login";
import Register from "./components/register";
import Home from "./components/home/index.jsx";
import ThemeSwitcher from "./components/common/ThemeSwitcher";
import styles from "./App.module.scss";

const PrivateRoutes = () => {
  const { isAuthenticated, isValidating } = useAuth();

  if (isValidating) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const Navigation = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        <h2 className={styles.title}>Shortly</h2>
      </Link>
      <div className={styles.navRight}>
        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={styles.navLink}>
                Dashboard
              </Link>
              <Link to="/analytics" className={styles.navLink}>
                Analytics
              </Link>
              <button onClick={handleLogout} className={styles.navLink}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.navLink}>
                Sign In
              </Link>
              <Link to="/register" className={styles.navLink}>
                Sign Up
              </Link>
            </>
          )}
        </div>
        <ThemeSwitcher />
      </div>
    </nav>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className={styles.container}>
            <Navigation />
            <main className={styles.main}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route element={<PrivateRoutes />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/analytics/url/:shortId" element={<UrlAnalytics />} />
                </Route>
              </Routes>
            </main>
            <ToastContainer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
