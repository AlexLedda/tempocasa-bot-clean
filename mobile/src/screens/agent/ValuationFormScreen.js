/**
 * Valuation Form Screen
 * Form per creare o modificare una valutazione
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
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
import DateTimePicker from '@react-native-community/datetimepicker';

const ValuationFormScreen = ({ route, navigation }) => {
  const { valuation } = route.params || {};
  const isEdit = !!valuation;

  // Form state
  const [clientName, setClientName] = useState(valuation?.client_name || '');
  const [clientPhone, setClientPhone] = useState(valuation?.client_phone || '');
  const [propertyLocation, setPropertyLocation] = useState(valuation?.property_location || '');
  const [propertyType, setPropertyType] = useState(valuation?.property_type || '');
  const [propertyDescription, setPropertyDescription] = useState(valuation?.property_description || '');
  const [alreadyListed, setAlreadyListed] = useState(valuation?.already_listed || false);
  const [currentAgency, setCurrentAgency] = useState(valuation?.current_agency || '');
  const [hasAppointment, setHasAppointment] = useState(!!valuation?.appointment_date);
  const [appointmentDate, setAppointmentDate] = useState(
    valuation?.appointment_date ? new Date(valuation.appointment_date) : new Date()
  );
  const [estimatedValue, setEstimatedValue] = useState(valuation?.estimated_value?.toString() || '');
  const [notes, setNotes] = useState(valuation?.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!clientName.trim()) {
      newErrors.clientName = 'Il nome del cliente è obbligatorio';
    }

    if (!clientPhone.trim()) {
      newErrors.clientPhone = 'Il telefono è obbligatorio';
    } else if (!/^[0-9+\s()-]+$/.test(clientPhone)) {
      newErrors.clientPhone = 'Numero di telefono non valido';
    }

    if (!propertyLocation.trim()) {
      newErrors.propertyLocation = 'L\'ubicazione è obbligatoria';
    }

    if (estimatedValue && isNaN(parseFloat(estimatedValue))) {
      newErrors.estimatedValue = 'Valore non valido';
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
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        property_location: propertyLocation.trim(),
        property_type: propertyType.trim() || undefined,
        property_description: propertyDescription.trim() || undefined,
        already_listed: alreadyListed,
        current_agency: currentAgency.trim() || undefined,
        appointment_date: hasAppointment ? appointmentDate.toISOString() : undefined,
        estimated_value: estimatedValue ? parseFloat(estimatedValue) : undefined,
        notes: notes.trim() || undefined,
      };

      if (isEdit) {
        await apiClient.put(`/api/valuations/${valuation.id}`, data);
        Alert.alert('Successo', 'Valutazione aggiornata');
      } else {
        await apiClient.post('/api/valuations', data);
        Alert.alert('Successo', 'Valutazione creata');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving valuation:', error);
      Alert.alert(
        'Errore',
        error.response?.data?.detail || 'Impossibile salvare la valutazione'
      );
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(appointmentDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setAppointmentDate(newDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(appointmentDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setAppointmentDate(newDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Informazioni Cliente *</Text>
          
          <TextInput
            label="Nome Cliente *"
            value={clientName}
            onChangeText={(text) => {
              setClientName(text);
              if (errors.clientName) {
                setErrors({ ...errors, clientName: undefined });
              }
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.clientName}
            left={<TextInput.Icon icon="account" />}
          />
          <HelperText type="error" visible={!!errors.clientName}>
            {errors.clientName}
          </HelperText>

          <TextInput
            label="Telefono *"
            value={clientPhone}
            onChangeText={(text) => {
              setClientPhone(text);
              if (errors.clientPhone) {
                setErrors({ ...errors, clientPhone: undefined });
              }
            }}
            mode="outlined"
            style={styles.input}
            keyboardType="phone-pad"
            error={!!errors.clientPhone}
            left={<TextInput.Icon icon="phone" />}
          />
          <HelperText type="error" visible={!!errors.clientPhone}>
            {errors.clientPhone}
          </HelperText>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Immobile da Valutare *</Text>
          
          <TextInput
            label="Ubicazione *"
            value={propertyLocation}
            onChangeText={(text) => {
              setPropertyLocation(text);
              if (errors.propertyLocation) {
                setErrors({ ...errors, propertyLocation: undefined });
              }
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.propertyLocation}
            placeholder="Es: Via Roma 10, Tarquinia"
            left={<TextInput.Icon icon="map-marker" />}
          />
          <HelperText type="error" visible={!!errors.propertyLocation}>
            {errors.propertyLocation}
          </HelperText>

          <TextInput
            label="Tipo Immobile"
            value={propertyType}
            onChangeText={setPropertyType}
            mode="outlined"
            style={styles.input}
            placeholder="Es: Appartamento, Villa, Ufficio"
            left={<TextInput.Icon icon="home-variant" />}
          />

          <TextInput
            label="Descrizione"
            value={propertyDescription}
            onChangeText={setPropertyDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="Descrizione dettagliata dell'immobile"
            left={<TextInput.Icon icon="text" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Situazione Attuale</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Già in vendita</Text>
            <Switch
              value={alreadyListed}
              onValueChange={setAlreadyListed}
              color={COLORS.primary}
            />
          </View>

          {alreadyListed && (
            <>
              <Divider style={styles.divider} />
              <TextInput
                label="Agenzia attuale"
                value={currentAgency}
                onChangeText={setCurrentAgency}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="office-building" />}
              />
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Appuntamento</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Fissa appuntamento</Text>
            <Switch
              value={hasAppointment}
              onValueChange={setHasAppointment}
              color={COLORS.primary}
            />
          </View>

          {hasAppointment && (
            <>
              <Divider style={styles.divider} />
              
              <View style={styles.dateTimeContainer}>
                <Button
                  mode="outlined"
                  icon="calendar"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateTimeButton}
                >
                  {appointmentDate.toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Button>

                <Button
                  mode="outlined"
                  icon="clock"
                  onPress={() => setShowTimePicker(true)}
                  style={styles.dateTimeButton}
                >
                  {appointmentDate.toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Button>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                  is24Hour={true}
                />
              )}
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Valutazione</Text>
          
          <TextInput
            label="Valore Stimato (€)"
            value={estimatedValue}
            onChangeText={(text) => {
              setEstimatedValue(text);
              if (errors.estimatedValue) {
                setErrors({ ...errors, estimatedValue: undefined });
              }
            }}
            mode="outlined"
            style={styles.input}
            keyboardType="numeric"
            error={!!errors.estimatedValue}
            placeholder="Es: 150000"
            left={<TextInput.Icon icon="cash-multiple" />}
          />
          <HelperText type="error" visible={!!errors.estimatedValue}>
            {errors.estimatedValue}
          </HelperText>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Note</Text>
          
          <TextInput
            label="Note aggiuntive"
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
          {isEdit ? 'Salva Modifiche' : 'Crea Valutazione'}
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
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  submitButton: {
    marginBottom: 8,
  },
});

export default ValuationFormScreen;
