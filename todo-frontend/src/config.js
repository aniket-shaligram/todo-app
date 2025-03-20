// API Configuration
const API_BASE_URL = 'http://localhost:8080';
const AUTH_TOKEN_KEY = 'auth_token';

export const config = {
    API_BASE_URL,
    AUTH_TOKEN_KEY,
    LOGIN_URL: `${API_BASE_URL}/auth/login`,
    REGISTER_URL: `${API_BASE_URL}/auth/register`,
    TODOS_URL: `${API_BASE_URL}/todos`,
    PROFILE_URL: `${API_BASE_URL}/profile`,
};
