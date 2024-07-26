
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://13.125.20.36:3000/api'
});

export const loginUser = async (user_id, password) => {
  try {
    const response = await api.post('/auth/login', { user_id, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};