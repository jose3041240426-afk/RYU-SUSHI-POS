import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';

const ExpenseModal = ({
  visible,
  onClose,
  onSave,
  isDarkMode,
  onReset,
  expense,
  navigation
}) => {
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [description, setDescription] = useState(expense?.description || '');

  const handleSave = () => {
    if (!amount || !description) {
      Alert.alert('Error', 'Por favor ingresa el monto y la descripción');
      return;
    }


    const expenseData = {
      amount: amountValue,
      description,
      date: expense?.date || new Date().toISOString()
    };

    onSave(expenseData);
    setAmount('');
    setDescription('');
  };

  const handleReset = () => {
    Alert.alert(
      'Confirmar Reinicio',
      '¿Estás seguro de que quieres eliminar todos los egresos?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, Reiniciar',
          style: 'destructive',
          onPress: () => {
            onReset();
            onClose();
          }
        }
      ]
    );
  };

  const navigateToExpenseScreen = () => {
    onClose();
    setTimeout(() => {
      navigation?.navigate('ExpenseScreen');
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.modalOverlay,
          isDarkMode && styles.darkModalOverlay
        ]}
      >
        <View style={styles.centeredView}>
          <View style={[
            styles.modalContent,
            isDarkMode ? styles.darkModalContent : styles.lightModalContent
          ]}>
            <View style={styles.headerContainer}>
              <Text style={[
                styles.modalTitle,
                isDarkMode ? styles.darkText : styles.lightText
              ]}>
                {expense ? 'Editar Egreso' : 'Nuevo Egreso'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon
                  name="close-outline"
                  size={28}
                  color={isDarkMode ? '#fff' : '#333'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.darkText : styles.lightText
              ]}>
                Monto
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.darkInput : styles.lightInput
                ]}
                placeholder="0.00"
                placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[
                styles.inputLabel,
                isDarkMode ? styles.darkText : styles.lightText
              ]}>
                Descripción
              </Text>
              <TextInput
                style={[
                  styles.input,
                  isDarkMode ? styles.darkInput : styles.lightInput,
                  styles.multilineInput
                ]}
                placeholder="Descripción del gasto"
                placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={navigateToExpenseScreen}
              >
                <Icon
                  name="list-outline"
                  size={20}
                  color="#fff"
                  style={styles.actionIcon}
                />
                <Text style={styles.actionButtonText}>Ver Todos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton]}
                onPress={handleReset}
              >
                <Icon
                  name="trash-outline"
                  size={20}
                  color="#fff"
                  style={styles.actionIcon}
                />
                <Text style={styles.actionButtonText}>Reiniciar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  darkModalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  lightModalContent: {
    backgroundColor: '#ffffff',
  },
  darkModalContent: {
    backgroundColor: '#2c2c2e',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 5,
    marginLeft: 10,
  },
  lightText: {
    color: '#333',
  },
  darkText: {
    color: '#f5f5f5',
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  lightInput: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    color: '#333',
  },
  darkInput: {
    backgroundColor: '#3a3a3c',
    borderColor: '#4a4a4c',
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 2,
  },
  viewButton: {
    backgroundColor: '#2196F3',
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
    marginLeft: 8,
  },
  actionIcon: {
    marginRight: 5,
  },
});

export default ExpenseModal;

