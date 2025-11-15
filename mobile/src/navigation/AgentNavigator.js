/**
 * Agent Navigator
 * Navigazione per agenti (Bottom Tabs)
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

// Agent Screens
import DashboardScreen from '../screens/agent/DashboardScreen';
import AppointmentsStackNavigator from './AppointmentsStackNavigator';
import ClientsStackNavigator from './ClientsStackNavigator';
import ValuationsStackNavigator from './ValuationsStackNavigator';
import MoreScreen from '../screens/agent/MoreScreen';

const Tab = createBottomTabNavigator();

const AgentNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Appuntamenti':
              iconName = focused ? 'calendar-check' : 'calendar-check-outline';
              break;
            case 'Clienti':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Valutazioni':
              iconName = focused ? 'clipboard-check' : 'clipboard-check-outline';
              break;
            case 'Altro':
              iconName = focused ? 'dots-horizontal-circle' : 'dots-horizontal-circle-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.light.textSecondary,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Appuntamenti" 
        component={AppointmentsStackNavigator}
        options={{ title: 'Appuntamenti', headerShown: false }}
      />
      <Tab.Screen 
        name="Clienti" 
        component={ClientsStackNavigator}
        options={{ title: 'Clienti', headerShown: false }}
      />
      <Tab.Screen 
        name="Valutazioni" 
        component={ValuationsStackNavigator}
        options={{ title: 'Valutazioni', headerShown: false }}
      />
      <Tab.Screen 
        name="Altro" 
        component={MoreScreen}
        options={{ title: 'Altro' }}
      />
    </Tab.Navigator>
  );
};

export default AgentNavigator;
