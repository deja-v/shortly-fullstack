import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  InputAdornment,
  IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import styles from './styles.module.scss';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login form submitted:', formData);
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
              <span className={styles.footerLink}>Sign up</span>
            </Typography>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
