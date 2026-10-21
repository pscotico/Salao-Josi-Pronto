import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  
});

const storedAuth = localStorage.getItem('salao-josi-auth');

if (storedAuth) {
  try {
    const { token } = JSON.parse(storedAuth);

    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    localStorage.removeItem('salao-josi-auth');
  }
}

export default api;
