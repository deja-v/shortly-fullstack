import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Outlet, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Url from "./components/url";
import Login from "./components/login";
import Register from "./components/register";
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
  const navigate = useNavigate();

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
    navigate("/login");
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
              <Link to="/" className={styles.navLink}>
                Dashboard
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<PrivateRoutes />}>
                <Route path="/" element={<Url />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
