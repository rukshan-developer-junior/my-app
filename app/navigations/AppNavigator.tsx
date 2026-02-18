import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useColorScheme } from "react-native";
import StarWarsDetailScreen from "../screens/StarWarsDetail";
import type { StarWarsDetailParams } from "../screens/StarWarsDetail";
import StarWarsListScreen from "../screens/StarWarsList";

export type RootStackParamList = {
  StarWarsList: undefined;
  StarWarsDetail: StarWarsDetailParams;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function AppNavigator() {
  const colorScheme = useColorScheme();
  return (
    <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack.Navigator initialRouteName="StarWarsList">
        <Stack.Screen
          name="StarWarsList"
          component={StarWarsListScreen}
          options={{ title: "People" }}
        />
        <Stack.Screen
          name="StarWarsDetail"
          component={StarWarsDetailScreen}
          options={{ title: "Detail" }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
