import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button, Paper } from '@mui/material';
import AdminPortal from './components/admin/AdminPortal';
import config from './config';

const API_URL = config.API_URL;
const AUTH_TOKEN_KEY = config.AUTH_TOKEN_KEY;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

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
    setLoginError(''); // Clear previous errors
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

  const fetchTodos = async () => {
    try {
      const response = await axios.get(`${API_URL}/todos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/todos`, {
        title: newTodo,
        completed: false
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setTodos([...todos, response.data]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (todo) => {
    try {
      const response = await axios.put(`${API_URL}/todos/${todo.id}`, {
        ...todo,
        completed: !todo.completed
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setTodos(todos.map(t => t.id === todo.id ? response.data : t));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/todos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` }
      });
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h4" gutterBottom>Login</Typography>
          <form onSubmit={handleLogin}>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            {loginError && (
              <Typography color="error" sx={{ mt: 2 }}>
                {loginError}
              </Typography>
            )}
            <Button type="submit" variant="contained" color="primary">
              Login
            </Button>
          </form>
        </Paper>
      </Container>
    );
  }

  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Todo App
            </Typography>
            {isAdmin && (
              <Button color="inherit" component={Link} to="/admin">
                Admin Portal
              </Button>
            )}
            <Button color="inherit" component={Link} to="/">
              Todos
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Routes>
          <Route path="/admin" element={isAdmin ? <AdminPortal /> : <Navigate to="/" />} />
          <Route
            path="/"
            element={
              <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h4" gutterBottom>Todo List</Typography>
                  <form onSubmit={addTodo}>
                    <input
                      type="text"
                      className="todo-input"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Add a new todo"
                    />
                  </form>
                  <ul className="todo-list">
                    {todos.map(todo => (
                      <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo)}
                        />
                        <span>{todo.title}</span>
                        <button
                          className="delete-btn"
                          onClick={() => deleteTodo(todo.id)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </Paper>
              </Container>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
