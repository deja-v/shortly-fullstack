import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Outlet, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Url from "./components/url";
import Login from "./components/login";
import Register from "./components/register";
import ThemeSwitcher from "./components/common/ThemeSwitcher";
import styles from "./App.module.scss";

const PrivateRoutes = () => {
  const token = localStorage.getItem("token");
  
  return token ? <Outlet /> : <Navigate to="/login" />;
};

function App() {

  return (
    <ThemeProvider>
      <Router>
        <div className={styles.container}>
          <nav className={styles.navbar}>
            <Link to="/" className={styles.logo}>
              <h2 className={styles.title}>Shortly</h2>
            </Link>
            <div className={styles.navRight}>
              <div className={styles.navLinks}>
                <Link to="/login" className={styles.navLink}>
                  Sign In
                </Link>
                <Link to="/register" className={styles.navLink}>
                  Sign Up
                </Link>
              </div>
              <ThemeSwitcher />
            </div>
          </nav>

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
