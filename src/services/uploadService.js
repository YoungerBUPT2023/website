import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const uploadService = {
  async uploadWork(formData) {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/works/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  async getWorks() {
    const response = await axios.get(`${API_URL}/works`);
    return response.data;
  }
}; 