import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.cartQuantity += action.payload.cartQuantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = state.items.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = state.items.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      if (existingItem) {
        existingItem.cartQuantity = Math.max(1, quantity);
      }
      state.total = state.items.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    }
  },
});

export const { addToCart, removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
