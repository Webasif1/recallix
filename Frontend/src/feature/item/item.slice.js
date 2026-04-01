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
    return res.data;
  },
);

// ➕ Add Item
export const addItem = createAsyncThunk(
  "items/add",
  async (url, { getState }) => {
    const token = getState().auth.token;

    const res = await createItemAPI(url, token);
    return res.data;
  },
);

export const deleteItem = createAsyncThunk(
  "items/delete",
  async (id, { getState }) => {
    const token = getState().auth.token;

    await deleteItemAPI(id, token);

    return id; // 🔥 return id to update UI
  },
);

const itemSlice = createSlice({
  name: "items",
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })

      // ➕ Add
      .addCase(addItem.fulfilled, (state, action) => {
        // 🔥 if duplicate response
        if (action.payload.item) return;

        state.items.unshift(action.payload);
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default itemSlice.reducer;
