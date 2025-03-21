import React, { useState } from 'react';
import {
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';
import { config } from '../../config';
import AddTodoDialog from './AddTodoDialog';

const TodoList = ({ tasks, setTasks, onLogout }) => {
  const [openAddDialog, setOpenAddDialog] = useState(false);
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

  return (
    <div className="task-section">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Typography variant="h6">To-Do</Typography>
          <Typography color="textSecondary">
            {new Date().toLocaleDateString('en-US', { 
              day: 'numeric',
              month: 'long'
            })}
          </Typography>
        </div>
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

      <AddTodoDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onAddTask={(newTask) => setTasks([...tasks, newTask])}
        onLogout={onLogout}
      />
    </div>
  );
};

export default TodoList;
