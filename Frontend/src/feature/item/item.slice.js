import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getItemsAPI,
  createItemAPI,
  deleteItemAPI,
} from "../item/service/itemAPI";
import { getApiErrorMessage } from "../../shared/lib/apiClient";

/** Shared predicate — used by the slice and by every view that filters. */
export const matchesQuery = (item, query) => {
  if (!query) return true;

  const q = query.toLowerCase();

  return (
    item.title?.toLowerCase().includes(q) ||
    item.summary?.toLowerCase().includes(q) ||
    item.collection?.toLowerCase().includes(q) ||
    item.url?.toLowerCase().includes(q) ||
    item.tags?.some((tag) => tag.toLowerCase().includes(q))
  );
};

const applyFilter = (state) => {
  state.filteredItems = state.searchQuery
    ? state.items.filter((item) => matchesQuery(item, state.searchQuery))
    : [...state.items];
};

// Views used to each dispatch fetchItems() on mount, so navigating the sidebar
// refetched the whole library every time. This condition collapses those into
// one request unless the data is stale or a refresh is explicitly asked for.
const FRESH_FOR_MS = 60_000;

export const fetchItems = createAsyncThunk(
  "items/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getItemsAPI();
      return res.data.data ?? [];
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to load items"));
    }
  },
  {
    condition: ({ force } = {}, { getState }) => {
      const { listStatus, lastFetched } = getState().items;

      if (force) return true;
      if (listStatus === "loading") return false;
      if (lastFetched && Date.now() - lastFetched < FRESH_FOR_MS) return false;

      return true;
    },
  },
);

export const addItem = createAsyncThunk(
  "items/add",
  async (url, { rejectWithValue }) => {
    try {
      const res = await createItemAPI(url);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to save link"));
    }
  },
);

export const deleteItem = createAsyncThunk(
  "items/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteItemAPI(id);
      return id;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, "Failed to delete item"));
    }
  },
);

const itemSlice = createSlice({
  name: "items",
  initialState: {
    items: [],
    filteredItems: [],
    searchQuery: "",

    // Separate status per operation. A single shared `loading` meant saving a
    // link blanked the entire dashboard behind a spinner for several seconds.
    listStatus: "idle", // idle | loading | succeeded | failed
    savingStatus: "idle",
    deletingIds: [],

    error: null,
    saveError: null,
    lastFetched: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.saveError = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload.toLowerCase().trim();
      applyFilter(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
        state.lastFetched = Date.now();
        applyFilter(state);
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload ?? action.error.message;
        // Keep whatever is already on screen — wiping it turns a transient
        // network blip into an empty library.
      })

      .addCase(addItem.pending, (state) => {
        state.savingStatus = "loading";
        state.saveError = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.savingStatus = "succeeded";

        const newItem = action.payload;
        if (newItem && !state.items.some((i) => i._id === newItem._id)) {
          state.items.unshift(newItem);
          applyFilter(state);
        }
      })
      .addCase(addItem.rejected, (state, action) => {
        state.savingStatus = "failed";
        state.saveError = action.payload ?? action.error.message;
      })

      .addCase(deleteItem.pending, (state, action) => {
        state.deletingIds.push(action.meta.arg);
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        const id = action.payload;
        state.deletingIds = state.deletingIds.filter((d) => d !== id);
        state.items = state.items.filter((item) => item._id !== id);
        applyFilter(state);
      })
      .addCase(deleteItem.rejected, (state, action) => {
        state.deletingIds = state.deletingIds.filter(
          (d) => d !== action.meta.arg,
        );
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const { clearError, setSearchQuery } = itemSlice.actions;
export default itemSlice.reducer;
