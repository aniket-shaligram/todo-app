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
  FormLabel,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip
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
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import { config } from '../../config';
import './Dashboard.css';

const Dashboard = ({ onLogout, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    dueDate: '', 
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    imageUrl: '' 
  });
  const [loading, setLoading] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleMenuOpen = (event, task) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const toggleTaskComplete = async (task) => {
    try {
      const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
      if (!token) {
        console.error('No auth token found');
        onLogout();
        return;
      }

      const response = await axios.patch(`${config.TODOS_URL}/${task.id}/complete`, null, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
      handleMenuClose();
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      if (error.response?.status === 403) {
        onLogout();
      }
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
      if (!token) {
        console.error('No auth token found');
        onLogout();
        return;
      }

      const response = await axios.put(`${config.TODOS_URL}/${task.id}`, {
        ...task,
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
      handleMenuClose();
    } catch (error) {
      console.error('Failed to update task:', error);
      if (error.response?.status === 403) {
        onLogout();
      }
    }
  };

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

  const handleAddTask = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
      if (!token) {
        console.error('No auth token found');
        onLogout();
        return;
      }

      const dueDate = newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null;

      const response = await axios.post(config.TODOS_URL, {
        title: newTask.title,
        description: newTask.description,
        dueDate: dueDate,
        priority: newTask.priority,
        status: newTask.status,
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
        status: 'NOT_STARTED',
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return '#4caf50';
      case 'IN_PROGRESS':
        return '#2196f3';
      case 'NOT_STARTED':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const stats = calculateTaskStats();
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
          {/* Tasks Section */}
          <div className="task-section">
            <div className="section-header">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">To-Do</Typography>
                <Typography color="textSecondary">
                  {new Date().toLocaleDateString('en-US', { 
                    day: 'numeric',
                    month: 'long'
                  })}
                </Typography>
              </Box>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setOpenAddDialog(true)}
                variant="contained"
                sx={{ bgcolor: '#ff6b6b', '&:hover': { bgcolor: '#ff5252' } }}
              >
                Add task
              </Button>
            </div>
            
            <div className="task-list">
              {tasks.filter(task => task.status !== 'COMPLETED').map((task) => (
                <div key={task.id} className="task-card">
                  <div 
                    className="task-status"
                    style={{ backgroundColor: getStatusColor(task.status) }}
                  />
                  <div className="task-content">
                    <Typography className="task-title">
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography className="task-description">
                        {task.description}
                      </Typography>
                    )}
                    <div className="task-meta">
                      <span>Priority: {task.priority}</span>
                      <span>Status: {task.status.replace('_', ' ')}</span>
                      {task.dueDate && (
                        <span>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.imageUrl && (
                    <img 
                      src={task.imageUrl} 
                      alt="Task attachment"
                      className="task-image"
                    />
                  )}
                  <Tooltip title="Task actions">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, task)}
                      className="task-menu-button"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>

          {/* Status Section */}
          <div className="status-section">
            <Typography variant="h6" gutterBottom>
              Task Status
            </Typography>
            
            <div className="status-charts">
              <div className="chart-container">
                <CircularProgress 
                  variant="determinate" 
                  value={stats.completed} 
                  size={120}
                  thickness={8}
                  sx={{ color: '#4caf50' }}
                />
                <Typography>
                  Completed ({stats.completed}%)
                </Typography>
              </div>
              <div className="chart-container">
                <CircularProgress 
                  variant="determinate" 
                  value={stats.inProgress} 
                  size={120}
                  thickness={8}
                  sx={{ color: '#2196f3' }}
                />
                <Typography>
                  In Progress ({stats.inProgress}%)
                </Typography>
              </div>
              <div className="chart-container">
                <CircularProgress 
                  variant="determinate" 
                  value={stats.notStarted} 
                  size={120}
                  thickness={8}
                  sx={{ color: '#f44336' }}
                />
                <Typography>
                  Not Started ({stats.notStarted}%)
                </Typography>
              </div>
            </div>

            <div className="completed-tasks">
              <Typography variant="h6" gutterBottom>
                Completed Tasks
              </Typography>
              {completedTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="completed-task-card">
                  {task.imageUrl ? (
                    <img 
                      src={task.imageUrl} 
                      alt="Task" 
                      className="completed-task-image"
                    />
                  ) : (
                    <div 
                      className="completed-task-image" 
                      style={{ background: '#f5f5f5' }}
                    />
                  )}
                  <div className="completed-task-content">
                    <Typography className="completed-task-title">
                      {task.title}
                    </Typography>
                    <Typography className="completed-task-date">
                      Completed {new Date(task.updatedAt).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedTask?.status !== 'COMPLETED' && (
          <MenuItem onClick={() => toggleTaskComplete(selectedTask)}>
            <CheckCircleIcon sx={{ mr: 1, color: '#4caf50' }} />
            {selectedTask?.status === 'COMPLETED' ? 'Mark as Incomplete' : 'Mark as Complete'}
          </MenuItem>
        )}
        {selectedTask?.status === 'NOT_STARTED' && (
          <MenuItem onClick={() => handleStatusChange(selectedTask, 'IN_PROGRESS')}>
            <PlayArrowIcon sx={{ mr: 1, color: '#2196f3' }} />
            Start Task
          </MenuItem>
        )}
      </Menu>

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
          <Button onClick={() => setOpenAddDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddTask} 
            disabled={loading || !newTask.title}
            sx={{ 
              bgcolor: '#ff6b6b', 
              color: 'white',
              '&:hover': { bgcolor: '#ff5252' },
              '&:disabled': { bgcolor: '#ffcdd2' }
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
