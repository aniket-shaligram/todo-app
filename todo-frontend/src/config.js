// API Configuration
const API_URL = 'http://localhost:8080';
const AUTH_TOKEN_KEY = 'authToken';

export const config = {
    API_URL,
    AUTH_TOKEN_KEY,
    LOGIN_URL: `${API_URL}/auth/login`,
    REGISTER_URL: `${API_URL}/auth/register`,
    TODOS_URL: `${API_URL}/todos`,
    PROFILE_URL: `${API_URL}/profile`,
};
