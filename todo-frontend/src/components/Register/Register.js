import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Link } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import registerIllustration from '../../assets/register-illustration.svg';
import './Register.css';

const Register = ({ onRegister }) => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const success = await onRegister({
        name: `${userData.firstName} ${userData.lastName}`,
        username: userData.username,
        email: userData.email,
        password: userData.password
      });
      if (!success) {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  const InputField = ({ name, label, type = 'text', icon }) => (
    <Box className="input-field" sx={{ position: 'relative' }}>
      <Box sx={{ 
        position: 'absolute', 
        left: '14px', 
        top: '50%', 
        transform: 'translateY(-50%)',
        color: '#666',
        zIndex: 1
      }}>
        {icon}
      </Box>
      <TextField
        required
        fullWidth
        id={name}
        name={name}
        label={label}
        type={type}
        value={userData[name]}
        onChange={(e) => setUserData({ ...userData, [name]: e.target.value })}
        InputProps={{
          sx: { paddingLeft: '40px' }
        }}
      />
    </Box>
  );

  return (
    <div className="register-container">
      <div className="register-form-container">
        <div className="register-illustration">
          <img src={registerIllustration} alt="Register" />
        </div>
        <Box component="form" onSubmit={handleSubmit} className="register-form">
          <Typography className="register-title">
            Sign Up
          </Typography>
          
          {error && (
            <Typography color="error" align="center" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <InputField 
            name="firstName" 
            label="Enter First Name" 
            icon={<PersonIcon />} 
          />
          <InputField 
            name="lastName" 
            label="Enter Last Name" 
            icon={<PersonIcon />} 
          />
          <InputField 
            name="username" 
            label="Enter Username" 
            icon={<PersonIcon />} 
          />
          <InputField 
            name="email" 
            label="Enter Email" 
            type="email"
            icon={<EmailIcon />} 
          />
          <InputField 
            name="password" 
            label="Enter Password" 
            type="password"
            icon={<LockIcon />} 
          />
          <InputField 
            name="confirmPassword" 
            label="Confirm Password" 
            type="password"
            icon={<LockIcon />} 
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={userData.agreeToTerms}
                onChange={(e) => setUserData({ ...userData, agreeToTerms: e.target.checked })}
                color="primary"
              />
            }
            label="I agree to all terms"
            className="terms-checkbox"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className="register-button"
          >
            Register
          </Button>

          <Typography className="sign-in-link">
            Already have an account?
            <Link to="/login">Sign In</Link>
          </Typography>
        </Box>
      </div>
    </div>
  );
};

export default Register;
