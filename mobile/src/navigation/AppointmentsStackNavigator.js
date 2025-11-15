/**
 * Appointments Stack Navigator
 * Gestisce la navigazione degli appuntamenti
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';

import AppointmentsScreen from '../screens/agent/AppointmentsScreen';
import AppointmentDetailScreen from '../screens/agent/AppointmentDetailScreen';
import AppointmentFormScreen from '../screens/agent/AppointmentFormScreen';

const Stack = createStackNavigator();

const AppointmentsStackNavigator = () => {
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
        name="AppointmentsList"
        component={AppointmentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AppointmentDetail"
        component={AppointmentDetailScreen}
        options={{ title: 'Dettaglio Appuntamento' }}
      />
      <Stack.Screen
        name="AppointmentForm"
        component={AppointmentFormScreen}
        options={({ route }) => ({
          title: route.params?.appointment ? 'Modifica Appuntamento' : 'Nuovo Appuntamento',
        })}
      />
    </Stack.Navigator>
  );
};

export default AppointmentsStackNavigator;
