import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegistroScreen = ({ navigation, route, setRegistroInfo, isDarkMode }) => {
  const [cashInBox, setCashInBox] = useState('');
  const [workerName, setWorkerName] = useState('');
  
  // Fecha automática
  const today = new Date();
  const displayDate = today.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const staticBranch = "Ryu Sushi 1 Matriz";

  // Cargar datos guardados al iniciar la pantalla
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('registroInfo');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setCashInBox(parsedData.cashInBox || '');
          setWorkerName(parsedData.workerName || '');
        }
      } catch (error) {
        console.error('Error al cargar datos guardados:', error);
      }
    };

    loadSavedData();
  }, []);

  const handleSubmit = async () => {
    const registroInfo = {
      cashInBox: cashInBox || '0',
      date: displayDate,
      workerName: workerName || 'Sin nombre',
      direccion: staticBranch,
      horario: 'Automático',
    };

    // Guardar en AsyncStorage
    try {
      await AsyncStorage.setItem('registroInfo', JSON.stringify(registroInfo));
      alert('Información guardada.');
    } catch (error) {
      console.error('Error al guardar en AsyncStorage:', error);
      alert('Error al guardar la información.');
    }

    setRegistroInfo(registroInfo);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <Text style={[styles.title, isDarkMode && styles.darkLabel]}>Registro de Turno</Text>
      
      <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Sucursal:</Text>
      <View style={[styles.staticInfoBox, isDarkMode && styles.darkStaticInfoBox]}>
        <Text style={[styles.staticText, isDarkMode && styles.darkText]}>{staticBranch}</Text>
      </View>

      <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Fecha:</Text>
      <View style={[styles.staticInfoBox, isDarkMode && styles.darkStaticInfoBox]}>
        <Text style={[styles.staticText, isDarkMode && styles.darkText]}>{displayDate}</Text>
      </View>

      <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Cambio en la caja:</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        keyboardType="numeric"
        placeholder="Ingrese el monto"
        placeholderTextColor={isDarkMode ? '#888' : '#888'}
        value={cashInBox}
        onChangeText={setCashInBox}
      />

      <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Trabajador:</Text>
      <TextInput
        style={[styles.input, isDarkMode && styles.darkInput]}
        placeholder="Nombre del trabajador"
        placeholderTextColor={isDarkMode ? '#888' : '#888'}
        value={workerName}
        onChangeText={setWorkerName}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.confirmButton, { backgroundColor: isDarkMode ? '#ff1c02ff' : '#ff1c02ff' }]} 
          onPress={handleSubmit}
        >
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
    alignSelf: 'flex-start',
    marginLeft: '10%',
  },
  darkLabel: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '80%',
    marginBottom: 10,
    color: '#000',
    fontSize: 16,
  },
  darkInput: {
    borderColor: '#444',
    backgroundColor: '#222',
    color: '#fff',
  },
  staticInfoBox: {
    width: '80%',
    padding: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    marginBottom: 10,
  },
  darkStaticInfoBox: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  staticText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  darkText: {
    color: '#ddd',
  },
  confirmButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 10,
    width: '80%',
  },
});

export default RegistroScreen;

