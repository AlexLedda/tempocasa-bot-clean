/**
 * Splash Screen
 * Loading screen iniziale
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Title } from 'react-native-paper';
import { COLORS } from '../../constants/colors';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>TC</Text>
          </View>
        </View>

        {/* App Title */}
        <Title style={styles.title}>Tempocasa Tarquinia Pro</Title>
        <Text style={styles.subtitle}>Gestione Immobiliare Professionale</Text>

        {/* Loading Indicator */}
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
  },
  loader: {
    marginTop: 40,
  },
});

export default SplashScreen;
