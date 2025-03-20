import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { config } from '../../config';
import './Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  
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

  useEffect(() => {
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
  }, [onLogout]);

  const handleAddTask = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
      if (!token) {
        console.error('No auth token found');
        onLogout();
        return;
      }

      const response = await axios.post(config.TODOS_URL, newTask, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setTasks([...tasks, response.data]);
      setOpenAddDialog(false);
      setNewTask({ title: '', description: '', dueDate: '' });
    } catch (error) {
      console.error('Failed to add task:', error);
      if (error.response?.status === 403) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
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
          <Button onClick={onLogout} color="primary" variant="outlined">
            Logout
          </Button>
        </Box>
      </Box>

      {/* Welcome Section */}
      <Box className="welcome-section">
        <Typography variant="h4" component="h1">
          Welcome back! 👋
        </Typography>
      </Box>

      {/* Main Content */}
      <Box className="dashboard-content">
        <Box className="tasks-section">
          <Box className="section-header">
            <Typography variant="h6">To-Do</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setOpenAddDialog(true)}
              color="primary"
              variant="contained"
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
                  {task.dueDate && (
                    <Typography variant="body2" color="textSecondary">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Add Task Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddTask} color="primary" disabled={loading}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
