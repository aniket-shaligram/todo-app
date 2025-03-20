import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Paper, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Checkbox, Box, Chip, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import AdminPortal from './components/admin/AdminPortal';
import config from './config';

const API_URL = config.API_URL;
const AUTH_TOKEN_KEY = config.AUTH_TOKEN_KEY;

const TodoForm = memo(({ onSubmit, initialData = null }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ? dayjs(initialData.dueDate) : null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, dueDate: dueDate ? dueDate.toISOString() : null });
    if (!initialData) {
      setTitle('');
      setDueDate(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          fullWidth
          label="Todo Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoComplete="off"
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Due Date (optional)"
            value={dueDate}
            onChange={setDueDate}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </LocalizationProvider>
        <Button type="submit" variant="contained" color="primary">
          {initialData ? 'Update Todo' : 'Add Todo'}
        </Button>
      </Box>
    </form>
  );
});

const EditTodoDialog = memo(({ todo, open, onClose, onSave }) => {
  if (!todo) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Todo</DialogTitle>
      <DialogContent>
        <Box py={2}>
          <TodoForm
            initialData={todo}
            onSubmit={(data) => {
              onSave({ ...todo, ...data });
              onClose();
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
});

const TodoItem = memo(({ todo, onToggle, onDelete, onEdit }) => (
  <ListItem divider>
    <Checkbox
      checked={todo.completed}
      onChange={() => onToggle(todo)}
      color="primary"
    />
    <ListItemText
      primary={todo.title}
      secondary={todo.dueDate && (
        <Box display="flex" gap={1} mt={0.5}>
          <Chip
            label={`Due: ${dayjs(todo.dueDate).format('MMM D, YYYY h:mm A')}`}
            color={todo.overdue ? "error" : "default"}
            size="small"
          />
          {todo.overdue && !todo.completed && (
            <Chip label="OVERDUE" color="error" size="small" />
          )}
        </Box>
      )}
      style={{
        textDecoration: todo.completed ? 'line-through' : 'none',
        color: todo.completed ? 'gray' : 'inherit'
      }}
      onClick={() => onEdit(todo)}
      sx={{ cursor: 'pointer' }}
    />
    <ListItemSecondaryAction>
      <IconButton edge="end" onClick={() => onEdit(todo)} sx={{ mr: 1 }}>
        ✏️
      </IconButton>
      <IconButton edge="end" onClick={() => onDelete(todo.id)}>
        🗑️
      </IconButton>
    </ListItemSecondaryAction>
  </ListItem>
));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [todos, setTodos] = useState([]);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      setIsAuthenticated(true);
      checkAdminStatus();
      fetchTodos();
    }
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/tenants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setIsAdmin(true);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
      setIsAuthenticated(true);
      checkAdminStatus();
      fetchTodos();
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response) {
        setLoginError(error.response.data.message || 'Login failed. Please check your credentials.');
      } else if (error.request) {
        setLoginError('Network error. Please check your connection.');
      } else {
        setLoginError('An unexpected error occurred.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setTodos([]);
  };

  const fetchTodos = useCallback(async () => {
    try {
      const endpoint = showOverdueOnly ? `${API_URL}/todos/overdue` : `${API_URL}/todos`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  }, [showOverdueOnly]);

  const addTodo = useCallback(async (todoData) => {
    try {
      const response = await axios.post(`${API_URL}/todos`, {
        title: todoData.title,
        completed: false,
        dueDate: todoData.dueDate
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setTodos(prevTodos => [...prevTodos, response.data]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }, []);

  const updateTodo = useCallback(async (todo) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${todo.id}`, {
        title: todo.title,
        completed: todo.completed,
        dueDate: todo.dueDate
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setTodos(prevTodos => prevTodos.map(t => t.id === todo.id ? response.data : t));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }, []);

  const toggleTodo = useCallback(async (todo) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${todo.id}`, {
        title: todo.title,
        completed: !todo.completed,
        dueDate: todo.dueDate
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setTodos(prevTodos => prevTodos.map(t => t.id === todo.id ? response.data : t));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  }, []);

  const deleteTodo = useCallback(async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }, []);

  const handleOverdueToggle = useCallback((e) => {
    setShowOverdueOnly(e.target.checked);
    fetchTodos();
  }, [fetchTodos]);

  const LoginForm = () => (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: 20, marginTop: 50 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
          {loginError && (
            <Typography color="error" variant="body2" style={{ marginTop: 10 }}>
              {loginError}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ marginTop: 20 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Container>
  );

  const TodoList = () => {
    const todoItems = useMemo(() => (
      todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onEdit={setEditingTodo}
        />
      ))
    ), [todos, toggleTodo, deleteTodo]);

    return (
      <Container>
        <Paper elevation={3} style={{ padding: 20, marginTop: 20 }}>
          <TodoForm onSubmit={addTodo} />

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Your Todos</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showOverdueOnly}
                  onChange={handleOverdueToggle}
                />
              }
              label="Show Overdue Only"
            />
          </Box>

          <List>
            {todoItems}
          </List>

          <EditTodoDialog
            todo={editingTodo}
            open={!!editingTodo}
            onClose={() => setEditingTodo(null)}
            onSave={updateTodo}
          />
        </Paper>
      </Container>
    );
  };

  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
              Todo App
            </Typography>
            {isAuthenticated && (
              <>
                {isAdmin && (
                  <Button color="inherit" component={Link} to="/admin" style={{ marginRight: 10 }}>
                    Admin Portal
                  </Button>
                )}
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        <Routes>
          <Route
            path="/admin"
            element={
              isAuthenticated && isAdmin ? (
                <AdminPortal />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <TodoList />
              ) : (
                <LoginForm />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
