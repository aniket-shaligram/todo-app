import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Dialog,
  DialogContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../../config';
import './AccountInfo.css';

const AccountInfo = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    contactNumber: user?.contactNumber || '',
    position: user?.position || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateInfo = async () => {
    try {
      const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
      if (!token) {
        onLogout();
        return;
      }

      await axios.put(`${config.API_URL}/users/profile`, {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        contactNumber: formData.contactNumber,
        position: formData.position
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Show success message or update user context
    } catch (error) {
      setError('Failed to update profile. Please try again.');
      if (error.response?.status === 403) {
        onLogout();
      }
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
      if (!token) {
        onLogout();
        return;
      }

      await axios.put(`${config.API_URL}/users/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setOpenPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      // Show success message
    } catch (error) {
      setError('Failed to change password. Please verify your current password.');
      if (error.response?.status === 403) {
        onLogout();
      }
    }
  };

  return (
    <div className="account-container">
      <div className="account-header">
        <Typography className="account-title">
          Account Information
        </Typography>
        <Button 
          className="go-back-button"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </div>

      <div className="user-info">
        <Avatar
          src={user?.avatarUrl}
          alt={user?.name}
          className="user-avatar"
        />
        <div className="user-details">
          <Typography className="user-name">
            {user?.name}
          </Typography>
          <Typography className="user-email">
            {user?.email}
          </Typography>
        </div>
      </div>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box className="form-container">
        <TextField
          className="form-field"
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          fullWidth
        />
        <TextField
          className="form-field"
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          fullWidth
        />
        <TextField
          className="form-field"
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          fullWidth
        />
        <TextField
          className="form-field"
          label="Contact Number"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleInputChange}
          fullWidth
        />
        <TextField
          className="form-field"
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleInputChange}
          fullWidth
        />
      </Box>

      <div className="form-actions">
        <Button
          className="update-button"
          onClick={handleUpdateInfo}
        >
          Update Info
        </Button>
        <Button
          className="change-password-button"
          onClick={() => setOpenPasswordDialog(true)}
        >
          Change Password
        </Button>
      </div>

      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent className="password-dialog">
          <Typography className="password-dialog-title">
            Change Password
          </Typography>
          
          <Box className="password-form">
            <TextField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              fullWidth
            />
            <TextField
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              fullWidth
            />
          </Box>

          <div className="dialog-actions">
            <Button
              onClick={() => setOpenPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="update-button"
              onClick={handleChangePassword}
            >
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountInfo;
