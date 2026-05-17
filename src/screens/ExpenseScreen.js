import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  StatusBar,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Detectar si es web
const isWeb = Platform.OS === 'web';
const { width } = Dimensions.get('window');
const EXPENSES_STORAGE_KEY = '@MyApp:expenses';

const ExpenseScreen = ({ isDarkMode, expenses, onUpdateExpenses, navigation, lastClosedTimestamp = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(width < 768);

  // Cargar egresos al iniciar
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const savedExpenses = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);
        if (savedExpenses !== null) {
          const parsedExpenses = JSON.parse(savedExpenses);
          // Asegurar que cada egreso tenga un ID único
          const expensesWithIds = parsedExpenses.map(expense => 
            expense.id ? expense : { ...expense, id: Date.now().toString() }
          );
          onUpdateExpenses(expensesWithIds);
        }
      } catch (error) {
        console.error('Error al cargar los egresos:', error);
      }
    };

    loadExpenses();

    const updateDimensions = ({ window }) => {
      setIsSmallScreen(window.width < 768);
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => {
      subscription?.remove();
    };
  }, []);

  // Función para actualizar y guardar en caché
  const handleUpdateExpenses = async (updatedExpenses) => {
    try {
      await AsyncStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
      onUpdateExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error al guardar los egresos:', error);
      Alert.alert('Error', 'No se pudieron guardar los egresos en el dispositivo');
    }
  };

  const activeExpenses = expenses.filter(expense => {
    const expenseTime = new Date(expense.date).getTime();
    return !lastClosedTimestamp || expenseTime > lastClosedTimestamp;
  });

  const filteredExpenses = activeExpenses.filter(expense =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
    if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
    if (sortOrder === 'highest') return b.amount - a.amount;
    if (sortOrder === 'lowest') return a.amount - b.amount;
    return 0;
  });

  const totalExpenses = activeExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleDeleteExpense = (id) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que deseas eliminar este egreso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          onPress: () => {
            const updatedExpenses = expenses.filter(expense => expense.id !== id);
            handleUpdateExpenses(updatedExpenses);
          }
        }
      ]
    );
  };

  const handleResetExpenses = () => {
    Alert.alert(
      'Confirmar Reinicio',
      '¿Estás seguro de que quieres eliminar todos los egresos?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sí, Eliminar Todos',
          style: 'destructive',
          onPress: () => handleUpdateExpenses([])
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const changeSortOrder = () => {
    const orders = ['newest', 'oldest', 'highest', 'lowest'];
    const currentIndex = orders.indexOf(sortOrder);
    const nextIndex = (currentIndex + 1) % orders.length;
    setSortOrder(orders[nextIndex]);
  };
  
  const getSortText = () => {
    switch(sortOrder) {
      case 'newest': return 'Más recientes';
      case 'oldest': return 'Más antiguos'; 
      case 'highest': return 'Mayor importe';
      case 'lowest': return 'Menor importe';
      default: return '';
    }
  };

  const getCategoryIcon = (expense) => {
    const categories = ['food', 'transport', 'health', 'shopping', 'bills'];
    const randomIndex = Math.floor(expense.amount % categories.length);
    
    switch(categories[randomIndex]) {
      case 'food': return 'restaurant-outline';
      case 'transport': return 'car-outline';
      case 'health': return 'medical-outline';
      case 'shopping': return 'cart-outline';
      case 'bills': return 'document-text-outline';
      default: return 'cash-outline';
    }
  };

  const getCategoryColor = (expense) => {
    const colors = ['#ff6b6b', '#5e60ce', '#48bfe3', '#72b01d', '#ffb86c'];
    const randomIndex = Math.floor(expense.amount % colors.length);
    return colors[randomIndex];
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const openAddExpenseModal = () => {
    setEditingExpense(null);
    setModalVisible(true);
  };

  const openEditExpenseModal = (expense) => {
    setEditingExpense(expense);
    setModalVisible(true);
  };

  const handleSaveExpense = (expenseData) => {
    if (expenseData.id) {
      // Editar egreso existente
      const updatedExpenses = expenses.map(expense => 
        expense.id === expenseData.id ? expenseData : expense
      );
      handleUpdateExpenses(updatedExpenses);
    } else {
      // Crear nuevo egreso
      const newExpense = {
        ...expenseData,
        id: Date.now().toString(),
        date: new Date().toISOString()
      };
      handleUpdateExpenses([...expenses, newExpense]);
    }
    setModalVisible(false);
  };

  const renderExpenseItem = ({ item }) => {
    const categoryColor = getCategoryColor(item);
    const categoryIcon = getCategoryIcon(item);
    
    return (
      <View style={[styles.expenseItem, isDarkMode && styles.darkExpenseItem]}>
        <View style={[styles.categoryIndicator, {backgroundColor: categoryColor}]}>
          <Icon name={categoryIcon} size={22} color="#fff" />
        </View>
        <View style={styles.expenseDetails}>
          <View style={styles.expenseTopRow}>
            <Text style={[styles.expenseDescription, isDarkMode && styles.darkText]} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={[styles.expenseAmount, isDarkMode && styles.darkText]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
          <View style={styles.expenseBottomRow}>
            <Text style={[styles.expenseDate, isDarkMode && styles.darkSubtext]}>
              <Icon name="calendar-outline" size={12} color={isDarkMode ? '#999' : '#777'} /> {formatDate(item.date)}
            </Text>
            <View style={styles.expenseActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => openEditExpenseModal(item)}
              >
                <Icon name="create-outline" size={18} color={isDarkMode ? '#bbb' : '#666'} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteExpense(item.id)}
              >
                <Icon name="trash-outline" size={18} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <LinearGradient
        colors={['#ff0000', '#cc0000']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={[styles.headerContainer, isWeb && styles.webHeaderContainer]}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Gestión de Egresos</Text>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Egresos:</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(totalExpenses)}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.addButton, isWeb && styles.webAddButton]}
            onPress={openAddExpenseModal}
          >
            <Icon name="add-outline" size={24} color="#fff" />
            {isWeb && <Text style={styles.webAddButtonText}>Agregar</Text>}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={[styles.filterContainer, isWeb && styles.webFilterContainer]}>
        <View style={[styles.searchInputContainer, isDarkMode && styles.darkSearchContainer, isWeb && styles.webSearchInputContainer]}>
          <Icon name="search-outline" size={20} color={isDarkMode ? '#999' : '#777'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, isDarkMode && styles.darkInput, isWeb && styles.webSearchInput]}
            placeholder="Buscar por descripción..."
            placeholderTextColor={isDarkMode ? '#999' : '#888'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle-outline" size={20} color={isDarkMode ? '#999' : '#777'} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.sortButton, isDarkMode && styles.darkSortButton, isWeb && styles.webSortButton]} 
          onPress={changeSortOrder}
        >
          <Icon name="funnel-outline" size={18} color="#fff" />
          {isWeb && <Text style={styles.webSortButtonText}>{getSortText()}</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.sortIndicatorContainer}>
        {!isWeb && (
          <Text style={[styles.sortIndicatorText, isDarkMode && styles.darkSubtext]}>
            Ordenando por: <Text style={styles.sortHighlight}>{getSortText()}</Text>
          </Text>
        )}
      </View>

      {expenses.length > 0 && (
        <TouchableOpacity 
          style={[styles.deleteAllButton, isDarkMode && styles.darkDeleteAllButton, isWeb && styles.webDeleteAllButton]}
          onPress={handleResetExpenses}
        >
          <Icon name="trash-outline" size={18} color="#fff" />
          <Text style={styles.deleteAllButtonText}>Eliminar Todos</Text>
        </TouchableOpacity>
      )}

      {expenses.length === 0 ? (
        <View style={[styles.emptyContainer, isWeb && styles.webEmptyContainer]}>
          <Image 
            source={{uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076432.png'}} 
            style={[styles.emptyImage, isWeb && styles.webEmptyImage]}
          />
          <Text style={[styles.emptyText, isDarkMode && styles.darkText]}>
            No hay egresos registrados
          </Text>
          <TouchableOpacity 
            style={[styles.emptyAddButton, isWeb && styles.webEmptyAddButton]}
            onPress={openAddExpenseModal}
          >
            <Text style={styles.emptyAddButtonText}>Agregar un egreso</Text>
          </TouchableOpacity>
        </View>
      ) : isWeb && !isSmallScreen ? (
        <ScrollView style={styles.webScrollView}>
          <View style={styles.webExpensesGrid}>
            {sortedExpenses.map((item) => (
              <View key={item.id}>
                {renderExpenseItem({ item })}
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={sortedExpenses}
          keyExtractor={(item) => item.id}
          renderItem={renderExpenseItem}
          contentContainerStyle={[styles.listContent, isWeb && styles.webListContent]}
          showsVerticalScrollIndicator={isWeb}
        />
      )}

      {!isWeb && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={openAddExpenseModal}
        >
          <LinearGradient
            colors={['#ff0000', '#cc0000']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="add-outline" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <ExpenseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveExpense}
        isDarkMode={isDarkMode}
        onReset={handleResetExpenses}
        expense={editingExpense}
        isWeb={isWeb}
      />
    </View>
  );
};

const ExpenseModal = ({ 
  visible, 
  onClose, 
  onSave, 
  isDarkMode, 
  onReset, 
  expense,
  isWeb
}) => {
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [description, setDescription] = useState(expense?.description || '');

  const isEditing = !!expense;

  useEffect(() => {
    if (visible) {
      setAmount(expense?.amount?.toString() || '');
      setDescription(expense?.description || '');
    }
  }, [visible, expense]);

  const handleSave = () => {
    if (!amount || (!isEditing && !description)) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    const expenseData = {
      id: expense?.id, // Mantener el mismo ID si estamos editando
      amount: amountValue,
      description: description,
      date: expense?.date || new Date().toISOString()
    };

    onSave(expenseData);
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={!isWeb}
      animationType={isWeb ? 'none' : 'slide'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.modalOverlay, isWeb && styles.webModalOverlay]}
      >
        <View style={[styles.centeredView, isWeb && styles.webCenteredView]}>
          <View style={[
            styles.modalContent, 
            isDarkMode ? styles.darkModalContent : styles.lightModalContent,
            isWeb && styles.webModalContent
          ]}>
            <View style={styles.headerContainer}>
              <Text style={[
                styles.modalTitle, 
                isDarkMode ? styles.darkText : styles.lightText
              ]}>
                {expense ? 'Editar Egreso' : 'Nuevo Egreso'}
              </Text>
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
                  isDarkMode ? styles.darkInput : styles.lightInput,
                  isWeb && styles.webInput
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
                  { height: isWeb ? 60 : 80 },
                  isWeb && styles.webInput
                ]}
                placeholder="Descripción del gasto"
                placeholderTextColor={isDarkMode ? '#999' : '#aaa'}
                value={description}
                onChangeText={setDescription}
                multiline={!isWeb}
                editable={!isEditing}
              />
            </View>
            
            <View style={[styles.buttonContainer, isWeb && styles.webButtonContainer]}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton, isWeb && styles.webButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, isWeb && styles.webButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.resetButton, isWeb && styles.webActionButton]}
                onPress={handleReset}
              >
                <Text style={styles.actionButtonText}>Reiniciar Todos</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#bbb',
  },
  darkInput: {
    color: '#fff',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'web' ? 20 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  webHeaderContainer: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 40,
  },
  headerContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 5,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  webAddButton: {
    width: 'auto',
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  webAddButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  webFilterContainer: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 40,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  webSearchInputContainer: {
    flex: 2,
  },
  darkSearchContainer: {
    backgroundColor: '#2a2a2a',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
    fontSize: 16,
  },
  webSearchInput: {
    fontSize: 14,
  },
  sortButton: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#ff0000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  webSortButton: {
    width: 'auto',
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 8,
  },
  webSortButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  darkSortButton: {
    backgroundColor: '#2c3e50',
  },
  sortIndicatorContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sortIndicatorText: {
    fontSize: 14,
    color: '#777',
  },
  sortHighlight: {
    fontWeight: '600',
    color: '#ff0000',
  },
  deleteAllButton: {
    flexDirection: 'row',
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  webDeleteAllButton: {
    maxWidth: 1200,
    width: 'calc(100% - 80px)',
    marginHorizontal: 'auto',
  },
  darkDeleteAllButton: {
    backgroundColor: '#d32f2f',
  },
  deleteAllButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 10,
  },
  webListContent: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
    paddingHorizontal: 40,
  },
  webScrollView: {
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    paddingHorizontal: 40,
  },
  webExpensesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 40,
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  darkExpenseItem: {
    backgroundColor: '#2a2a2a',
  },
  categoryIndicator: {
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseDetails: {
    flex: 1,
    padding: 15,
  },
  expenseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  expenseDate: {
    fontSize: 13,
    color: '#777',
  },
  expenseActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  webEmptyContainer: {
    maxWidth: 1200,
    width: '100%',
    marginHorizontal: 'auto',
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.6,
  },
  webEmptyImage: {
    width: 160,
    height: 160,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#ff0000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  webEmptyAddButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  webModalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  webCenteredView: {
    width: '100%',
    maxWidth: 500,
    padding: 20,
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
  webModalContent: {
    width: '100%',
  },
  lightModalContent: {
    backgroundColor: '#ffffff',
  },
  darkModalContent: {
    backgroundColor: '#2c2c2e',
  },
  modalHeaderContainer: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lightText: {
    color: '#333',
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
  webInput: {
    fontSize: 14,
    padding: 12,
  },
  lightInput: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
  },
  webButtonContainer: {
    gap: 16,
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
  webButton: {
    marginHorizontal: 0,
    padding: 12,
  },
  saveButton: {
    backgroundColor: '#ff0000',
  },
  cancelButton: {
    backgroundColor: '#ff0000',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  actionContainer: {
    marginTop: 15,
  },
  actionButton: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  }, 
  webActionButton: {
    padding: 12,
  },
  resetButton: {
    backgroundColor: '#ff0000',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
});

export default ExpenseScreen;

