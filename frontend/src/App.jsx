import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Url from './components/url'
import Login from './components/login'
import Register from './components/register'
import ThemeSwitcher from './components/common/ThemeSwitcher'
import styles from './App.module.scss'

function App() {
  const [count, setCount] = useState(0)

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
                <Link to="/login" className={styles.navLink}>Sign In</Link>
                <Link to="/register" className={styles.navLink}>Sign Up</Link>
              </div>
              <ThemeSwitcher />
            </div>
          </nav>

          <main className={styles.main}>
            <Routes>
              <Route path="/" element={<Url />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
