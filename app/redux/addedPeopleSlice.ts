import { createSlice } from "@reduxjs/toolkit";
import { StarWarsPerson } from "../data/StarWarsPerson";

type AddedPeopleState = {
  list: StarWarsPerson[];
};

const initialState: AddedPeopleState = {
  list: [],
};

const addedPeopleSlice = createSlice({
  name: "addedPeople",
  initialState,
  reducers: {
    addPerson: (state, action: { payload: StarWarsPerson }) => {
      state.list.unshift(action.payload);
    },
  },
});

export const { addPerson } = addedPeopleSlice.actions;
export default addedPeopleSlice.reducer;
