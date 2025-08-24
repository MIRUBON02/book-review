import { configureStore } from "@reduxjs/toolkit";
import pagination from "../features/pagination/paginationSlice";

export const store = configureStore({
  reducer: { pagination },
});
