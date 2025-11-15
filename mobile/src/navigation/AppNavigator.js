/**
 * App Navigator
 * Navigazione principale dell'applicazione
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Agent Navigator
import AgentNavigator from './AgentNavigator';

// Client Navigator (TODO)
// import ClientNavigator from './ClientNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading, isAgent } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : isAgent ? (
          // Agent Stack
          <Stack.Screen name="AgentApp" component={AgentNavigator} />
        ) : (
          // Client Stack (TODO)
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
