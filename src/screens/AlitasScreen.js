import React, { useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, ScrollView, StyleSheet, Dimensions, ImageBackground, Modal, Platform } from 'react-native';



const wingsItems = [
  {
    id: '1',
    name: 'Wings Naturales',
    price: 100,
    type: 'Alitas',
    subtype: 'completa',
    image: require('../assets/images/adobadas.jpg'),
    flavor: 'Natural',
    description: 'Alitas Naturales - Orden completa'
  },
  {
    id: '2',
    name: 'Wings BBQ',
    price: 105,
    type: 'Alitas',
    subtype: 'completa',
    image: require('../assets/images/alitas.jpeg'),
    flavor: 'BBQ',
    description: 'Alitas BBQ - Orden completa'
  },
  {
    id: '3',
    name: 'Wings Búfalo',
    price: 105,
    type: 'Alitas',
    subtype: 'completa',
    image: require('../assets/images/Bufalo.jpg'),
    flavor: 'Búfalo',
    description: 'Alitas Búfalo - Orden completa'
  },
  {
    id: '4',
    name: 'Wings Mango Habanero',
    price: 110,
    type: 'Alitas',
    subtype: 'completa',
    image: require('../assets/images/alitas.jpeg'),
    flavor: 'Mango Habanero',
    description: 'Alitas Mango Habanero - Orden completa'
  },
  {
    id: 'inf1',
    name: 'Wings Infierno',
    price: 120,
    type: 'Alitas',
    subtype: 'completa',
    image: require('../assets/images/alitas.jpeg'),
    flavor: 'Infierno',
    description: 'Alitas Infierno - Orden completa (¡MUY PICANTE!)'
  },


  //boneless
  {
    id: '9',
    name: 'Boneless Natural',
    price: 130,
    type: 'Boneless',
    subtype: 'completa',
    image: require('../assets/images/boneless-adobados.jpg'),
    flavor: 'Natural',
    description: 'Boneless Natural - Orden completa'
  },
  {
    id: '10',
    name: 'Boneless BBQ',
    price: 135,
    type: 'Boneless',
    subtype: 'completa',
    image: require('../assets/images/Boneless-BBQ.jpg'),
    flavor: 'BBQ',
    description: 'Boneless BBQ - Orden completa'
  },
  {
    id: '11',
    name: 'Boneless Búfalo',
    price: 135,
    type: 'Boneless',
    subtype: 'completa',
    image: require('../assets/images/Boneless-Bufalo.jpg'),
    flavor: 'Búfalo',
    description: 'Boneless Búfalo - Orden completa'
  },
  {
    id: '12',
    name: 'Boneless Mango Habanero',
    price: 140,
    type: 'Boneless',
    subtype: 'completa',
    image: require('../assets/images/Boneless-Mango.jpg'),
    flavor: 'Mango Habanero',
    description: 'Boneless Mango Habanero - Orden completa'
  },
  {
    id: 'inf2',
    name: 'Boneless Infierno',
    price: 150,
    type: 'Boneless',
    subtype: 'completa',
    image: require('../assets/images/boneless-adobados.jpg'),
    flavor: 'Infierno',
    description: 'Boneless Infierno - Orden completa (¡MUY PICANTE!)'
  },


  // Kilos de Boneless - $250
  {
    id: '17',
    name: 'Kilo Boneless Natural',
    price: 250,
    type: 'Boneless',
    subtype: 'kilo',
    image: require('../assets/images/boneless-adobados.jpg'),
    flavor: 'Natural',
    description: 'Boneless Natural - Por kilo'
  },
  {
    id: '18',
    name: 'Kilo Boneless BBQ',
    price: 250,
    type: 'Boneless',
    subtype: 'kilo',
    image: require('../assets/images/Boneless-BBQ.jpg'),
    flavor: 'BBQ',
    description: 'Boneless BBQ - Por kilo'
  },
  {
    id: '19',
    name: 'Kilo Boneless Búfalo',
    price: 250,
    type: 'Boneless',
    subtype: 'kilo',
    image: require('../assets/images/Boneless-Bufalo.jpg'),
    flavor: 'Búfalo',
    description: 'Boneless Búfalo - Por kilo'
  },
  {
    id: '20',
    name: 'Kilo Boneless Mango Habanero',
    price: 250,
    type: 'Boneless',
    subtype: 'kilo',
    image: require('../assets/images/Boneless-Mango.jpg'),
    flavor: 'Mango Habanero',
    description: 'Boneless Mango Habanero - Por kilo'
  },
  {
    id: 'inf3',
    name: 'Kilo Boneless Infierno',
    price: 250,
    type: 'Boneless',
    subtype: 'kilo',
    image: require('../assets/images/boneless-adobados.jpg'),
    flavor: 'Infierno',
    description: 'Boneless Infierno - Por kilo (¡MUY PICANTE!)'
  },

  // Kilos de Alitas - $200
  {
    id: '21',
    name: 'Kilo Alitas Naturales',
    price: 200,
    type: 'Alitas',
    subtype: 'kilo',
    image: require('../assets/images/adobadas.jpg'),
    flavor: 'Natural',
    description: 'Alitas Naturales - Por kilo'
  },
  {
    id: '22',
    name: 'Kilo Alitas BBQ',
    price: 200,
    type: 'Alitas',
    subtype: 'kilo',
    image: require('../assets/images/alitas.jpeg'),
    flavor: 'BBQ',
    description: 'Alitas BBQ - Por kilo'
  },
  {
    id: '23',
    name: 'Kilo Alitas Búfalo',
    price: 200,
    type: 'Alitas',
    subtype: 'kilo',
    image: require('../assets/images/Bufalo.jpg'),
    flavor: 'Búfalo',
    description: 'Alitas Búfalo - Por kilo'
  },
  {
    id: '24',
    name: 'Kilo Alitas Mango Habanero',
    price: 200,
    type: 'Alitas',
    subtype: 'kilo',
    image: require('../assets/images/alitas.jpeg'),
    flavor: 'Mango Habanero',
    description: 'Alitas Mango Habanero - Por kilo'
  },
  {
    id: 'inf4',
    name: 'Kilo Alitas Infierno',
    price: 200,
    type: 'Alitas',
    subtype: 'kilo',
    image: require('../assets/images/alitas.jpeg'),
    flavor: 'Infierno',
    description: 'Alitas Infierno - Por kilo (¡MUY PICANTE!)'
  },
];

const SushiCard = ({ item, width, height, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { width, height }
      ]}
      onPress={onPress}
      // @ts-ignore
      onMouseEnter={() => setIsHovered(true)}
      // @ts-ignore
      onMouseLeave={() => setIsHovered(false)}
    >
      <ImageBackground
        source={item.image}
        style={styles.cardImage}
        imageStyle={styles.cardImageRadius}
      >
        {isHovered ? (
          <View style={styles.hoverOverlay}>
            <Text style={styles.priceText}>${item.price}</Text>
            <Text style={styles.ingredientsText}>{item.description}</Text>
          </View>
        ) : (
          <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>${item.price}</Text>
            </View>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default function AlitasScreen({ isDarkMode, addToCurrentOrder, clientId }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState([]);

  // Lógica responsiva
  const screenWidth = Dimensions.get('window').width;
  const currentNumColumns = 2; // Siempre 2 columnas
  const currentGap = 10; 
  const availableWidth = screenWidth - 30 - (currentGap * 2);
  const itemSize = availableWidth / 2;
  const itemHeight = itemSize * 0.75;

  const handleSelection = (item) => {
    addToCurrentOrder({
      type: item.type,
      name: item.name,
      price: item.price,
      clientId: clientId,
      details: item.description
    });
  };

  const openComboModal = (type, subtype) => {
    setSelectedType(type);
    setSelectedSubtype(subtype);
    setSelectedFlavors([]);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedType('');
    setSelectedSubtype('');
    setSelectedFlavors([]);
  };

  const getAvailableFlavors = () => {
    return wingsItems.filter(item =>
      item.type === selectedType &&
      item.subtype === selectedSubtype
    );
  };

  const toggleFlavorSelection = (flavor) => {
    setSelectedFlavors(prev => {
      if (prev.includes(flavor)) {
        return prev.filter(f => f !== flavor);
      } else if (prev.length < 2) {
        return [...prev, flavor];
      }
      return prev;
    });
  };

  const addComboToOrder = () => {
    if (selectedFlavors.length === 2) {
      const flavors = getAvailableFlavors();
      const flavor1 = flavors.find(f => f.flavor === selectedFlavors[0]);
      const flavor2 = flavors.find(f => f.flavor === selectedFlavors[1]);

      // Tomar el precio más alto
      const highestPrice = Math.max(flavor1.price, flavor2.price);

      // Crear nombre con formato: "Alitas Mango Habanero/BBQ"
      const typeText = selectedType === 'Alitas' ? 'Alitas' : 'Boneless';
      const comboName = `${typeText} ${selectedFlavors[0]}/${selectedFlavors[1]}`;

      addToCurrentOrder({
        type: selectedType,
        name: comboName,
        price: highestPrice,
        clientId: clientId,
        details: `Combinación: ${selectedFlavors[0]} + ${selectedFlavors[1]} (${selectedSubtype === 'completa' ? 'Orden completa' : 'Kilo'})`
      });

      closeModal();
    }
  };

  const getComboPrice = () => {
    if (selectedFlavors.length === 2) {
      const flavors = getAvailableFlavors();
      const flavor1 = flavors.find(f => f.flavor === selectedFlavors[0]);
      const flavor2 = flavors.find(f => f.flavor === selectedFlavors[1]);
      return Math.max(flavor1.price, flavor2.price);
    }
    return 0;
  };

  const renderComboButton = (type, subtype) => (
    <TouchableOpacity
      style={styles.comboButton}
      onPress={() => openComboModal(type, subtype)}
    >
      <Text style={styles.comboButtonText}>Combinar 2 Sabores</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <SushiCard
      item={item}
      width={itemSize}
      height={itemHeight}
      onPress={() => handleSelection(item)}
    />
  );

  const renderFlavorItem = ({ item }) => {
    const isSelected = selectedFlavors.includes(item.flavor);
    return (
      <TouchableOpacity
        style={[
          styles.optionButton,
          isSelected && styles.selectedOptionButton
        ]}
        onPress={() => toggleFlavorSelection(item.flavor)}
      >
        <Text style={[
          styles.optionButtonText,
          isSelected && styles.selectedOptionButtonText
        ]}>
          {item.flavor}
        </Text>
        <Text style={[
          styles.priceTextSmall,
          isSelected && styles.selectedPriceText
        ]}>
          ${item.price}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (title, type, subtype) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={[styles.sectionHeader, isDarkMode && styles.darkSectionHeader]}>
        {title}
      </Text>
      {renderComboButton(type, subtype)}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.scrollView, isDarkMode && styles.darkScrollView]}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <Text style={[styles.mainTitle, isDarkMode && styles.darkMainTitle]}>RYU WINGS</Text>

        {renderSectionHeader('ALITAS COMPLETAS', 'Alitas', 'completa')}
        <View style={styles.grid}>
          {wingsItems.filter(item => item.type === 'Alitas' && item.subtype === 'completa').map((item) => (
            <View key={item.id} style={{ margin: currentGap / 2 }}>
              {renderItem({ item })}
            </View>
          ))}
        </View>

        {renderSectionHeader('KILOS DE ALITAS', 'Alitas', 'kilo')}
        <View style={styles.grid}>
          {wingsItems.filter(item => item.type === 'Alitas' && item.subtype === 'kilo').map((item) => (
            <View key={item.id} style={{ margin: currentGap / 2 }}>
              {renderItem({ item })}
            </View>
          ))}
        </View>

        {renderSectionHeader('BONELESS COMPLETOS', 'Boneless', 'completa')}
        <View style={styles.grid}>
          {wingsItems.filter(item => item.type === 'Boneless' && item.subtype === 'completa').map((item) => (
            <View key={item.id} style={{ margin: currentGap / 2 }}>
              {renderItem({ item })}
            </View>
          ))}
        </View>

        {renderSectionHeader('KILOS DE BONELESS', 'Boneless', 'kilo')}
        <View style={styles.grid}>
          {wingsItems.filter(item => item.type === 'Boneless' && item.subtype === 'kilo').map((item) => (
            <View key={item.id} style={{ margin: currentGap / 2 }}>
              {renderItem({ item })}
            </View>
          ))}
        </View>

        {/* Modal para combinar sabores */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
                Combinar 2 Sabores
              </Text>
              <Text style={[styles.modalDescription, isDarkMode && styles.darkModalDescription]}>
                Selecciona 2 sabores para {selectedType} {selectedSubtype === 'completa' ? 'completa' : 'kilo'}
              </Text>

              {/* Contenedor scrollable para opciones */}
              <ScrollView
                style={styles.optionsScrollContainer}
                contentContainerStyle={styles.optionsScrollContent}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.optionsGrid}>
                  {getAvailableFlavors().map((item) => {
                    const isSelected = selectedFlavors.includes(item.flavor);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.optionButton,
                          isSelected && styles.selectedOptionButton
                        ]}
                        onPress={() => toggleFlavorSelection(item.flavor)}
                      >
                        <Text style={[
                          styles.optionButtonText,
                          isSelected && styles.selectedOptionButtonText
                        ]}>
                          {item.flavor}
                        </Text>
                        <Text style={[
                          styles.priceTextSmall,
                          isSelected && styles.selectedPriceText
                        ]}>
                          ${item.price}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={styles.selectionInfoContainer}>
                <Text style={[styles.selectionInfoText, isDarkMode && styles.darkSelectionInfoText]}>
                  {selectedFlavors.length > 0 ? selectedFlavors.join(' + ') : 'Selecciona 2 sabores'}
                </Text>
                {selectedFlavors.length === 2 && (
                  <Text style={[styles.comboPrice, isDarkMode && styles.darkComboPrice]}>
                    ${getComboPrice()}
                  </Text>
                )}
              </View>

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.confirmButton, selectedFlavors.length !== 2 && styles.disabledButton, isDarkMode && styles.darkConfirmButton]}
                  onPress={addComboToOrder}
                  disabled={selectedFlavors.length !== 2}
                >
                  <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>
                    Agregar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.closeButton, isDarkMode && styles.darkCloseButton]}
                  onPress={closeModal}
                >
                  <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
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
  },
  darkScrollView: {
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  darkMainTitle: {
    color: '#fff',
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontSize: 32,
    letterSpacing: 2,
  },
  sectionHeaderContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    alignSelf: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 10,
  },
  darkSectionHeader: {
    color: '#fff',
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  comboButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  comboButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Estilos de tarjeta (igual que SushiScreen)
  cardContainer: {
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
    overflow: 'hidden',
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
    fontSize: 15,
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
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 5,
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
    padding: 10,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 20,
    width: '95%',
    maxWidth: 400,
    maxHeight: '85%',
    elevation: 8,
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2c3e50',
  },
  darkModalTitle: {
    color: '#ffffff',
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    color: '#555',
  },
  darkModalDescription: {
    color: '#cccccc',
  },
  optionsScrollContainer: {
    width: '100%',
    maxHeight: 300,
  },
  optionsScrollContent: {
    paddingVertical: 5,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionsContainer: {
    width: '100%',
    paddingVertical: 10,
  },
  optionButton: {
    width: '48%',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 65,
  },
  selectedOptionButton: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
  },
  selectedOptionButtonText: {
    color: 'white',
  },
  priceTextSmall: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  selectedPriceText: {
    color: 'white',
  },
  selectionInfoContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  selectionInfoText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 4,
  },
  darkSelectionInfoText: {
    color: '#ffffff',
  },
  comboPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#e74c3c',
    marginTop: 2,
  },
  darkComboPrice: {
    color: '#ff6b6b',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  confirmButton: {
    padding: 14,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 6,
  },
  darkConfirmButton: {
    backgroundColor: '#c0392b',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  closeButton: {
    padding: 14,
    backgroundColor: '#7f8c8d',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 6,
  },
  darkCloseButton: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555'
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  darkButtonText: {
    color: '#fff'
  },
});

