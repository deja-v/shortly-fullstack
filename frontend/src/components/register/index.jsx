import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  InputAdornment,
  IconButton 
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Person } from '@mui/icons-material';
import styles from './styles.module.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
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
    console.log('Register form submitted:', formData);
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
            Create account
          </Typography>
          <Typography variant="body1" className={styles.subtitle}>
            Join Shortly and start shortening URLs
          </Typography>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <Typography variant="body2" className={styles.label}>
              Full Name
            </Typography>
            <TextField
              fullWidth
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={styles.input}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </div>

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
              placeholder="Enter your email address"
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
              placeholder="Create a strong password"
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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className={styles.submitBtn}
          >
            Create Account
          </Button>

          <div className={styles.footer}>
            <Typography variant="body2" className={styles.footerText}>
              Already have an account?{' '}
              <span className={styles.footerLink}>Sign in</span>
            </Typography>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
