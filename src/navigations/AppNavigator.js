import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screen/HomeScreen';
import LoginScreen from '../screen/LoginScreen';
import SignupScreen from '../screen/SignupScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState("");

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home">
          {props => (
            <HomeScreen 
              {...props}
              isLoggedIn={isLoggedIn}
              setIsLoggedIn={setIsLoggedIn}
              userId={userId}
              setUserId={setUserId}
              selectedUniversity={selectedUniversity}
              setSelectedUniversity={setSelectedUniversity}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Login">
          {props => (
            <LoginScreen 
              {...props}
              setIsLoggedIn={setIsLoggedIn}
              setUserId={setUserId}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Signup">
          {props => (
            <SignupScreen 
              {...props}
              setIsLoggedIn={setIsLoggedIn}
              setUserId={setUserId}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
