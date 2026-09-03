import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
const localHost = Platform.OS !== 'android' ? 'localhost' : '10.0.2.2';
export const api = axios.create({ baseURL: `http://${localHost}:5001/api`, timeout: 15000 });
api.interceptors.request.use(async (config) => { const token = await AsyncStorage.getItem('token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
