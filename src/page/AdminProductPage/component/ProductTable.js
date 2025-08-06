import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// 상품 목록 가져오기
export const getProductList = createAsyncThunk(
  "product/getProductList",
  async (searchQuery, { rejectWithValue }) => {
    try {
      const response = await api.get("/product", {
        params: searchQuery,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 상품 생성
export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/product", formData);
      if (response.status !== 200) {
        throw new Error(response.error);
      }
      dispatch(
        showToastMessage({
          message: "상품 생성에 성공했습니다.",
          status: "success",
        })
      );
      dispatch(getProductList({ page: 1 }));
      return response.data.data;
    } catch (error) {
      dispatch(showToastMessage({ message: error.error, status: "error" }));
      return rejectWithValue(error.error);
    }
  }
);

// 상품 삭제
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.delete(`/product/${id}`);
      if (response.status !== 200) {
        throw new Error(response.error);
      }
      dispatch(
        showToastMessage({ message: "상품을 삭제했습니다.", status: "success" })
      );
      dispatch(getProductList({ page: 1 }));
      return response.data;
    } catch (error) {
      dispatch(showToastMessage({ message: error.error, status: "error" }));
      return rejectWithValue(error.error);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    productList: [],
    selectedProduct: null,
    loading: false,
    error: "",
    success: false,
    totalPageNum: 1,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearError: (state) => {
      state.error = "";
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // 상품 목록 가져오기
      .addCase(getProductList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductList.fulfilled, (state, action) => {
        state.loading = false;
        state.productList = action.payload.data;
        state.totalPageNum = action.payload.totalPageNum;
      })
      .addCase(getProductList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // 상품 생성
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // 상품 삭제
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
