import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../feature/auth/auth.slice"
import itemReducer from "../feature/item/item.slice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    items: itemReducer
  },
});
