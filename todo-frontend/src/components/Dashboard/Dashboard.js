import React, { useState } from 'react';
import { Box, Typography, TextField, IconButton, Avatar, Button, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import './Dashboard.css';

const Dashboard = ({ user, tasks, onAddTask }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const calculateTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    const inProgress = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    const notStarted = tasks.filter(task => task.status === 'NOT_STARTED').length;
    
    return {
      completed: total ? Math.round((completed / total) * 100) : 0,
      inProgress: total ? Math.round((inProgress / total) * 100) : 0,
      notStarted: total ? Math.round((notStarted / total) * 100) : 0
    };
  };

  const stats = calculateTaskStats();
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <Box className="dashboard-header">
        <Box className="search-bar">
          <TextField
            placeholder="Search your task here..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
        <Box className="header-actions">
          <IconButton>
            <NotificationsIcon />
          </IconButton>
          <IconButton>
            <CalendarMonthIcon />
          </IconButton>
          <Typography variant="body2" color="textSecondary">
            {formattedDate}
          </Typography>
        </Box>
      </Box>

      {/* Welcome Section */}
      <Box className="welcome-section">
        <Typography variant="h4" component="h1">
          Welcome back, {user?.name || 'User'} 👋
        </Typography>
        <Box className="team-avatars">
          {/* Team avatars would go here */}
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Invite
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box className="dashboard-content">
        <Box className="tasks-section">
          <Box className="section-header">
            <Typography variant="h6">To-Do</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={onAddTask}
              color="primary"
            >
              Add task
            </Button>
          </Box>
          
          {/* Task List */}
          <Box className="task-list">
            {tasks.map((task) => (
              <Box key={task.id} className="task-card">
                <Box className="task-info">
                  <Typography variant="subtitle1">{task.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {task.description}
                  </Typography>
                </Box>
                {task.image && (
                  <Box className="task-image">
                    <img src={task.image} alt={task.title} />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Task Status */}
        <Box className="status-section">
          <Typography variant="h6">Task Status</Typography>
          <Box className="status-charts">
            <Box className="status-item">
              <CircularProgress
                variant="determinate"
                value={stats.completed}
                color="success"
                size={80}
              />
              <Typography>Completed</Typography>
              <Typography variant="h6">{stats.completed}%</Typography>
            </Box>
            <Box className="status-item">
              <CircularProgress
                variant="determinate"
                value={stats.inProgress}
                color="primary"
                size={80}
              />
              <Typography>In Progress</Typography>
              <Typography variant="h6">{stats.inProgress}%</Typography>
            </Box>
            <Box className="status-item">
              <CircularProgress
                variant="determinate"
                value={stats.notStarted}
                color="error"
                size={80}
              />
              <Typography>Not Started</Typography>
              <Typography variant="h6">{stats.notStarted}%</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default Dashboard;
