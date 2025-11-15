/**
 * Valuations Stack Navigator
 * Gestisce la navigazione delle valutazioni
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';

import ValuationsScreen from '../screens/agent/ValuationsScreen';
import ValuationDetailScreen from '../screens/agent/ValuationDetailScreen';
import ValuationFormScreen from '../screens/agent/ValuationFormScreen';

const Stack = createStackNavigator();

const ValuationsStackNavigator = () => {
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
        name="ValuationsList"
        component={ValuationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ValuationDetail"
        component={ValuationDetailScreen}
        options={{ title: 'Dettaglio Valutazione' }}
      />
      <Stack.Screen
        name="ValuationForm"
        component={ValuationFormScreen}
        options={({ route }) => ({
          title: route.params?.valuation ? 'Modifica Valutazione' : 'Nuova Valutazione',
        })}
      />
    </Stack.Navigator>
  );
};

export default ValuationsStackNavigator;
