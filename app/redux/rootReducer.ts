import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import addedPeopleReducer from "./addedPeopleSlice";

const rootPersistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["addedPeople"],
};

const rootReducer = combineReducers({
  addedPeople: addedPeopleReducer,
});

export default persistReducer(rootPersistConfig, rootReducer);
