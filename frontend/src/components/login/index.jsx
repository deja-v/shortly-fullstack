import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  TextField, 
  Button, 
  Typography, 
  InputAdornment,
  IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import styles from './styles.module.scss';
import axiosInstance from '../../utils/axiosInstance';
import { isAxiosError } from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogin = async () => {
    setError('');
    setFieldErrors({});
    
    try {
      const response = await axiosInstance.post("/user/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data && response.data.accessToken) {
        login(response.data.accessToken);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Login error:', error);
      if (isAxiosError(error) && error.response) {
        const data = error.response.data;
        
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const newFieldErrors = {};
          data.errors.forEach(err => {
            if (err.field && err.message) {
              newFieldErrors[err.field] = err.message;
            }
          });
          setFieldErrors(newFieldErrors);
          
          // Don't show general error message for validation errors
          setError('');
        } else {
          // Handle other types of errors
          setError(data.message || "An unexpected error occurred. Please try again");
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(error.message || "An unexpected error occurred. Please try again");
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>S</div>
            <Typography variant="h4" className={styles.appName}>
              Shortly
            </Typography>
          </div>
          <Typography variant="h4" className={styles.title}>
            Welcome back
          </Typography>
          <Typography variant="body1" className={styles.subtitle}>
            Sign in to your Shortly account
          </Typography>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <Typography variant="body2" className={styles.label}>
              Email Address
            </Typography>
            <TextField
              fullWidth
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={styles.input}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className={styles.field}>
            <Typography variant="body2" className={styles.label}>
              Password
            </Typography>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={styles.input}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className={styles.inputIcon} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      className={styles.passwordToggle}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {error && (
            <div className={styles.errorContainer}>
              <Typography variant="body2" className={styles.errorText}>
                {error}
              </Typography>
            </div>
          )}

          {/* <div className={styles.forgotPassword}>
            <Typography variant="body2" className={styles.forgotLink}>
              Forgot password?
            </Typography>
          </div> */}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className={styles.submitBtn}
          >
            Sign In
          </Button>

          <div className={styles.footer}>
            <Typography variant="body2" className={styles.footerText}>
              Don't have an account?{' '}
              <span className={styles.footerLink} onClick={() => navigate("/register")}>
                Sign up
              </span>
            </Typography>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
