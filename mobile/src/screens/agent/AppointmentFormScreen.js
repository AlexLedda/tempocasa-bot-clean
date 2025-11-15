/**
 * Appointment Form Screen
 * Form per creare o modificare un appuntamento
 */

import React, { useState, useEffect } from 'react';
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
  Chip,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { apiClient } from '../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropertyPickerModal from '../../components/PropertyPickerModal';

const AppointmentFormScreen = ({ route, navigation }) => {
  const { appointment } = route.params || {};
  const isEdit = !!appointment;

  // Form state
  const [clientName, setClientName] = useState(appointment?.client_name || '');
  const [clientPhone, setClientPhone] = useState(appointment?.client_phone || '');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState(
    appointment?.appointment_date ? new Date(appointment.appointment_date) : new Date()
  );
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (appointment?.property_id) {
      loadProperty(appointment.property_id);
    }
  }, []);

  const loadProperty = async (propertyId) => {
    try {
      const response = await apiClient.get(`/api/properties/${propertyId}`);
      setSelectedProperty(response.data);
    } catch (error) {
      console.error('Error loading property:', error);
    }
  };

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

    if (!selectedProperty) {
      newErrors.property = 'Seleziona una proprietà';
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
        property_id: selectedProperty.id,
        appointment_date: appointmentDate.toISOString(),
        notes: notes.trim() || undefined,
      };

      if (isEdit) {
        await apiClient.put(`/api/appointments/${appointment.id}`, data);
        Alert.alert('Successo', 'Appuntamento aggiornato');
      } else {
        await apiClient.post('/api/appointments', data);
        Alert.alert('Successo', 'Appuntamento creato');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert(
        'Errore',
        error.response?.data?.detail || 'Impossibile salvare l\'appuntamento'
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
          <Text style={styles.sectionTitle}>Informazioni Cliente</Text>
          
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
          <Text style={styles.sectionTitle}>Proprietà *</Text>
          
          {selectedProperty ? (
            <View style={styles.selectedPropertyContainer}>
              <View style={styles.selectedPropertyInfo}>
                <MaterialCommunityIcons
                  name="home"
                  size={24}
                  color={COLORS.primary}
                />
                <View style={styles.propertyDetails}>
                  {selectedProperty.reference && (
                    <Chip compact style={styles.propertyChip}>
                      {selectedProperty.reference}
                    </Chip>
                  )}
                  <Text style={styles.propertyTitle}>{selectedProperty.title}</Text>
                  <Text style={styles.propertyLocation}>{selectedProperty.location}</Text>
                </View>
              </View>
              <Button
                mode="outlined"
                onPress={() => setShowPropertyPicker(true)}
                style={styles.changeButton}
              >
                Cambia
              </Button>
            </View>
          ) : (
            <Button
              mode="outlined"
              icon="home-search"
              onPress={() => setShowPropertyPicker(true)}
              style={styles.selectButton}
            >
              Seleziona Proprietà
            </Button>
          )}
          
          <HelperText type="error" visible={!!errors.property}>
            {errors.property}
          </HelperText>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Data e Ora *</Text>
          
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
          {isEdit ? 'Salva Modifiche' : 'Crea Appuntamento'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          Annulla
        </Button>
      </View>

      <PropertyPickerModal
        visible={showPropertyPicker}
        onClose={() => setShowPropertyPicker(false)}
        onSelect={(property) => {
          setSelectedProperty(property);
          if (errors.property) {
            setErrors({ ...errors, property: undefined });
          }
        }}
        selectedPropertyId={selectedProperty?.id}
      />
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
  selectedPropertyContainer: {
    borderWidth: 1,
    borderColor: COLORS.light.border,
    borderRadius: 8,
    padding: 12,
  },
  selectedPropertyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  propertyDetails: {
    flex: 1,
    marginLeft: 12,
  },
  propertyChip: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: COLORS.light.textSecondary,
  },
  changeButton: {
    alignSelf: 'flex-start',
  },
  selectButton: {
    marginBottom: 8,
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

export default AppointmentFormScreen;
