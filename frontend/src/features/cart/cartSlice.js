import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/cart'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/cart', data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { const res = await api.put(`/cart/${itemId}`, { quantity }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try { const res = await api.delete(`/cart/${itemId}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const clearCart = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try { await api.delete('/cart/clear'); return null; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], totalPrice: 0, totalItems: 0, loading: false, error: null },
  reducers: { resetCart(state) { state.items = []; state.totalPrice = 0; state.totalItems = 0; } },
  extraReducers: (builder) => {
    const setCart = (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.items = action.payload.items || [];
        state.totalPrice = action.payload.totalPrice || 0;
        state.totalItems = action.payload.totalItems || 0;
      }
    };
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(addToCart.fulfilled, (state, action) => {
        setCart(state, action);
        toast.success('Added to cart!');
      })
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; toast.error(action.payload); })
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(removeCartItem.fulfilled, (state, action) => { setCart(state, action); toast.success('Item removed'); })
      .addCase(clearCart.fulfilled, (state) => { state.items = []; state.totalPrice = 0; state.totalItems = 0; });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
