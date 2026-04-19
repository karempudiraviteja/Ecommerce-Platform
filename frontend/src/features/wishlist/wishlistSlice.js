import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/wishlist'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try { const res = await api.post('/wishlist/toggle', { productId }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try { const res = await api.delete(`/wishlist/${productId}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { products: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.products = action.payload?.products || [];
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.products = action.payload?.wishlist?.products || [];
        toast.success(action.payload?.added ? 'Added to wishlist!' : 'Removed from wishlist');
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.products = action.payload?.products || [];
        toast.success('Removed from wishlist');
      });
  },
});

export default wishlistSlice.reducer;
