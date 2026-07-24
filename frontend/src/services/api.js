import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 20000,
});

export async function uploadFile(file, options = {}) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadToGoogle', String(Boolean(options.uploadToGoogle)));
  if (options.folderId) {
    formData.append('folderId', options.folderId);
  }

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function generateHash(filePath) {
  const response = await api.post('/hash', { filePath });
  return response.data;
}

export async function encryptFile(filePath) {
  const response = await api.post('/encrypt', { filePath });
  return response.data;
}

export async function decryptFile(filePath) {
  const response = await api.post('/decrypt', { filePath });
  return response.data;
}

export async function storeHash(fileName, hash) {
  const response = await api.post('/store-hash', { fileName, hash });
  return response.data;
}

export async function verifyHash(fileName, hash) {
  const response = await api.post('/verify-hash', { fileName, hash });
  return response.data;
}

export async function signupUser(payload) {
  const response = await api.post('/auth/signup', payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function getUploadedDocuments() {
  const response = await api.get('/documents');
  return response.data;
}
