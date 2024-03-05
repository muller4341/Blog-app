import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    loading: false,
    error: null
};

const userSlice = createSlice({

 name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        signInSuccess: (state, action) => {
            state.loading = false;
            state.user = action.payload;
        },
        signInFail: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        
    }

});

export const { signInStart, signInSuccess, signInFail } = userSlice.actions;

export default userSlice.reducer;