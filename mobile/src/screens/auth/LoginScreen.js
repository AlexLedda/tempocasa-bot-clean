/**
 * Login Screen
 * Schermata di login per agenti e clienti
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Title,
  Subheading,
  HelperText,
  Card,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Inserisci username e password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(username, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>TC</Text>
          </View>
          <Title style={styles.appTitle}>Tempocasa Tarquinia Pro</Title>
          <Subheading style={styles.appSubtitle}>
            Gestione Immobiliare Professionale
          </Subheading>
        </View>

        {/* Login Form */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.welcomeText}>Bentornato!</Text>
            <Text style={styles.instructionText}>
              Accedi per gestire le tue proprietà e clienti
            </Text>

            {/* Username Input */}
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              left={<TextInput.Icon icon="account" />}
              error={!!error}
              disabled={loading}
            />

            {/* Password Input */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!error}
              disabled={loading}
              onSubmitEditing={handleLogin}
            />

            {/* Error Message */}
            {error ? (
              <HelperText type="error" visible={!!error} style={styles.error}>
                {error}
              </HelperText>
            ) : null}

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
            >
              Accedi
            </Button>

            {/* Credentials Hint (Development only) */}
            {__DEV__ && (
              <View style={styles.devHint}>
                <Text style={styles.devHintText}>Dev: admin / Corneto1.</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Tempocasa Tarquinia - Tutti i diritti riservati
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  error: {
    marginTop: -8,
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 8,
  },
  loginButtonContent: {
    height: 48,
  },
  devHint: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.light.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  devHintText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
  },
});

export default LoginScreen;
