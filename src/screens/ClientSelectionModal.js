import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';

// Solución de almacenamiento compatible con web y React Native
const getStorage = () => {
  if (Platform.OS === 'web') {
    // Para web usamos localStorage
    return {
      getItem: async (key) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.error('Error getting item from localStorage:', error);
          return null;
        }
      },
      setItem: async (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting item in localStorage:', error);
          throw error;
        }
      },
      removeItem: async (key) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing item from localStorage:', error);
          throw error;
        }
      },
    };
  } else {
    // Para React Native usamos AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  }
};

const STORAGE_KEY = '@clients_key';
const { width, height } = Dimensions.get('window');

const NumericKeyboard = ({ onKeyPress, onDelete, onSubmit, onCancel, currentValue, onBack, onSaveOrder }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

  return (
    <View style={styles.keyboardContainer}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{currentValue}%</Text>
      </View>
      <View style={styles.keysContainer}>
        {keys.map((key) => (
          <TouchableOpacity
            key={key}
            style={[styles.keyButton, key === '⌫' && styles.deleteButton]}
            onPress={() => {
              if (key === '⌫') {
                onDelete();
              } else {
                onKeyPress(key);
              }
            }}
          >
            <Text style={[styles.keyText, key === '⌫' && styles.deleteButtonText]}>
              {key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.discountActionButtons}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.backButton, styles.halfButton]}
            onPress={onBack}
          >
            <Text style={styles.buttonText}>Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, styles.halfButton]}
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.createButton, { flex: 1 }]}
            onPress={onSubmit}
          >
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const ClientSelectionModal = ({
  visible,
  onClose,
  onSelectClient,
  onCreateNewClient,
  isDarkMode,
  existingClients = [],
  onNavigateToHistory,
  onSaveOrder,
  onBack,
  lastClosedTimestamp = 0,
}) => {
  const [newClientName, setNewClientName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isCreatingDiscount, setIsCreatingDiscount] = useState(false);
  const [storedClients, setStoredClients] = useState(existingClients);
  const [discountValue, setDiscountValue] = useState('');
  const [storage, setStorage] = useState(null);

  const displayedClients = React.useMemo(() => {
    if (!lastClosedTimestamp) return storedClients;
    return storedClients.filter(c => {
      const clientId = Number(c.id);
      // Si el ID no es un timestamp válido (ej: IDs manuales o incrementales viejos)
      // lo ocultamos si ya existe al menos un cierre registrado.
      if (isNaN(clientId) || clientId < 1000000000000) {
        return !lastClosedTimestamp;
      }
      return clientId > lastClosedTimestamp;
    });
  }, [storedClients, lastClosedTimestamp]);

  useEffect(() => {
    // Inicializar storage y sincronizar con los clientes que vienen de App.js (de Supabase)
    setStorage(getStorage());
    if (existingClients && existingClients.length > 0) {
      // Nota: Aquí ya no filtramos agresivamente porque displayedClients se encarga de la vista
      setStoredClients(existingClients);
    }
  }, [existingClients]);

  useEffect(() => {
    if (storage && visible) {
      loadStoredClients();
    }
  }, [storage, visible]);

  const loadStoredClients = async () => {
    if (!storage) return;

    try {
      // Priorizar carga de Supabase (vía props) pero también revisar local
      const { data, error } = await require('../services/supabase').supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: true });
      
      if (!error && data) {
        setStoredClients(data);
        await saveClients(data); // Actualizar cache local
      } else {
        const savedClients = await storage.getItem(STORAGE_KEY);
        if (savedClients !== null) {
          setStoredClients(JSON.parse(savedClients));
        }
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleKeyPress = (key) => {
    if (discountValue.includes('.') && key === '.') return;
    if (discountValue.length >= 5) return;
    setDiscountValue((prev) => prev + key);
  };

  const handleDelete = () => {
    setDiscountValue((prev) => prev.slice(0, -1));
  };

  const handleSubmitDiscount = () => {
    const discount = parseFloat(discountValue);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      Alert.alert('Error', 'Por favor ingrese un descuento válido entre 0 y 100');
      return;
    }
    setIsCreatingNew(true);
    setIsCreatingDiscount(false);
    setNewClientName(generateNextClientName());
  };

  const handleBack = () => {
    if (isCreatingDiscount) {
      setIsCreatingDiscount(false);
      setIsCreatingNew(false);
      setDiscountValue('');
      if (onBack) {
        onBack();
      }
    }
  };

  const handleSaveOrder = async () => {
    const discount = parseFloat(discountValue);
    if (isNaN(discount) || discount < 0 || discount > 100) {
      Alert.alert('Error', 'Por favor ingrese un descuento válido entre 0 y 100');
      return;
    }

    const nextNumber = displayedClients.length + 1;
    const tempClient = {
      id: String(Date.now()), // ID Único
      name: `Cliente ${nextNumber}`,
      discount: discount,
    };

    try {
      // Guardar en Supabase antes de continuar
      await require('../services/supabase').supabase.from('clientes').insert(tempClient);
    } catch (e) {
      console.log('Error saving temp client to cloud:', e);
    }

    if (onSaveOrder) {
      onSaveOrder(tempClient);
    }

    setDiscountValue('');
    setIsCreatingDiscount(false);
    onClose();
  };

  const saveClients = async (clients) => {
    if (!storage) return;

    try {
      await storage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving clients:', error);
      Alert.alert('Error', 'No se pudieron guardar los clientes');
    }
  };

  const handleResetClients = async () => {
    const title = 'Reiniciar Clientes';
    const message = '¿Estás seguro de que quieres eliminar todos los clientes? Esta acción no se puede deshacer.';

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        if (!storage) return;
        try {
          // Borrar de Supabase
          const { supabase } = require('../services/supabase');
          await supabase.from('clientes').delete().not('id', 'is', null);
          
          await storage.removeItem(STORAGE_KEY);
          setStoredClients([]);
          alert('Todos los clientes han sido eliminados');
        } catch (error) {
          console.error('Error resetting clients:', error);
          alert('No se pudieron reiniciar los clientes');
        }
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Reiniciar',
            style: 'destructive',
            onPress: async () => {
              if (!storage) return;
              try {
                // Borrar de Supabase
                const { supabase } = require('../services/supabase');
                await supabase.from('clientes').delete().not('id', 'is', null);

                await storage.removeItem(STORAGE_KEY);
                setStoredClients([]);
                Alert.alert('Éxito', 'Todos los clientes han sido eliminados');
              } catch (error) {
                console.error('Error resetting clients:', error);
                Alert.alert('Error', 'No se pudieron reiniciar los clientes');
              }
            },
          },
        ]
      );
    }
  };

  const generateNextClientName = () => {
    const nextNumber = displayedClients.length + 1;
    return `Cliente ${nextNumber}`;
  };

  const handleDeleteClient = async (clientId) => {
    const title = 'Eliminar Cliente';
    const message = '¿Estás seguro de que quieres eliminar este cliente?';

    const performDelete = async () => {
      try {
        const { supabase } = require('../services/supabase');
        const { error } = await supabase.from('clientes').delete().eq('id', clientId);
        
        if (error) throw error;

        const updatedClients = storedClients.filter(c => c.id !== clientId);
        setStoredClients(updatedClients);
        await saveClients(updatedClients);

        if (Platform.OS !== 'web') {
          Alert.alert('Éxito', 'Cliente eliminado');
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        if (Platform.OS === 'web') alert('No se pudo eliminar el cliente');
        else Alert.alert('Error', 'No se pudo eliminar el cliente');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`${title}\n\n${message}`)) {
        await performDelete();
      }
    } else {
      Alert.alert(title, message, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const handleCreateNewClient = async () => {
    if (newClientName.trim()) {
      const newClient = {
        id: String(Date.now()), // ID Único Universal
        name: newClientName.trim(),
        discount: discountValue ? parseFloat(discountValue) : 0,
      };

      const updatedClients = [...storedClients, newClient];

      try {
        // Guardar en Supabase primero
        const { error } = await require('../services/supabase').supabase
          .from('clientes')
          .insert(newClient);
        
        if (error) throw error;

        const updatedClients = [...storedClients, newClient];
        await saveClients(updatedClients);
        setStoredClients(updatedClients);

        if (typeof onCreateNewClient === 'function') {
          onCreateNewClient(newClient);
        }

        setNewClientName('');
        setIsCreatingNew(false);
        setDiscountValue('');
      } catch (error) {
        console.error('Error creating new client:', error);
        Alert.alert('Error', 'No se pudo crear el cliente');
      }
    } else {
      Alert.alert('Error', 'Por favor ingresa un nombre para el cliente');
    }
  };

  const handleSelectClient = async (client) => {
    if (!storage) return;

    try {
      const clientToSave = {
        id: client.id,
        name: client.name,
        discount: client.discount || 0,
      };
      await storage.setItem('@last_selected_client', JSON.stringify(clientToSave));

      if (typeof onSelectClient === 'function') {
        onSelectClient(clientToSave);
      }
    } catch (error) {
      console.error('Error selecting client:', error);
      Alert.alert('Error', 'No se pudo seleccionar el cliente');
    }
  };

  const renderClientItem = ({ item }) => (
    <View style={[styles.clientItemContainer, { backgroundColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
      <TouchableOpacity
        style={styles.clientItemInfo}
        onPress={() => handleSelectClient(item)}
      >
        <View>
          <Text style={[styles.clientName, { color: isDarkMode ? '#fff' : '#000' }]}>
            {item.name}
          </Text>
          {item.discount > 0 && (
            <Text style={styles.discountText}>
              Descuento: {item.discount}%
            </Text>
          )}
        </View>
        <Text style={[styles.clientDetails, { color: isDarkMode ? '#ccc' : '#666' }]}>
          #{item.id}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteClientButton}
        onPress={() => handleDeleteClient(item.id)}
      >
        <Text style={styles.deleteClientText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#222' : '#fff' }]}>
          <View style={styles.headerContainer}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
              Seleccionar Cliente
            </Text>
            <TouchableOpacity
              style={[styles.headerButton, styles.resetButton]}
              onPress={handleResetClients}
            >
              <Text style={styles.headerButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>

          {isCreatingDiscount && (
            <Modal
              visible={isCreatingDiscount}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.discountModalContent, { backgroundColor: isDarkMode ? '#222' : '#fff' }]}>
                  <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#000', marginBottom: 20 }]}>
                    Ingrese Descuento
                  </Text>
                  <NumericKeyboard
                    onKeyPress={handleKeyPress}
                    onDelete={handleDelete}
                    onSubmit={handleSubmitDiscount}
                    onCancel={() => {
                      setIsCreatingDiscount(false);
                      setDiscountValue('');
                    }}
                    onBack={handleBack}
                    onSaveOrder={handleSaveOrder}
                    currentValue={discountValue}
                  />
                </View>
              </View>
            </Modal>
          )}

          {isCreatingNew ? (
            <View style={styles.newClientContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
                    color: isDarkMode ? '#fff' : '#000',
                  },
                ]}
                placeholder="Nombre del nuevo cliente"
                placeholderTextColor={isDarkMode ? '#999' : '#666'}
                value={newClientName}
                onChangeText={setNewClientName}
                editable={false}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.createButton]}
                  onPress={handleCreateNewClient}
                >
                  <Text style={styles.buttonText}>
                    Crear {discountValue ? `(${discountValue}% desc.)` : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsCreatingNew(false);
                    setDiscountValue('');
                  }}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <FlatList
                data={displayedClients}
                renderItem={renderClientItem}
                keyExtractor={(item) => String(item.id)}
                style={styles.clientList}
                contentContainerStyle={styles.clientListContent}
              />

              <View style={styles.bottomButtonsContainer}>
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.newButton, styles.halfButton]}
                    onPress={() => {
                      setIsCreatingNew(true);
                      setNewClientName(generateNextClientName());
                    }}
                  >
                    <Text style={styles.buttonText}>Cliente Nuevo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.discountButton, styles.halfButton]}
                    onPress={() => setIsCreatingDiscount(true)}
                  >
                    <Text style={styles.buttonText}>
                      Cliente con Descuento
                    </Text>
                  </TouchableOpacity>
                </View>



                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={onClose}
                >
                  <Text style={[styles.buttonText, { color: '#000' }]}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width > 800 ? 500 : '100%',
    height: height * 0.8,
    alignSelf: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: width > 800 ? 20 : 0,
    borderBottomRightRadius: width > 800 ? 20 : 0,
    padding: 20,
    paddingBottom: 25,
    marginTop: width > 800 ? (height * 0.1) : 0,
  },
  discountModalContent: {
    width: '100%',
    height: 'auto',
    maxHeight: height * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 25,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#dc3545',
  },
  bottomButtonsContainer: {
    gap: 10,
    marginTop: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfButton: {
    flex: 1,
  },
  quarterButton: {
    flex: 0.25,
  },
  clientList: {
    flex: 1,
    marginBottom: 10,
  },
  clientListContent: {
    paddingHorizontal: 5,
  },
  clientItemContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  clientItemInfo: {
    flex: 1,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteClientButton: {
    width: 50,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteClientText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clientItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  discountText: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 4,
  },
  clientDetails: {
    fontSize: 14,
  },
  newClientContainer: {
    padding: 15,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#ff1c02ff',
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#ff1c02ff',
    flex: 1,
  },
  newButton: {
    backgroundColor: '#ff1c02ff',
  },
  closeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  discountButton: {
    backgroundColor: '#ff1c02ff',
  },
  backButton: {
    backgroundColor: '#607D8B',
  },


  keyboardContainer: {
    justifyContent: 'flex-start',
    padding: 10,
  },
  displayContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  displayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  keysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  keyButton: {
    width: '30%',
    aspectRatio: 1.2,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  keyText: {
    fontSize: 24,
    color: '#000',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#f44336',
  },
  discountActionButtons: {
    gap: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  }
});

export default ClientSelectionModal;

