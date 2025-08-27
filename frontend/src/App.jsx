import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Outlet, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Url from "./components/url";
import Login from "./components/login";
import Register from "./components/register";
import Home from "./components/home/index.jsx";
import ThemeSwitcher from "./components/common/ThemeSwitcher";
import { validateToken } from "./utils/axiosInstance";
import styles from "./App.module.scss";

const PrivateRoutes = () => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      setIsAuthenticated(isValid);
      setIsValidating(false);
    };

    checkAuth();
  }, []);

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      setIsAuthenticated(isValid);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
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
                <Route path="/dashboard" element={<Url />} />
                <Route path="/analytics" element={<div>Analytics Page - Coming Soon</div>} />
              </Route>
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
