import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://13.125.20.36:3000/api'
});

export const loginUser = async (user_id, password) => {
  try {
    const response = await api.post('/auth/login', { user_id, password });
    // Check if response.data contains the expected user info
    if (response.data) {
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data));
      return response.data;
    } else {
      throw new Error('Login response does not contain user info.');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const getStoredUserInfo = async () => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      return JSON.parse(userInfo);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving user info:', error);
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
    const response = await api.get('/university');
    return response.data;
  } catch (error) {
    console.error('Error fetching universities:', error);
    throw error;
  }
};

export const getUserInfo = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

export const updateUserInfo = async (id, userInfo) => {
  try {
    const updatedFields = {};
    if (userInfo.nickname) updatedFields.nickname = userInfo.nickname;
    if (userInfo.password) updatedFields.password = userInfo.password;

    // Log the data being sent
    console.log(`Sending update for user ID ${id}:`, updatedFields);

    const response = await api.put(`/users/${id}`, updatedFields);
    return response.data;
  } catch (error) {
    console.error('Error updating user info:', error.response?.data || error.message);
    throw error;
  }
};

export const getQuestions = async () => {
  try {
    const response = await api.get('/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};


export const getQuestionsByUsername = async (user_id) => {
  try {
    const response = await api.get(`/questions/${user_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by user_id:', error);
    throw error;
  }
};


export const addQuestion = async (question) => {
  try {
    console.log('!!!', question);
    const response = await api.post('/questions', question);
    return response.data;
  } catch (error) {
    console.error('Error adding question:', error.response?.data || error.message || error);
    throw error;
  }
};

export const updateQuestion = async (id, question) => {
  try {
    const response = await api.put(`/questions/${id}`, question);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error.response?.data || error.message || error);
    throw error;
  }
};

export const toggleLike = async (id, liked) => {
  try {
    const response = await api.post(`/questions/like/${id}`, { liked });
    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const toggleScrap = async (id, scrapped) => {
  try {
    const response = await api.post(`/questions/scrap/${id}`, { scrapped });
    return response.data;
  } catch (error) {
    console.error('Error toggling scrap:', error);
    throw error;
  }
};

export const getQuestionsByCategory = async (category_id) => {
  try {
    const response = await api.get(`/questions?category_id=${category_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    throw error;
  }
};