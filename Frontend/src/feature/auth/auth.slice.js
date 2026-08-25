import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,

    // True only while the boot session probe is in flight. Route guards render
    // a splash while it is true, so nothing else may set it — see useAuth.
    loading: true,

    error: null,

    // Set when the session probe could not REACH the server (network down,
    // API 500). Distinct from a 401, which means "genuinely signed out".
    // Without this, an outage looks identical to being logged out and the
    // user gets silently dumped on the login page.
    sessionUnreachable: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) state.sessionUnreachable = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSessionUnreachable: (state, action) => {
      state.sessionUnreachable = action.payload;
    },
  },
});

export const { setUser, setLoading, setError, setSessionUnreachable } =
  authSlice.actions;

export default authSlice.reducer;
