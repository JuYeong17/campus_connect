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

export const getQuestions = async () => {
  try {
    const response = await api.get('/questions');
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const addQuestion = async (question) => {
  try {
    const response = await api.post('/questions', question);
    return response.data;
  } catch (error) {
    console.error('Error adding question:', error);
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
