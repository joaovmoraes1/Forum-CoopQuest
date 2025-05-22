import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  username?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  username?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function login(credentials: LoginCredentials) {
  try {
    const response = await api.post('/auth/login', credentials);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function register(data: RegisterData) {
  try {
    const response = await api.post('/auth/register', data);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/me');
    return response;
  } catch (error) {
    throw error;
  }
}

export async function updateProfile(userId: number, data: UpdateProfileData) {
  try {
    const response = await api.put(`/users/${userId}`, data);
    return response; // Retornar a resposta completa
  } catch (error) {
    throw error;
  }
}

export async function changePassword(data: ChangePasswordData) {
  try {
    const response = await api.post('/auth/change-password', data); // Corrigir a rota e remover userId
    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteAccount(userId: number) {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function logout() {
  try {
    const response = await api.post('/auth/logout');
    return response;
  } catch (error) {
    throw error;
  }
}