import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Sidebar/Sidebar';
import axios from 'axios';
import { config } from './config';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b6b',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
    if (token) {
      setIsAuthenticated(true);
      fetchUserData(token);
      fetchTasks(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`${config.API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const fetchTasks = async (token) => {
    try {
      const response = await axios.get(`${config.API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
      if (error.response?.status === 403) {
        handleLogout();
      }
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await axios.post(`${config.API_URL}/auth/login`, credentials);
      const { token } = response.data;
      localStorage.setItem(config.AUTH_TOKEN_KEY, token);
      setIsAuthenticated(true);
      await fetchUserData(token);
      await fetchTasks(token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const token = localStorage.getItem(config.AUTH_TOKEN_KEY);
      const response = await axios.post(`${config.API_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
      if (error.response?.status === 403) {
        handleLogout();
      }
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(config.AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
    setUser(null);
    setTasks([]);
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ p: 3 }}>
          <LoginForm onLogin={handleLogin} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Sidebar user={user} onLogout={handleLogout} />
        <Box sx={{ flexGrow: 1, ml: '250px' }}>
          <Dashboard
            user={user}
            tasks={tasks}
            onAddTask={handleAddTask}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onLogin(credentials);
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
        p: 3,
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Box sx={{ mb: 2 }}>
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          style={{ width: '100%', padding: '8px' }}
        />
      </Box>
      <button
        type="submit"
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Login
      </button>
    </Box>
  );
};

export default App;
