import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
export const api = axios.create({ baseURL: `https://digital-memorial-mvp-app.vercel.app/api`, timeout: 15000 });
api.interceptors.request.use(async (config) => { const token = await AsyncStorage.getItem('token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
