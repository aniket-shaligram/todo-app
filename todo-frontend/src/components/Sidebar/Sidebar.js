import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import './Sidebar.css';

const Sidebar = ({ user, onLogout }) => {
  const navItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', active: true },
    { icon: <AssignmentLateIcon />, label: 'Vital Task' },
    { icon: <AssignmentIcon />, label: 'My Task' },
    { icon: <CategoryIcon />, label: 'Task Categories' },
    { icon: <SettingsIcon />, label: 'Settings' },
    { icon: <HelpIcon />, label: 'Help' },
  ];

  return (
    <Box className="sidebar">
      <Box className="sidebar-header">
        <Avatar
          src={user?.avatar}
          alt={user?.name}
          className="sidebar-avatar"
        />
        <Typography variant="h6">{user?.name || 'User'}</Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.7)">
          {user?.email}
        </Typography>
      </Box>

      <nav className="nav-items">
        {navItems.map((item, index) => (
          <Box
            key={index}
            className={`nav-item ${item.active ? 'active' : ''}`}
          >
            {item.icon}
            <Typography>{item.label}</Typography>
          </Box>
        ))}
      </nav>

      <Box
        className="nav-item logout"
        onClick={onLogout}
        sx={{ marginTop: 'auto' }}
      >
        <LogoutIcon />
        <Typography>Logout</Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
