// API Configuration
const API_BASE_URL = 'http://localhost:8080';
const AUTH_TOKEN_KEY = 'authToken';

export const config = {
    API_BASE_URL,
    AUTH_TOKEN_KEY,
    LOGIN_URL: `${API_BASE_URL}/api/users/login`,
    REGISTER_URL: `${API_BASE_URL}/api/users/register`,
    TODOS_URL: `${API_BASE_URL}/api/todos`,
    PROFILE_URL: `${API_BASE_URL}/api/users/profile`,
};
