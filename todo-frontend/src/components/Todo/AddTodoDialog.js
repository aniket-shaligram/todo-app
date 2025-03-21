import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import axios from 'axios';
import { config } from '../../config';

const AddTodoDialog = ({ open, onClose, onAddTask, onLogout }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    status: 'NOT_STARTED',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);

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
      
      onAddTask(response.data);
      onClose();
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        imageUrl: '',
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

  return (
    <Dialog open={open} onClose={onClose}>
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
          rows={3}
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <TextField
          margin="dense"
          label="Due Date"
          type="datetime-local"
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
        />
        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel>Priority</FormLabel>
          <RadioGroup
            row
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          >
            <FormControlLabel value="LOW" control={<Radio />} label="Low" />
            <FormControlLabel value="MEDIUM" control={<Radio />} label="Medium" />
            <FormControlLabel value="HIGH" control={<Radio />} label="High" />
          </RadioGroup>
        </FormControl>
        <TextField
          margin="dense"
          label="Image URL"
          fullWidth
          value={newTask.imageUrl}
          onChange={(e) => setNewTask({ ...newTask, imageUrl: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleAddTask} 
          disabled={!newTask.title || loading}
          variant="contained"
        >
          Add Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTodoDialog;
