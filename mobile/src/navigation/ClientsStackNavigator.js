/**
 * Clients Stack Navigator
 * Gestisce la navigazione dei clienti
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';

import ClientsScreen from '../screens/agent/ClientsScreen';
import ClientDetailScreen from '../screens/agent/ClientDetailScreen';
import ClientFormScreen from '../screens/agent/ClientFormScreen';

const Stack = createStackNavigator();

const ClientsStackNavigator = () => {
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
        name="ClientsList"
        component={ClientsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClientDetail"
        component={ClientDetailScreen}
        options={{ title: 'Dettaglio Cliente' }}
      />
      <Stack.Screen
        name="ClientForm"
        component={ClientFormScreen}
        options={({ route }) => ({
          title: route.params?.client ? 'Modifica Cliente' : 'Nuovo Cliente',
        })}
      />
    </Stack.Navigator>
  );
};

export default ClientsStackNavigator;
