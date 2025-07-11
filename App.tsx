import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginApp from './src/Component/Login/LoginApp';
import ForgetPassword from './src/Component/Login/ForgetPassword';
import Map from './src/Component/InspactionList/Map';
import DrawerNavigator from './src/Navigation/DrawerNavigator'


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginApp" screenOptions={{ headerShown: true }}>

         <Stack.Screen name="LoginApp"
          component={LoginApp}
          options={{ headerShown: false }}
        /> 

        {/* <Stack.Screen name="Map"
          component={Map}
          options={{ headerShown: false }}
        /> */}


        
        <Stack.Screen
          name="DrawerNavigator"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />


         <Stack.Screen
          name="ForgetPassword"
          component={ForgetPassword}
          options={{ headerShown: false }}
        />


           
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
