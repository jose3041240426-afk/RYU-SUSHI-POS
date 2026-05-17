import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  Platform
} from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;
const isWeb = Platform.OS === 'web';
const isMobile = !isWeb;

// ConfiguraciÃ³n responsive
const numColumns = 2; // Siempre 2 columnas
const gap = 10; // Menor espacio para maximizar el tamaÃ±o del botÃ³n
const paddingTotal = 30; // Espacio total reservado para los lados
const itemSize = (screenWidth - paddingTotal - (gap * 2)) / 2;
const itemHeight = itemSize * 0.75; // Un poco mÃ¡s altos para que se vean mejor en mÃ³vil

const rollOptions = ['Empanizado', 'Natural', 'Alga fuera', 'Flamin'];

const sushiItems = [
  { id: '1', name: 'Torrelo', price: 100, ingredients: 'Torrelo: Queso crema, camarón y res', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '2', name: 'Vaquero', price: 100, ingredients: 'Vaquero: Aguacate, res y pollo', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '3', name: 'Mar y tierra', price: 100, ingredients: 'Mar y tierra: Aguacate, res y camarón', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '4', name: 'Camaron', price: 100, ingredients: 'Camaron: Aguacate, queso crema y camarón', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '5', name: 'Surimi', price: 100, ingredients: 'Surimi: Aguacate, queso crema y surimi', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '6', name: 'Costeño', price: 100, ingredients: 'Costeño: Aguacate, queso crema, camarón y surimi', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '7', name: 'Vegetariano', price: 95, ingredients: 'Vegetariano: Aguacate, queso crema y zanahoria', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '8', name: 'Gallinazo', price: 100, ingredients: 'Gallinazo: Aguacate, queso crema y pollo', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '9', name: 'Res', price: 100, ingredients: 'Res: Aguacate, queso crema y res', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '10', name: 'Ryu burro', price: 105, ingredients: 'Ryu burro: Aguacate, queso crema, res, camarón y pollo', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '11', name: 'Flamin', price: 105, ingredients: 'Flamin: Aguacate, queso crema, res y surimi', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '12', name: 'Goliat', price: 110, ingredients: 'Goliat: Aguacate, queso crema, res, camarón, surimi y pollo', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
  { id: '13', name: 'Pastor', price: 100, ingredients: 'Pastor: Aguacate, queso crema y pastor', image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000629/Sushi_koxcqm.jpg' } },
];

const friesItems = [
  { id: 'f1', name: 'Papas a la Francesa', price: 50, image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000627/papas_aidrfm.jpg' } },
  { id: 'f2', name: 'Papas Gajo', price: 60, image: { uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000626/papas-gajo_pcvzk9.jpg' } },
];

const SushiCard = ({ item, width, height, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { width, height },
        (isHovered || isPressed) && styles.cardHovered
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      // @ts-ignore - Solo para web
      onMouseEnter={() => isWeb && setIsHovered(true)}
      // @ts-ignore - Solo para web
      onMouseLeave={() => isWeb && setIsHovered(false)}
    >
      <ImageBackground
        source={item.image}
        style={styles.cardImage}
        imageStyle={styles.cardImageRadius}
        resizeMode="cover"
      >
        {isWeb && isHovered ? (
          <View style={styles.hoverOverlay}>
            <Text style={styles.ingredientsText}>{item.ingredients || item.name}</Text>
          </View>
        ) : (
          <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
            {isMobile && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>${item.price}</Text>
              </View>
            )}
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default function SushiScreen({ isDarkMode, addToCurrentOrder, clientId }) {
  const [selectedRoll, setSelectedRoll] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Todo');

  const categories = ['Todo', 'Sushi', 'Papas'];

  const handleRollSelect = (rollName) => {
    setSelectedRoll(rollName);
    setModalVisible(true);
  };

  const handleOptionSelect = (option) => {
    const selectedItem = sushiItems.find((item) => item.name === selectedRoll);
    let finalPrice = selectedItem.price;

    if (option === 'Flamin' && selectedItem.name !== 'Flamin') {
      finalPrice += 5;
    }

    addToCurrentOrder({
      type: 'Sushi',
      name: `${selectedRoll} (${option})`,
      price: finalPrice,
      clientId: clientId,
      details: option
    });

    setModalVisible(false);
  };

  const handleFriesSelect = (item) => {
    addToCurrentOrder({
      type: 'Papas',
      name: item.name,
      price: item.price,
      clientId: clientId,
      details: '-'
    });
  };

  const renderItem = ({ item }) => (
    <SushiCard
      item={item}
      width={itemSize}
      height={itemHeight}
      onPress={() => handleRollSelect(item.name)}
    />
  );

  const renderFriesItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { width: itemSize, height: itemHeight }
      ]}
      onPress={() => handleFriesSelect(item)}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={item.image}
        style={styles.cardImage}
        imageStyle={styles.cardImageRadius}
        resizeMode="cover"
      >
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {isMobile && (
            <Text style={styles.mobilePrice}>${item.price}</Text>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderOptions = () =>
    rollOptions.map((option, index) => (
      <TouchableOpacity
        key={index}
        style={[styles.optionButton, isDarkMode && styles.darkOptionButton]}
        onPress={() => handleOptionSelect(option)}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>{option}</Text>
      </TouchableOpacity>
    ));

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollView, isDarkMode && styles.darkScrollView]}
      showsVerticalScrollIndicator={true}
    >
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.mainTitle, isDarkMode && styles.darkMainTitle]}>RYU SUSHI</Text>

        <View style={styles.grid}>
          {sushiItems.map((item) => (
            <View key={item.id} style={{ margin: gap / 2 }}>
              {renderItem({ item })}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionHeader, isDarkMode && styles.darkSectionHeader]}>PAPAS</Text>
        <View style={styles.grid}>
          {friesItems.map((item) => (
            <View key={item.id} style={{ margin: gap / 2 }}>
              {renderFriesItem({ item })}
            </View>
          ))}
        </View>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
                Opciones para {selectedRoll}:
              </Text>
              <Text style={[styles.modalDescription, isDarkMode && styles.darkModalDescription]}>
                Selecciona una opciÃ³n para el rollo:
              </Text>
              {renderOptions()}
              <TouchableOpacity
                style={[styles.closeButton, isDarkMode && styles.darkCloseButton]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: Platform.OS === 'web' ? 0 : 10,
  },
  darkScrollView: {
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: Platform.OS === 'web' ? 10 : 5,
    paddingBottom: 100,
    alignItems: 'center',
    backgroundColor: '#fff',
    minHeight: Platform.OS === 'web' ? '100vh' : '100%',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  mainTitle: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: 'bold',
    marginVertical: Platform.OS === 'web' ? 20 : 15,
    color: '#000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  darkMainTitle: {
    color: '#fff',
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontSize: Platform.OS === 'web' ? 32 : 26,
    letterSpacing: 2,
  },
  sectionHeader: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    color: '#000',
    alignSelf: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  darkSectionHeader: {
    color: '#fff',
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Estilos de tarjeta
  cardContainer: {
    borderRadius: 15,
    elevation: Platform.OS === 'android' ? 3 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardHovered: {
    transform: Platform.OS === 'web' ? [{ scale: 1.02 }] : [{ scale: 0.98 }],
    elevation: Platform.OS === 'android' ? 5 : 0,
    shadowOpacity: 0.3,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageRadius: {
    borderRadius: 15,
  },
  cardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  cardTitle: {
    fontSize: Platform.OS === 'web' ? 16 : 15,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
    paddingHorizontal: 5,
  },
  priceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.85)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  priceBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  hoverOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  ingredientsText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? 14 : 12,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: Platform.OS === 'web' ? 20 : 16,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '600',
    color: 'white',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 100,
    width: '100%'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: Platform.OS === 'web' ? 0 : 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: Platform.OS === 'web' ? 30 : 20,
    borderRadius: 20,
    marginHorizontal: Platform.OS === 'web' ? 20 : 0,
    alignItems: 'center',
    width: Platform.OS === 'web' ? '90%' : '95%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333'
  },
  modalTitle: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    marginBottom: Platform.OS === 'web' ? 20 : 15,
    textAlign: 'center',
    color: '#2c3e50',
  },
  darkModalTitle: {
    color: '#ffffff',
  },
  modalDescription: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    marginBottom: Platform.OS === 'web' ? 10 : 15,
    textAlign: 'center',
    color: '#555',
    lineHeight: Platform.OS === 'web' ? 24 : 20,
  },
  darkModalDescription: {
    color: '#cccccc',
  },
  optionButton: {
    padding: Platform.OS === 'web' ? 12 : 15,
    marginVertical: Platform.OS === 'web' ? 8 : 6,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: Platform.OS === 'web' ? 44 : 50,
  },
  darkOptionButton: {
    backgroundColor: '#c0392b',
  },
  closeButton: {
    marginTop: Platform.OS === 'web' ? 15 : 20,
    backgroundColor: 'black',
    padding: Platform.OS === 'web' ? 12 : 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: Platform.OS === 'web' ? 44 : 50,
    justifyContent: 'center',
    width: '100%',
  },
  darkCloseButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555'
  },
  darkButtonText: {
    color: '#fff'
  },
});

