/**
 * Client Form Screen
 * Form per creare o modificare un cliente
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  HelperText,
  Switch,
  Divider,
} from 'react-native-paper';
import { COLORS } from '../../constants/colors';
import { apiClient } from '../../services/api';

const ClientFormScreen = ({ route, navigation }) => {
  const { client } = route.params || {};
  const isEdit = !!client;

  // Form state - Dati base
  const [name, setName] = useState(client?.name || '');
  const [surname, setSurname] = useState(client?.surname || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [email, setEmail] = useState(client?.email || '');
  
  // Ricerca immobile
  const [lookingFor, setLookingFor] = useState(client?.looking_for || '');
  const [budget, setBudget] = useState(client?.budget?.toString() || '');
  
  // Mutuo
  const [needsMortgage, setNeedsMortgage] = useState(client?.needs_mortgage || false);
  const [mortgageAmount, setMortgageAmount] = useState(client?.mortgage_amount?.toString() || '');
  const [mortgagePercentage, setMortgagePercentage] = useState(client?.mortgage_percentage?.toString() || '');
  
  // Vendita casa
  const [needsToSell, setNeedsToSell] = useState(client?.needs_to_sell || false);
  const [propertyToSellLocation, setPropertyToSellLocation] = useState(client?.property_to_sell_location || '');
  const [propertyAlreadyListed, setPropertyAlreadyListed] = useState(client?.property_already_listed || false);
  
  // Valutazione e note
  const [wantsEvaluation, setWantsEvaluation] = useState(client?.wants_evaluation || false);
  const [notes, setNotes] = useState(client?.notes || '');
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Il telefono è obbligatorio';
    } else if (!/^[0-9+\s()-]+$/.test(phone)) {
      newErrors.phone = 'Numero di telefono non valido';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email non valida';
    }

    if (budget && isNaN(parseFloat(budget))) {
      newErrors.budget = 'Budget non valido';
    }

    if (mortgageAmount && isNaN(parseFloat(mortgageAmount))) {
      newErrors.mortgageAmount = 'Importo non valido';
    }

    if (mortgagePercentage && (isNaN(parseInt(mortgagePercentage)) || parseInt(mortgagePercentage) < 0 || parseInt(mortgagePercentage) > 100)) {
      newErrors.mortgagePercentage = 'Percentuale non valida (0-100)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Errore', 'Correggi gli errori nel form');
      return;
    }

    setLoading(true);

    try {
      const data = {
        name: name.trim(),
        surname: surname.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        looking_for: lookingFor.trim() || undefined,
        budget: budget ? parseFloat(budget) : undefined,
        needs_mortgage: needsMortgage,
        mortgage_amount: mortgageAmount ? parseFloat(mortgageAmount) : undefined,
        mortgage_percentage: mortgagePercentage ? parseInt(mortgagePercentage) : undefined,
        needs_to_sell: needsToSell,
        property_to_sell_location: propertyToSellLocation.trim() || undefined,
        property_already_listed: propertyAlreadyListed,
        wants_evaluation: wantsEvaluation,
        notes: notes.trim() || undefined,
      };

      if (isEdit) {
        await apiClient.put(`/api/clients/${client.phone}`, data);
        Alert.alert('Successo', 'Cliente aggiornato');
      } else {
        await apiClient.post('/api/clients', data);
        Alert.alert('Successo', 'Cliente creato');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving client:', error);
      Alert.alert(
        'Errore',
        error.response?.data?.detail || 'Impossibile salvare il cliente'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Informazioni Base *</Text>
          
          <TextInput
            label="Nome *"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: undefined });
              }
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.name}
            left={<TextInput.Icon icon="account" />}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>

          <TextInput
            label="Cognome"
            value={surname}
            onChangeText={setSurname}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Telefono *"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) {
                setErrors({ ...errors, phone: undefined });
              }
            }}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            error={!!errors.phone}
            disabled={isEdit}
            left={<TextInput.Icon icon="phone" />}
          />
          <HelperText type="error" visible={!!errors.phone}>
            {errors.phone}
          </HelperText>
          {isEdit && (
            <HelperText type="info">
              Il telefono non può essere modificato
            </HelperText>
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            left={<TextInput.Icon icon="email" />}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Ricerca Immobile</Text>
          
          <TextInput
            label="Cosa cerca"
            value={lookingFor}
            onChangeText={setLookingFor}
            mode="outlined"
            style={styles.input}
            placeholder="Es: Appartamento 3 camere in centro"
            left={<TextInput.Icon icon="home-search" />}
          />

          <TextInput
            label="Budget (€)"
            value={budget}
            onChangeText={(text) => {
              setBudget(text);
              if (errors.budget) {
                setErrors({ ...errors, budget: undefined });
              }
            }}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            error={!!errors.budget}
            left={<TextInput.Icon icon="cash" />}
          />
          <HelperText type="error" visible={!!errors.budget}>
            {errors.budget}
          </HelperText>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Mutuo</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Necessita mutuo</Text>
            <Switch
              value={needsMortgage}
              onValueChange={setNeedsMortgage}
              color={COLORS.primary}
            />
          </View>

          {needsMortgage && (
            <>
              <Divider style={styles.divider} />
              
              <TextInput
                label="Importo mutuo (€)"
                value={mortgageAmount}
                onChangeText={(text) => {
                  setMortgageAmount(text);
                  if (errors.mortgageAmount) {
                    setErrors({ ...errors, mortgageAmount: undefined });
                  }
                }}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
                error={!!errors.mortgageAmount}
                left={<TextInput.Icon icon="bank" />}
              />
              <HelperText type="error" visible={!!errors.mortgageAmount}>
                {errors.mortgageAmount}
              </HelperText>

              <TextInput
                label="Percentuale mutuo (%)"
                value={mortgagePercentage}
                onChangeText={(text) => {
                  setMortgagePercentage(text);
                  if (errors.mortgagePercentage) {
                    setErrors({ ...errors, mortgagePercentage: undefined });
                  }
                }}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
                error={!!errors.mortgagePercentage}
                left={<TextInput.Icon icon="percent" />}
              />
              <HelperText type="error" visible={!!errors.mortgagePercentage}>
                {errors.mortgagePercentage}
              </HelperText>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Vendita Casa Attuale</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Deve vendere casa attuale</Text>
            <Switch
              value={needsToSell}
              onValueChange={setNeedsToSell}
              color={COLORS.primary}
            />
          </View>

          {needsToSell && (
            <>
              <Divider style={styles.divider} />
              
              <TextInput
                label="Ubicazione immobile da vendere"
                value={propertyToSellLocation}
                onChangeText={setPropertyToSellLocation}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="map-marker" />}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Già in vendita con agenzia</Text>
                <Switch
                  value={propertyAlreadyListed}
                  onValueChange={setPropertyAlreadyListed}
                  color={COLORS.primary}
                />
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Altro</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Richiede valutazione</Text>
            <Switch
              value={wantsEvaluation}
              onValueChange={setWantsEvaluation}
              color={COLORS.primary}
            />
          </View>

          <Divider style={styles.divider} />
          
          <TextInput
            label="Note"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
            left={<TextInput.Icon icon="note-text" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          {isEdit ? 'Salva Modifiche' : 'Crea Cliente'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          Annulla
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.surface,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: COLORS.light.text,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  submitButton: {
    marginBottom: 8,
  },
});

export default ClientFormScreen;
