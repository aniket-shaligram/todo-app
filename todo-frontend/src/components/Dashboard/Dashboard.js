import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axios from 'axios';
import { config } from '../../config';
import TodoList from '../Todo/TodoList';
import TaskStats from '../Todo/TaskStats';
import CompletedTasks from '../Todo/CompletedTasks';
import './Dashboard.css';

const Dashboard = ({ onLogout, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    if (!user) {
      onLogout();
      return;
    }
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
        if (!token) {
          console.error('No auth token found');
          onLogout();
          return;
        }

        const response = await axios.get(config.TODOS_URL, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        if (error.response?.status === 403) {
          onLogout();
        }
      }
    };

    fetchTasks();
  }, [user, onLogout]);

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED');

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="user-profile">
          <Avatar
            src="/avatar.jpg"
            className="avatar"
          />
          <Typography className="user-name">{user?.name || 'Guest'}</Typography>
          <Typography className="user-email">{user?.email || ''}</Typography>
        </div>

        <List className="nav-menu">
          <ListItem 
            button 
            className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNav('dashboard')}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem 
            button 
            className={`nav-item ${activeNav === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveNav('tasks')}
          >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="My Tasks" />
          </ListItem>
          <ListItem 
            button 
            className={`nav-item ${activeNav === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveNav('categories')}
          >
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Categories" />
          </ListItem>
          <ListItem 
            button 
            className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveNav('settings')}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem 
            button 
            className={`nav-item ${activeNav === 'help' ? 'active' : ''}`}
            onClick={() => setActiveNav('help')}
          >
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItem>
          <ListItem 
            button 
            className="nav-item"
            onClick={onLogout}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <Typography className="welcome-text">
            Welcome back{user ? `, ${user.name}` : ''} 👋
          </Typography>
          <div className="header-right">
            <div className="search-bar">
              <TextField
                placeholder="Search your task here..."
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: <SearchIcon className="search-icon" />
                }}
              />
            </div>
            <IconButton>
              <NotificationsIcon />
            </IconButton>
            <IconButton>
              <CalendarMonthIcon />
            </IconButton>
            <button className="invite-button">
              <PersonAddIcon />
              Invite
            </button>
          </div>
        </div>

        {/* Task Container */}
        <div className="task-container">
          <TodoList tasks={tasks} setTasks={setTasks} onLogout={onLogout} />
          
          {/* Status Section */}
          <div className="status-section">
            <Typography variant="h6" gutterBottom>
              Task Status
            </Typography>
            
            <TaskStats tasks={tasks} />
            <CompletedTasks tasks={completedTasks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
