import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';

const screenWidth = Dimensions.get('window').width;
const isWeb = Platform.OS === 'web';
const isMobile = !isWeb;

// ConfiguraciÃ³n responsive
const numColumns = 2; // Siempre 2 columnas
const gap = 10;
const availableWidth = screenWidth - 30 - (gap * 2);
const itemSize = availableWidth / 2;
const itemHeight = itemSize * 0.75;

const EXTRAS_STORAGE_KEY = '@extras_data';

// Opciones para combos
const rollOptions = [
  'Torrelo', 'Vaquero', 'Mar y tierra', 'Camaron', 'Surimi', 'CosteÃ±o',
  'Vegetariano', 'Gallinazo', 'Res', 'Ryu burro', 'Flamin', 'Goliat', 'Pastor'
];

const saborOptions = ['Natural', 'BBQ', 'BÃºfalo', 'Mango Habanero', 'Infierno'];

const bebidaOptions = [
  'Coca-Cola 500ml', 'Jugo del Valle 237ml', 'Sprite 500ml (Vidrio)',
  'Agua de Jamaica', 'Agua de Horchata'
];

// Combos predefinidos con opciones
const combosPredefinidos = [
  {
    id: 'combo1',
    name: 'COMBO 1',
    basePrice: 100,
    type: 'Combos',
    description: '200gr de BONELESS y 150gr de PAPAS A LA FRANCESA',
    image: null,
    shortName: 'Combo 1',
    options: [
      { type: 'sabor-combinable', label: 'Sabor del Boneless (1 o 2 sabores)', key: 'sabor_boneless', options: saborOptions, maxSelections: 2 }
    ]
  },
  {
    id: 'combo2',
    name: 'COMBO 2',
    basePrice: 130,
    type: 'Combo',
    description: '1 SUSHI y 150gr de PAPAS A LA FRANCESA',
    image: null,
    shortName: 'Combo 2',
    options: [
      { type: 'rollo', label: 'Tipo de Rollo', key: 'tipo_rollo', options: rollOptions }
    ]
  },
  {
    id: 'combo3',
    name: 'COMBO 3',
    basePrice: 100,
    type: 'Combo',
    description: '200gr de ALITAS y 150gr de PAPAS A LA FRANCESA',
    image: null,
    shortName: 'Combo 3',
    options: [
      { type: 'sabor-combinable', label: 'Sabor de las Alitas (1 o 2 sabores)', key: 'sabor_alitas', options: saborOptions, maxSelections: 2 }
    ]
  },
  {
    id: 'combo4',
    name: 'COMBO 4',
    basePrice: 140,
    type: 'Combo',
    description: '200gr de BONELESS y 200gr de ALITAS',
    image: null,
    shortName: 'Combo 4',
    options: [
      {
        type: 'multiple-sabor-combinable',
        label: 'Sabores',
        options: [
          { label: 'Sabor del Boneless (1 o 2)', key: 'sabor_boneless', options: saborOptions, maxSelections: 2 },
          { label: 'Sabor de las Alitas (1 o 2)', key: 'sabor_alitas', options: saborOptions, maxSelections: 2 }
        ]
      }
    ]
  },
  {
    id: 'combo5',
    name: 'COMBO 5',
    basePrice: 200,
    type: 'Combo',
    description: '200gr de ALITAS, 200gr de BONELESS y 1 SUSHI',
    image: null,
    shortName: 'Combo 5',
    options: [
      {
        type: 'multiple-combinable',
        label: 'Selecciones',
        options: [
          { label: 'Sabor de las Alitas (1 o 2)', key: 'sabor_alitas', options: saborOptions, maxSelections: 2 },
          { label: 'Sabor del Boneless (1 o 2)', key: 'sabor_boneless', options: saborOptions, maxSelections: 2 },
          { label: 'Tipo de Rollo', key: 'tipo_rollo', options: rollOptions }
        ]
      }
    ]
  },
  {
    id: 'combo6',
    name: 'COMBO 6',
    basePrice: 600,
    type: 'Combo',
    description: '3 ROLLOS DE SUSHI, 1 BONELESS, 1 ALITAS, 1 PAPAS Y UN REFRESCO',
    image: null,
    shortName: 'Combo 6',
    options: [
      {
        type: 'multiple-complex-combinable',
        label: 'Selecciones',
        options: [
          {
            label: 'Rollos de Sushi (selecciona 3)',
            key: 'rollos_sushi',
            type: 'multiple-select',
            maxSelections: 3,
            allowRepeat: true,
            options: rollOptions
          },
          { label: 'Sabor del Boneless (1 o 2)', key: 'sabor_boneless', options: saborOptions, maxSelections: 2 },
          { label: 'Sabor de las Alitas (1 o 2)', key: 'sabor_alitas', options: saborOptions, maxSelections: 2 },
          { label: 'Refresco', key: 'refresco', options: bebidaOptions }
        ]
      }
    ]
  },
];

const SushiCard = ({ item, width, height, onPress, onLongPress, showDeleteButton, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleDeletePress = (e) => {
    if (isWeb) {
      e.preventDefault();
      e.stopPropagation();
    }
    onDelete();
  };

  return (
    <TouchableOpacity
      style={[
        styles.cardContainer,
        { width, height },
        (isHovered || isPressed) && styles.cardHovered
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      // @ts-ignore - Solo para web
      onMouseEnter={() => isWeb && setIsHovered(true)}
      // @ts-ignore - Solo para web
      onMouseLeave={() => isWeb && setIsHovered(false)}
    >
      <ImageBackground
        source={item.imageLocal ? { uri: item.imageLocal } : (item.image || null)}
        style={styles.cardImage}
        imageStyle={styles.cardImageRadius}
        resizeMode="cover"
      >
        {isWeb && isHovered ? (
          <View style={styles.hoverOverlay}>
            <Text style={styles.priceText}>${item.basePrice || item.price}</Text>
            <Text style={styles.ingredientsText}>{item.description || item.type}</Text>
            {item.options && (
              <Text style={styles.optionsText}>Haz clic para personalizar</Text>
            )}
            {showDeleteButton && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeletePress}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
                activeOpacity={0.9}
              >
                <Icon name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.cardOverlay}>
            <Text style={styles.cardTitle} numberOfLines={2} adjustsFontSizeToFit>
              {item.name}
            </Text>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>${item.basePrice || item.price}</Text>
            </View>
            {isMobile && item.options && (
              <Text style={styles.mobileOptionsText}>Personalizable</Text>
            )}
            {showDeleteButton && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                activeOpacity={0.9}
              >
                <Icon name="trash-outline" size={isMobile ? 16 : 20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default function ExtrasScreen({ isDarkMode, addToCurrentOrder, clientId }) {
  const [extras, setExtras] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExtra, setEditingExtra] = useState(null);
  const [nombreExtra, setNombreExtra] = useState('');
  const [precioExtra, setPrecioExtra] = useState('');
  const [imagenLocal, setImagenLocal] = useState(null);
  const [comboModalVisible, setComboModalVisible] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [selections, setSelections] = useState({});

  useEffect(() => {
    loadExtras();
    
    // SuscripciÃ³n Realtime para Extras
    const extrasSubscription = supabase
      .channel('public:extras')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'extras' }, payload => {
        loadExtras();
      })
      .subscribe();

    if (isMobile) {
      requestPermission();
    }

    return () => {
      supabase.removeChannel(extrasSubscription);
    };
  }, []);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a la galerÃ­a');
      }
    }
  };

  const pickImage = async () => {
    try {
      if (isWeb) {
        // Para web, usamos un input file nativo
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
          const file = event.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              setImagenLocal(e.target.result);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImagenLocal(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const loadExtras = async () => {
    try {
      const { data, error } = await supabase
        .from('extras')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setExtras(data);
    } catch (error) {
      console.error('Error cargando extras de Supabase:', error);
      // Fallback local por si no hay internet
      const savedExtras = await AsyncStorage.getItem(EXTRAS_STORAGE_KEY);
      if (savedExtras) {
        setExtras(JSON.parse(savedExtras));
      }
    }
  };

  const saveExtras = async (newExtra) => {
    try {
      const payload = { ...newExtra };
      delete payload.imageLocal;

      const { error } = await supabase
        .from('extras')
        .upsert(payload);

      if (error) throw error;
      loadExtras(); // Recargar para asegurar sincronÃ­a
    } catch (error) {
      console.error('Error guardando extra en Supabase:', error);
      Alert.alert('Error', 'No se pudo guardar en la nube');
    }
  };

  const handleAddExtra = () => {
    setEditingExtra(null);
    setNombreExtra('');
    setPrecioExtra('');
    setImagenLocal(null);
    setModalVisible(true);
  };

  const handleEditExtra = (extra) => {
    setEditingExtra(extra);
    setNombreExtra(extra.name);
    setPrecioExtra(extra.price.toString());
    setImagenLocal(extra.imageLocal || null);
    setModalVisible(true);
  };

  const handleDeleteExtra = (extraId) => {
    Alert.alert(
      'Confirmar eliminaciÃ³n',
      'Â¿EstÃ¡s seguro de que quieres eliminar este extra?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('extras')
                .delete()
                .eq('id', extraId);
              
              if (error) throw error;
              loadExtras();
              Alert.alert('Eliminado', 'Extra eliminado correctamente');
            } catch (error) {
              console.error('Error al eliminar extra:', error);
              Alert.alert('Error', 'No se pudo eliminar el extra de la nube');
            }
          }
        }
      ]
    );
  };

  const handleResetExtras = () => {
    if (extras.length === 0) {
      Alert.alert('Sin extras', 'No hay extras personalizados para eliminar');
      return;
    }

    Alert.alert(
      'Confirmar reinicio',
      'Â¿EstÃ¡s seguro de que quieres eliminar TODOS los extras personalizados? Esta acciÃ³n no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todos',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(EXTRAS_STORAGE_KEY);
              setExtras([]);
              Alert.alert('Ã‰xito', 'Todos los extras han sido eliminados');
            } catch (error) {
              console.error('Error al reiniciar extras:', error);
              Alert.alert('Error', 'No se pudieron eliminar los extras');
            }
          }
        }
      ]
    );
  };

  const handleSaveExtra = async () => {
    if (!nombreExtra || !precioExtra) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    const precio = parseFloat(precioExtra);
    if (isNaN(precio)) {
      Alert.alert('Error', 'El precio debe ser un nÃºmero vÃ¡lido');
      return;
    }

    if (precio <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor que 0');
      return;
    }

    if (editingExtra) {
      // Actualizar extra existente
      const updatedExtra = {
        id: editingExtra.id,
        name: nombreExtra,
        price: precio,
        type: 'Extra',
        imageLocal: imagenLocal
      };
      await saveExtras(updatedExtra);
    } else {
      // Crear nuevo extra
      const newExtra = {
        name: nombreExtra,
        price: precio,
        type: 'Extra',
        imageLocal: imagenLocal
      };
      await saveExtras(newExtra);
    }

    setModalVisible(false);
    setEditingExtra(null);
    setNombreExtra('');
    setPrecioExtra('');
    setImagenLocal(null);
    Alert.alert('Guardado', editingExtra ? 'Extra actualizado' : 'Extra agregado');
  };

  const handleComboSelection = (combo) => {
    setSelectedCombo(combo);
    setSelections({});
    setComboModalVisible(true);
  };

  const handleSelectionChange = (key, value, isMultipleSelect = false, maxSelections = null, allowRepeat = false) => {
    setSelections(prev => {
      if (isMultipleSelect || maxSelections) {
        const current = prev[key] || [];
        const limit = maxSelections || selectedCombo.options[0].maxSelections;

        if (allowRepeat) {
          // Modo repeticion permite seleccionar el mismo sabor varias veces
          if (current.length < limit) {
            // Hay espacio: siempre agregar (aunque ya exista en el array)
            return { ...prev, [key]: [...current, value] };
          } else {
            // Limite alcanzado: si toca uno seleccionado, quitar una ocurrencia
            if (current.includes(value)) {
              const idx = current.lastIndexOf(value);
              const newArr = [...current];
              newArr.splice(idx, 1);
              return { ...prev, [key]: newArr };
            } else {
              Alert.alert('LÃ­mite alcanzado', `Solo puedes seleccionar ${limit} rollos. Toca uno seleccionado para quitarlo.`);
              return prev;
            }
          }
        }

        if (current.includes(value)) {
          // Deseleccionar
          return {
            ...prev,
            [key]: current.filter(item => item !== value)
          };
        } else {
          // Seleccionar
          if (current.length >= limit) {
            const itemName = maxSelections ? 'sabores' : 'rollos';
            Alert.alert('LÃ­mite alcanzado', `Solo puedes seleccionar ${limit} ${itemName}`);
            return prev;
          }
          return {
            ...prev,
            [key]: [...current, value]
          };
        }
      } else {
        return {
          ...prev,
          [key]: value
        };
      }
    });
  };

  const renderOptions = () => {
    if (!selectedCombo || !selectedCombo.options) return null;

    const option = selectedCombo.options[0];

    // Manejar sabor-combinable (1 o 2 sabores)
    if (option.type === 'sabor-combinable') {
      const currentSelections = selections[option.key] || [];
      return (
        <View style={styles.optionsContainer}>
          <Text style={[styles.optionLabel, isDarkMode && styles.darkOptionLabel]}>
            {option.label} ({currentSelections.length}/{option.maxSelections})
          </Text>
          {option.options.map((opt, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                currentSelections.includes(opt) && styles.selectedOptionButton
              ]}
              onPress={() => handleSelectionChange(option.key, opt, false, option.maxSelections)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.optionButtonText,
                currentSelections.includes(opt) && styles.selectedOptionButtonText
              ]}>
                {opt}
              </Text>
              {currentSelections.includes(opt) && (
                <Icon name="checkmark" size={isMobile ? 16 : 20} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (option.type === 'multiple-select') {
      const currentArr = selections[option.key] || [];
      // Contar cuantas veces aparece cada opcion para mostrar badge
      const countMap = {};
      currentArr.forEach(v => { countMap[v] = (countMap[v] || 0) + 1; });
      return (
        <View style={styles.optionsContainer}>
          <Text style={[styles.optionLabel, isDarkMode && styles.darkOptionLabel]}>
            {option.label} ({currentArr.length}/{option.maxSelections})
          </Text>
          {option.allowRepeat && currentArr.length > 0 && (
            <Text style={[styles.optionLabel, isDarkMode && styles.darkOptionLabel, { fontSize: 12, marginBottom: 4, color: '#888' }]}>
              Seleccionados: {currentArr.join(', ')}
            </Text>
          )}
          {option.options.map((opt, index) => {
            const count = countMap[opt] || 0;
            const isSelected = count > 0;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOptionButton
                ]}
                onPress={() => handleSelectionChange(option.key, opt, true, option.maxSelections, option.allowRepeat)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionButtonText,
                  isSelected && styles.selectedOptionButtonText
                ]}>
                  {opt}{count > 1 ? ` x${count}` : ''}
                </Text>
                {isSelected && (
                  <Icon name="checkmark" size={isMobile ? 16 : 20} color="white" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    // Manejar multiple-sabor-combinable, multiple-combinable, multiple-complex-combinable
    if (option.type === 'multiple-sabor-combinable' || option.type === 'multiple-combinable' ||
      option.type === 'multiple-complex-combinable' || option.type === 'multiple' ||
      option.type === 'multiple-sabor' || option.type === 'multiple-complex') {
      return (
        <View style={styles.optionsContainer}>
          {option.options.map((opt, index) => {
            const isCombinable = opt.maxSelections && opt.maxSelections > 1;
            const isRepeat = opt.allowRepeat === true;
            const currentSelections = isCombinable ? (selections[opt.key] || []) : null;

            // Para campos con allowRepeat, construir mapa de conteos
            const countMap = {};
            if (isRepeat && currentSelections) {
              currentSelections.forEach(v => { countMap[v] = (countMap[v] || 0) + 1; });
            }

            return (
              <View key={index} style={styles.optionGroup}>
                <Text style={[styles.optionLabel, isDarkMode && styles.darkOptionLabel]}>
                  {opt.label}
                  {isCombinable && ` (${currentSelections.length}/${opt.maxSelections})`}
                </Text>
                {isRepeat && currentSelections && currentSelections.length > 0 && (
                  <Text style={[styles.optionLabel, isDarkMode && styles.darkOptionLabel, { fontSize: 12, marginBottom: 4, color: '#888' }]}>
                    Seleccionados: {currentSelections.join(', ')}
                  </Text>
                )}
                {opt.options ? (
                  opt.options.map((subOpt, subIndex) => {
                    const count = isRepeat ? (countMap[subOpt] || 0) : 0;
                    const isSelected = isRepeat
                      ? count > 0
                      : isCombinable
                        ? currentSelections.includes(subOpt)
                        : selections[opt.key] === subOpt;

                    return (
                      <TouchableOpacity
                        key={subIndex}
                        style={[
                          styles.optionButton,
                          isSelected && styles.selectedOptionButton
                        ]}
                        onPress={() => handleSelectionChange(
                          opt.key,
                          subOpt,
                          false,
                          isCombinable ? opt.maxSelections : null,
                          isRepeat
                        )}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.optionButtonText,
                          isSelected && styles.selectedOptionButtonText
                        ]}>
                          {subOpt}{isRepeat && count > 1 ? ` x${count}` : ''}
                        </Text>
                        {isSelected && (
                          <Icon name="checkmark" size={isMobile ? 16 : 20} color="white" />
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      selections[opt.key] === opt.options && styles.selectedOptionButton
                    ]}
                    onPress={() => handleSelectionChange(opt.key, opt.options)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      selections[opt.key] === opt.options && styles.selectedOptionButtonText
                    ]}>
                      {opt.options}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        <Text style={[styles.optionLabel, isDarkMode && styles.darkOptionLabel]}>
          {option.label}
        </Text>
        {option.options.map((opt, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selections[option.key] === opt && styles.selectedOptionButton
            ]}
            onPress={() => handleSelectionChange(option.key, opt)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.optionButtonText,
              selections[option.key] === opt && styles.selectedOptionButtonText
            ]}>
              {opt}
            </Text>
            {selections[option.key] === opt && (
              <Icon name="checkmark" size={isMobile ? 16 : 20} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const generateComboDisplayName = (combo, selections) => {
    let displayName = combo.shortName;

    // Helper function to format flavor selections
    const formatFlavor = (flavorSelection) => {
      if (Array.isArray(flavorSelection)) {
        return flavorSelection.length > 0 ? flavorSelection.join('/') : '';
      }
      return flavorSelection || '';
    };

    if (combo.id === 'combo1') {
      const sabor = formatFlavor(selections.sabor_boneless);
      return `${displayName}: Boneless ${sabor} y Papas`;
    }

    if (combo.id === 'combo2') {
      const rollo = selections.tipo_rollo;
      return `${displayName}: Rollo ${rollo} y Papas`;
    }

    if (combo.id === 'combo3') {
      const sabor = formatFlavor(selections.sabor_alitas);
      return `${displayName}: Alitas ${sabor} y Papas`;
    }

    if (combo.id === 'combo4') {
      const saborBoneless = formatFlavor(selections.sabor_boneless);
      const saborAlitas = formatFlavor(selections.sabor_alitas);
      return `${displayName}: Boneless ${saborBoneless} y Alitas ${saborAlitas}`;
    }

    if (combo.id === 'combo5') {
      const saborAlitas = formatFlavor(selections.sabor_alitas);
      const saborBoneless = formatFlavor(selections.sabor_boneless);
      const rollo = selections.tipo_rollo;
      return `${displayName}: Alitas ${saborAlitas}, Boneless ${saborBoneless} y Rollo ${rollo}`;
    }

    if (combo.id === 'combo6') {
      const rollos = selections.rollos_sushi ? selections.rollos_sushi.join(', ') : '';
      const saborBoneless = formatFlavor(selections.sabor_boneless);
      const saborAlitas = formatFlavor(selections.sabor_alitas);
      const refresco = selections.refresco;
      return `${displayName}: Rollos ${rollos}, Boneless ${saborBoneless}, Alitas ${saborAlitas}, Papas y ${refresco}`;
    }

    return displayName;
  };

  const handleComboConfirm = () => {
    if (!selectedCombo) return;

    // Verificar que todas las opciones requeridas estÃ©n seleccionadas
    if (selectedCombo.options && selectedCombo.options[0]) {
      const option = selectedCombo.options[0];

      // Validar sabor-combinable (al menos 1 sabor seleccionado)
      if (option.type === 'sabor-combinable') {
        const selectedFlavors = selections[option.key] || [];
        if (selectedFlavors.length === 0) {
          Alert.alert('SelecciÃ³n incompleta', `Debes seleccionar al menos 1 sabor`);
          return;
        }
      } else if (option.type === 'multiple-select') {
        const selectedRolls = selections[option.key] || [];
        if (selectedRolls.length !== option.maxSelections) {
          Alert.alert('SelecciÃ³n incompleta', `Debes seleccionar exactamente ${option.maxSelections} rollos`);
          return;
        }
      } else if (option.type === 'multiple-sabor-combinable' || option.type === 'multiple-combinable' ||
        option.type === 'multiple-complex-combinable') {
        // Validar opciones combinables dentro de multiple
        for (const opt of option.options) {
          const isCombinable = opt.maxSelections && opt.maxSelections > 1;
          const isRepeat = opt.allowRepeat === true;
          if (isRepeat) {
            // Para campos con repeticion, verificar que se seleccionaron exactamente maxSelections
            const selectedItems = selections[opt.key] || [];
            if (selectedItems.length !== opt.maxSelections) {
              Alert.alert('SelecciÃ³n incompleta', `Debes seleccionar exactamente ${opt.maxSelections} rollos de sushi`);
              return;
            }
          } else if (isCombinable) {
            const selectedItems = selections[opt.key] || [];
            if (selectedItems.length === 0) {
              Alert.alert('SelecciÃ³n incompleta', `Debes seleccionar al menos 1 opciÃ³n para ${opt.label.toLowerCase()}`);
              return;
            }
          } else {
            if (!selections[opt.key]) {
              Alert.alert('SelecciÃ³n incompleta', `Debes seleccionar ${opt.label.toLowerCase()}`);
              return;
            }
          }
        }
      } else if (option.type === 'multiple' || option.type === 'multiple-sabor' || option.type === 'multiple-complex') {
        for (const opt of option.options) {
          if (!selections[opt.key]) {
            Alert.alert('SelecciÃ³n incompleta', `Debes seleccionar ${opt.label.toLowerCase()}`);
            return;
          }
        }
      } else if (!selections[option.key]) {
        Alert.alert('SelecciÃ³n incompleta', `Debes seleccionar ${option.label.toLowerCase()}`);
        return;
      }
    }

    // Generar nombre para mostrar
    const displayName = generateComboDisplayName(selectedCombo, selections);

    // Crear descripciÃ³n detallada para details
    let details = selectedCombo.description;
    if (selectedCombo.options && Object.keys(selections).length > 0) {
      details += ' | Personalizado: ';
      const selectionStrings = Object.entries(selections).map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key.replace('_', ' ')}: ${value.join(', ')}`;
        }
        return `${key.replace('_', ' ')}: ${value}`;
      });
      details += selectionStrings.join(' | ');
    }

    addToCurrentOrder({
      type: 'Combo',
      name: displayName,
      price: selectedCombo.basePrice,
      clientId: clientId,
      details: details
    });

    Alert.alert('Combo agregado', `${displayName} ha sido agregado al pedido`);
    setComboModalVisible(false);
    setSelectedCombo(null);
    setSelections({});
  };

  const handleExtraSelection = (item) => {
    addToCurrentOrder({
      type: item.type,
      name: item.name,
      price: item.price,
      clientId: clientId,
      details: null
    });
    Alert.alert('Extra agregado', `${item.name} ha sido agregado al pedido`);
  };

  const renderComboItem = ({ item }) => (
    <SushiCard
      item={item}
      width={itemSize}
      height={itemHeight}
      onPress={() => handleComboSelection(item)}
      showDeleteButton={false}
    />
  );

  const renderExtraItem = ({ item }) => (
    <SushiCard
      item={item}
      width={itemSize}
      height={itemHeight}
      onPress={() => handleExtraSelection(item)}
      onLongPress={() => handleEditExtra(item)}
      showDeleteButton={true}
      onDelete={() => handleDeleteExtra(item.id)}
    />
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollView, isDarkMode && styles.darkScrollView]}
      showsVerticalScrollIndicator={true}
    >
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <View style={styles.headerContainer}>
          <Text style={[styles.mainTitle, isDarkMode && styles.darkMainTitle]}>EXTRAS & COMBOS</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.resetButton, isDarkMode && styles.darkButton]}
              onPress={handleResetExtras}
              activeOpacity={0.7}
            >
              <Icon name="refresh" size={isMobile ? 24 : 30} color={isDarkMode ? 'white' : 'black'} />
              {isWeb && (
                <Text style={[styles.buttonLabel, isDarkMode && styles.darkButtonLabel]}>Reiniciar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, isDarkMode && styles.darkButton]}
              onPress={handleAddExtra}
              activeOpacity={0.7}
            >
              <Icon name="add-circle" size={isMobile ? 24 : 30} color={isDarkMode ? 'white' : 'black'} />
              {isWeb && (
                <Text style={[styles.buttonLabel, isDarkMode && styles.darkButtonLabel]}>Agregar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* SecciÃ³n de COMBOS */}
        <Text style={[styles.sectionHeader, isDarkMode && styles.darkSectionHeader]}>COMBOS ESPECIALES</Text>
        <View style={styles.grid}>
          {combosPredefinidos.map((item) => (
            <View key={item.id} style={{ margin: gap / 2 }}>
              {renderComboItem({ item })}
            </View>
          ))}
        </View>

        {/* SecciÃ³n de EXTRAS PERSONALIZADOS */}
        {extras.length > 0 && (
          <>
            <View style={styles.extrasHeader}>
              <Text style={[styles.sectionHeader, isDarkMode && styles.darkSectionHeader]}>
                EXTRAS PERSONALIZADOS
              </Text>
              <Text style={[styles.extrasCount, isDarkMode && styles.darkExtrasCount]}>
                ({extras.length} extras)
              </Text>
            </View>
            <View style={styles.grid}>
              {extras.map((item) => (
                <View key={item.id} style={{ margin: gap / 2 }}>
                  {renderExtraItem({ item })}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Modal para combos con opciones */}
        <Modal
          visible={comboModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setComboModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
              >
                {selectedCombo && (
                  <>
                    <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
                      Personalizar {selectedCombo.shortName}
                    </Text>

                    <Text style={[styles.modalDescription, isDarkMode && styles.darkModalDescription]}>
                      {selectedCombo.description}
                    </Text>

                    <Text style={[styles.selectedItemPrice, isDarkMode && styles.darkSelectedItemPrice]}>
                      ${selectedCombo.basePrice}
                    </Text>

                    {selectedCombo.options && selectedCombo.options.length > 0 && (
                      <>
                        <Text style={[styles.selectionTitle, isDarkMode && styles.darkSelectionTitle]}>
                          Personaliza tu combo:
                        </Text>
                        {renderOptions()}
                      </>
                    )}
                  </>
                )}
              </ScrollView>

              <View style={[styles.modalButtonsContainer, isDarkMode && styles.darkModalButtonsContainer]}>
                <TouchableOpacity
                  style={[styles.confirmButton, isDarkMode && styles.darkConfirmButton]}
                  onPress={handleComboConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>
                    Agregar Combo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.closeButton, isDarkMode && styles.darkCloseButton]}
                  onPress={() => {
                    setComboModalVisible(false);
                    setSelectedCombo(null);
                    setSelections({});
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para agregar/editar extras personalizados */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={true}
              >
                <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
                  {editingExtra ? 'Editar Extra' : 'Nuevo Extra'}
                </Text>

                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  placeholder="Nombre del extra"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  value={nombreExtra}
                  onChangeText={setNombreExtra}
                />

                <TextInput
                  style={[styles.input, isDarkMode && styles.darkInput]}
                  placeholder="Precio"
                  placeholderTextColor={isDarkMode ? '#999' : '#666'}
                  keyboardType="numeric"
                  value={precioExtra}
                  onChangeText={setPrecioExtra}
                />

                <TouchableOpacity
                  style={[styles.imagePickerButton, isDarkMode && styles.darkImagePickerButton]}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={imagenLocal ? "image" : "image-outline"}
                    size={isMobile ? 20 : 24}
                    color={isDarkMode ? '#fff' : '#000'}
                  />
                  <Text style={[styles.imagePickerText, isDarkMode && styles.darkText]}>
                    {imagenLocal ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </Text>
                </TouchableOpacity>

                {imagenLocal && (
                  <ImageBackground
                    source={{ uri: imagenLocal }}
                    style={styles.imagePreview}
                    imageStyle={styles.imagePreviewStyle}
                  >
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setImagenLocal(null)}
                      activeOpacity={0.7}
                    >
                      <Icon name="close-circle" size={isMobile ? 20 : 24} color="white" />
                    </TouchableOpacity>
                  </ImageBackground>
                )}

                </ScrollView>

                <View style={[styles.modalButtonsContainer, isDarkMode && styles.darkModalButtonsContainer]}>
                  <TouchableOpacity
                    style={[styles.confirmButton, isDarkMode && styles.darkConfirmButton]}
                    onPress={handleSaveExtra}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.buttonText, isDarkMode && styles.darkButtonText]}>
                      {editingExtra ? 'Actualizar' : 'Guardar'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.closeButton, isDarkMode && styles.darkCloseButton]}
                    onPress={() => setModalVisible(false)}
                    activeOpacity={0.7}
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Platform.OS === 'web' ? 20 : 10,
    marginBottom: Platform.OS === 'web' ? 20 : 15,
  },
  mainTitle: {
    fontSize: Platform.OS === 'web' ? 28 : 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  darkMainTitle: {
    color: '#fff',
    textShadowColor: 'rgba(255, 140, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    fontSize: Platform.OS === 'web' ? 32 : 26,
    letterSpacing: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  resetButton: {
    padding: Platform.OS === 'web' ? 10 : 5,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    backgroundColor: Platform.OS === 'web' ? '#f8f9fa' : 'transparent',
    borderRadius: Platform.OS === 'web' ? 8 : 0,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#dee2e6',
  },
  addButton: {
    padding: Platform.OS === 'web' ? 10 : 5,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    backgroundColor: Platform.OS === 'web' ? '#f8f9fa' : 'transparent',
    borderRadius: Platform.OS === 'web' ? 8 : 0,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: '#dee2e6',
  },
  darkButton: {
    backgroundColor: Platform.OS === 'web' ? '#333' : 'transparent',
    borderColor: Platform.OS === 'web' ? '#555' : 'transparent',
  },
  buttonLabel: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: '#000',
    fontWeight: '600',
  },
  darkButtonLabel: {
    color: '#fff',
  },
  extrasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 25,
    marginBottom: 15,
  },
  extrasCount: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#666',
    fontStyle: 'italic',
  },
  darkExtrasCount: {
    color: '#aaa',
  },
  sectionHeader: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
    alignSelf: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  darkSectionHeader: {
    color: '#fff',
    textShadowColor: 'rgba(255, 140, 0, 0.5)',
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
    cursor: 'pointer',
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
    padding: Platform.OS === 'web' ? 5 : 8,
    position: 'relative',
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
  mobileOptionsText: {
    fontSize: 10,
    color: '#f39c12',
    fontStyle: 'italic',
    marginTop: 2,
  },
  hoverOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'relative',
  },
  ingredientsText: {
    color: '#fff',
    fontSize: Platform.OS === 'web' ? 12 : 10,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 5,
  },
  optionsText: {
    color: '#f39c12',
    fontSize: Platform.OS === 'web' ? 10 : 8,
    fontStyle: 'italic',
    marginTop: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
    backgroundColor: '#ff0000',
    borderRadius: 12,
    cursor: 'pointer',
    zIndex: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 100,
    width: '100%'
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Platform.OS === 'web' ? 20 : 10,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    maxHeight: Platform.OS === 'web' ? '80%' : '90%',
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333'
  },
  modalScrollView: {
    width: '100%',
    maxHeight: Platform.OS === 'web' ? '80%' : '85%',
  },
  modalScrollContent: {
    padding: Platform.OS === 'web' ? 30 : 20,
  },
  modalTitle: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2c3e50',
  },
  darkModalTitle: {
    color: '#ffffff',
  },
  modalDescription: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
    fontStyle: 'italic',
    lineHeight: Platform.OS === 'web' ? 20 : 18,
  },
  darkModalDescription: {
    color: '#cccccc',
  },
  selectionTitle: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
    color: '#2c3e50',
  },
  darkSelectionTitle: {
    color: '#ffffff',
  },
  selectedItemPrice: {
    fontSize: Platform.OS === 'web' ? 22 : 18,
    fontWeight: 'bold',
    color: '#f39c12',
    marginBottom: 15,
    textAlign: 'center',
  },
  darkSelectedItemPrice: {
    color: '#f1c40f',
  },
  optionsContainer: {
    width: '100%',
  },
  optionGroup: {
    marginBottom: 15,
  },
  optionLabel: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
    textAlign: 'center',
  },
  darkOptionLabel: {
    color: '#ffffff',
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 12 : 10,
    marginVertical: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    cursor: 'pointer',
  },
  selectedOptionButton: {
    backgroundColor: '#f39c12',
    borderColor: '#e67e22',
  },
  optionButtonText: {
    fontSize: Platform.OS === 'web' ? 14 : 12,
    color: '#2c3e50',
    flex: 1,
  },
  selectedOptionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: Platform.OS === 'web' ? 20 : 15,
    paddingTop: Platform.OS === 'web' ? 10 : 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  darkModalButtonsContainer: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333',
  },
  confirmButton: {
    padding: Platform.OS === 'web' ? 12 : 15,
    backgroundColor: '#ff0000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: Platform.OS === 'web' ? 10 : 8,
    minHeight: Platform.OS === 'web' ? 44 : 50,
    cursor: 'pointer',
  },
  darkConfirmButton: {
    backgroundColor: '#cc0000',
  },
  closeButton: {
    padding: Platform.OS === 'web' ? 12 : 15,
    backgroundColor: '#ff0000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: Platform.OS === 'web' ? 10 : 8,
    minHeight: Platform.OS === 'web' ? 44 : 50,
    cursor: 'pointer',
  },
  darkCloseButton: {
    backgroundColor: '#cc0000',
    borderWidth: 1,
    borderColor: '#900'
  },
  buttonText: {
    textAlign: 'center',
    fontSize: Platform.OS === 'web' ? 16 : 14,
    fontWeight: '600',
    color: 'white',
  },
  darkButtonText: {
    color: '#fff'
  },
  // Input styles for custom extras
  input: {
    width: '100%',
    height: Platform.OS === 'web' ? 40 : 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
  darkInput: {
    backgroundColor: '#444',
    borderColor: '#666',
    color: '#fff',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Platform.OS === 'web' ? 12 : 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    cursor: 'pointer',
  },
  darkImagePickerButton: {
    borderColor: '#666',
  },
  imagePickerText: {
    marginLeft: 10,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreviewStyle: {
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 2,
    cursor: 'pointer',
  },
});

