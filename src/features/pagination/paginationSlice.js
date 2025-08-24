// features/pagination/paginationSlice.js

import { createSlice } from "@reduxjs/toolkit";

/**
 * ページ番号を Redux で管理
 * - publicPage: 公開一覧の現在ページ (0始まり)
 * - privatePage: ログイン後一覧の現在ページ (0始まり)
 */

const initialState = {
  publicPage: 0,
  privatePage: 0,
};

const paginationSlice = createSlice({
  name: "pagenation",
  initialState,
  reducers: {
    setPublicPage(state, action) {
      state.publicPage = Math.max(0, action.payload | 0);
    },
    setPrivatePage(state, action) {
      state.privatePage = Math.max(0, action.payload | 0);
    },
    nextPublic(state) {
      state.publicPage += 1;
    },
    prevPublic(state) {
      state.publicPage = Math.max(0, state.publicPage - 1);
    },
    nextPrivate(state) {
      state.privatePage += 1;
    },
    prevPrivate(state) {
      state.privatePage = Math.max(0, state.privatePage - 1);
    },
    resetAll(state) {
      state.publicPage = 0;
      state.privatePage = 0;
    },
  },
});

export const {
  setPublicPage,
  setPrivatePage,
  nextPublic,
  prevPublic,
  nextPrivate,
  prevPrivate,
  resetAll,
} = paginationSlice.actions;

export default paginationSlice.reducer;
