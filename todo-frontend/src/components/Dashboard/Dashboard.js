import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
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
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    dueDate: '', 
    priority: 'MEDIUM',
    imageUrl: '' 
  });
  const [loading, setLoading] = useState(false);
  
  const calculateTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const inProgress = tasks.filter(task => !task.completed && !task.overdue).length;
    const overdue = tasks.filter(task => task.overdue).length;
    
    return {
      completed: total ? Math.round((completed / total) * 100) : 0,
      inProgress: total ? Math.round((inProgress / total) * 100) : 0,
      overdue: total ? Math.round((overdue / total) * 100) : 0
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

      // Convert date string to ISO format with time
      const dueDate = newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null;

      const response = await axios.post(config.TODOS_URL, {
        title: newTask.title,
        description: newTask.description,
        dueDate: dueDate,
        priority: newTask.priority,
        imageUrl: newTask.imageUrl
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setTasks([...tasks, response.data]);
      setOpenAddDialog(false);
      setNewTask({ 
        title: '', 
        description: '', 
        dueDate: '', 
        priority: 'MEDIUM',
        imageUrl: '' 
      });
    } catch (error) {
      console.error('Failed to add task:', error);
      if (error.response?.status === 403) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return '#f44336';
      case 'MEDIUM':
        return '#ff9800';
      case 'LOW':
        return '#4caf50';
      default:
        return '#757575';
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
              <Box 
                key={task.id} 
                className="task-card"
                sx={{ 
                  borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                  opacity: task.completed ? 0.7 : 1
                }}
              >
                <Box className="task-info">
                  <Typography 
                    variant="subtitle1"
                    sx={{ 
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}
                  >
                    {task.title}
                  </Typography>
                  {task.description && (
                    <Typography variant="body2" color="textSecondary">
                      {task.description}
                    </Typography>
                  )}
                  {task.dueDate && (
                    <Typography 
                      variant="body2" 
                      color={task.overdue ? "error" : "textSecondary"}
                    >
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                  )}
                  {task.imageUrl && (
                    <img 
                      src={task.imageUrl} 
                      alt="Task attachment" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        marginTop: '8px',
                        borderRadius: '4px'
                      }} 
                    />
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
            required
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
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Priority</FormLabel>
            <RadioGroup
              row
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <FormControlLabel 
                value="HIGH" 
                control={<Radio sx={{ color: '#f44336', '&.Mui-checked': { color: '#f44336' } }} />} 
                label="High" 
              />
              <FormControlLabel 
                value="MEDIUM" 
                control={<Radio sx={{ color: '#ff9800', '&.Mui-checked': { color: '#ff9800' } }} />} 
                label="Medium" 
              />
              <FormControlLabel 
                value="LOW" 
                control={<Radio sx={{ color: '#4caf50', '&.Mui-checked': { color: '#4caf50' } }} />} 
                label="Low" 
              />
            </RadioGroup>
          </FormControl>
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            value={newTask.imageUrl}
            onChange={(e) => setNewTask({ ...newTask, imageUrl: e.target.value })}
            helperText="Enter a URL for task image or attachment"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddTask} 
            color="primary" 
            disabled={loading || !newTask.title}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
