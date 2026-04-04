import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getItemsAPI,
  createItemAPI,
  deleteItemAPI,
} from "../item/service/itemAPI";

// 📥 Fetch Items
export const fetchItems = createAsyncThunk(
  "items/fetch",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const res = await getItemsAPI(token);
    return res.data; // expecting { data: [...] }
  },
);

// ➕ Add Item
export const addItem = createAsyncThunk(
  "items/add",
  async (url, { getState }) => {
    const token = getState().auth.token;
    const res = await createItemAPI(url, token);
    return res.data; // expecting { data: {...} }
  },
);

// ❌ Delete Item
export const deleteItem = createAsyncThunk(
  "items/delete",
  async (id, { getState }) => {
    const token = getState().auth.token;
    await deleteItemAPI(id, token);
    return id;
  },
);

const itemSlice = createSlice({
  name: "items",
  initialState: {
    items: [],          // original items
    filteredItems: [],  // items after search/filter
    loading: false,
    error: null,
    searchQuery: "",    // current search string
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      const query = action.payload.toLowerCase().trim();
      if (!query) {
        state.filteredItems = [...state.items];
      } else {
        state.filteredItems = state.items.filter(item =>
          item.title?.toLowerCase().includes(query) ||
          item.summary?.toLowerCase().includes(query) ||
          item.collection?.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.toLowerCase().includes(query))
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch items
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload is { data: [...] } from your API
        const itemsArray = action.payload?.data || [];
        state.items = itemsArray;
        // Re-apply current search filter
        const query = state.searchQuery.toLowerCase().trim();
        if (!query) {
          state.filteredItems = [...itemsArray];
        } else {
          state.filteredItems = itemsArray.filter(item =>
            item.title?.toLowerCase().includes(query) ||
            item.summary?.toLowerCase().includes(query) ||
            item.collection?.toLowerCase().includes(query) ||
            item.tags?.some(tag => tag.toLowerCase().includes(query))
          );
        }
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.items = [];
        state.filteredItems = [];
      })
      // Add item
      .addCase(addItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.loading = false;
        const newItem = action.payload?.data;
        if (newItem) {
          state.items.unshift(newItem);
          // Re-apply search filter
          const query = state.searchQuery.toLowerCase().trim();
          if (!query) {
            state.filteredItems = [...state.items];
          } else {
            state.filteredItems = state.items.filter(item =>
              item.title?.toLowerCase().includes(query) ||
              item.summary?.toLowerCase().includes(query) ||
              item.collection?.toLowerCase().includes(query) ||
              item.tags?.some(tag => tag.toLowerCase().includes(query))
            );
          }
        }
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete item
      .addCase(deleteItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
        state.filteredItems = state.filteredItems.filter(item => item._id !== action.payload);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearError, setSearchQuery } = itemSlice.actions;
export default itemSlice.reducer;
