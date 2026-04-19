import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/orders', data); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyOrders = createAsyncThunk('orders/fetchMy', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/orders?${query}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchOrder = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/orders/${id}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try { const res = await api.put(`/orders/${id}/cancel`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// Admin
export const fetchAllOrders = createAsyncThunk('orders/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/admin/orders?${query}`);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status, note }, { rejectWithValue }) => {
  try { const res = await api.put(`/admin/orders/${id}/status`, { status, note }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { items: [], currentOrder: null, pagination: {}, loading: false, error: null },
  reducers: { clearCurrentOrder(state) { state.currentOrder = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => { state.loading = true; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        toast.success('Order placed successfully!');
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload || 'Failed to place order');
      })

      .addCase(fetchMyOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyOrders.rejected, (state) => { state.loading = false; })

      .addCase(fetchOrder.fulfilled, (state, action) => { state.currentOrder = action.payload; })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o._id === action.payload._id);
        if (idx > -1) state.items[idx] = action.payload;
        state.currentOrder = action.payload;
        toast.success('Order cancelled');
      })
      .addCase(cancelOrder.rejected, (_, action) => toast.error(action.payload))

      .addCase(fetchAllOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o._id === action.payload._id);
        if (idx > -1) state.items[idx] = action.payload;
        state.currentOrder = action.payload;
        toast.success('Order status updated!');
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
