import axios from 'axios';

const api = axios.create({
  baseURL: 'http://your-ec2-public-ip:3000/api'
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

export const registerUser = async (user) => {
  try {
    const response = await api.post('/users', user);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const getUniversities = async () => {
  try {
    const response = await api.get('/universities');
    return response.data;
  } catch (error) {
    console.error('Error fetching universities:', error);
    throw error;
  }
};
