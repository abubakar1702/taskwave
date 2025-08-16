import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/users/me/`, {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')}`,
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};