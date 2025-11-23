import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';

import TelegramScreen from '../screens/agent/TelegramScreen';

const Stack = createStackNavigator();

const TelegramStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="TelegramList" 
        component={TelegramScreen}
        options={{ title: 'Telegram Bot' }}
      />
    </Stack.Navigator>
  );
};

export default TelegramStackNavigator;