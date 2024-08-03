import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://13.125.20.36:3000/api', // 서버의 IP 주소로 변경
});

export const loginUser = async (user_id, password) => {
  try {
    const response = await api.post('/auth/login', { user_id, password });
    if (response.data) {
      // userInfo의 구조를 확인
      console.log('Login successful, user info:', response.data);
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
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error retrieving user info:', error);
    return null;
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

// 좋아요 상태 가져오기
export const getQuestionStatus = async (questionId, userId) => {
  try {
    const response = await api.get(`/questions/${questionId}/status/${userId}`);
    return response.data;
  } catch (error) {
    console.error('질문 상태 가져오기 오류:', error);
    throw error;
  }
};

// 좋아요 토글
export const toggleLike = async (questionId, userId, liked) => {
  try {
    const response = await api.post('/likes/toggle', {
      question_id: questionId,
      user_id: userId,
      liked,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || '좋아요 토글 실패');
    }

    return response.data;
  } catch (error) {
    console.error('좋아요 API 호출 중 오류:', error);
    throw error;
  }
};

// 스크랩 토글
export const toggleScrap = async (questionId, userId, scrapped) => {
  try {
    const response = await api.post(`/scraps/toggle`, {
      question_id: questionId,
      user_id: userId,
      scrapped,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || '스크랩 토글 실패');
    }

    return response.data;
  } catch (error) {
    console.error('스크랩 API 호출 중 오류:', error);
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

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserPoints = async (userId, points) => {
  try {
    const response = await api.put(`/points/${userId}`, { points });
    return response.data;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

export const addComment = async (answerId, content, userId) => {
  try {
    const response = await api.post('/comments', {
      content,
      answer_id: answerId,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};
export const getUserPosts = async (nickname) => {
  try {
    const response = await api.get(`/questions/user/posts/${nickname}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};