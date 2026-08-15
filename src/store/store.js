import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import wishesReducer from "./wishesSlice";
import categoriesReducer from "./categoriesSlice";
import { loadState, localStorageMiddleware } from "./localStorage";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wishes: wishesReducer,
    categories: categoriesReducer,
  },
  preloadedState: loadState(),
  middleware: (getDefault) => getDefault().concat(localStorageMiddleware),
});
