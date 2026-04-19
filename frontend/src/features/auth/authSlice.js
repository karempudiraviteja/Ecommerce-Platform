import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const userFromStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const tokenFromStorage = localStorage.getItem('token') || null;

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/change-password', data);
    return res.data.message;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addAddress = createAsyncThunk('auth/addAddress', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/address', data);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateAddress = createAsyncThunk('auth/updateAddress', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/auth/address/${id}`, data);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/auth/address/${id}`);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: userFromStorage, token: tokenFromStorage, loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const reject = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
        toast.success('Welcome! Account created successfully.');
      })
      .addCase(register.rejected, (state, action) => { reject(state, action); toast.error(action.payload); })

      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
        toast.success(`Welcome back, ${action.payload.user.name}!`);
      })
      .addCase(login.rejected, (state, action) => { reject(state, action); toast.error(action.payload); })

      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
        toast.success('Profile updated!');
      })
      .addCase(updateProfile.rejected, (state, action) => { reject(state, action); toast.error(action.payload); })

      .addCase(changePassword.fulfilled, (state) => { state.loading = false; toast.success('Password changed!'); })
      .addCase(changePassword.rejected, (state, action) => { reject(state, action); toast.error(action.payload); })

      .addCase(addAddress.fulfilled, (state, action) => {
        state.user = { ...state.user, addresses: action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
        toast.success('Address added!');
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.user = { ...state.user, addresses: action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
        toast.success('Address updated!');
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.user = { ...state.user, addresses: action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
        toast.success('Address removed!');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
