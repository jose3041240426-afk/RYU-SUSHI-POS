import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
// SwipeableTabNavigator ya no es necesario ya que usamos TopTabNavigator directamente en el fondo
import SushiScreen from './src/screens/SushiScreen';
import BebidasScreen from './src/screens/BebidasScreen';
import HistorialScreen from './src/screens/HistorialScreen';
import AlitasScreen from './src/screens/AlitasScreen';
import RegistroScreen from './src/screens/RegistroScreen';
import SplashScreen from './src/screens/SplashScreen';
import ClientSelectionModal from './src/screens/ClientSelectionModal';
import SavedDaysModal from './src/screens/SavedDaysModal';
import PostresScreen from './src/screens/PostresScreen';
import ExpenseScreen from './src/screens/ExpenseScreen';
import PrinterScreen from './src/services/impresion/PrinterScreen';
import { Audio } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  TouchableOpacity,
  Image,
  View,
  Modal,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Ionicons as Icon } from '@expo/vector-icons';
import { supabase } from './src/services/supabase';
import ModernTabBar from './src/components/ui/ModernTabBar';


const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

const MONEY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M13.5 16a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0"/><path fill="#fff" d="m14.347.66l3.18 4.456l2.097-.715L21.538 10h.962v12h-21V10h.51v-.01l.648.006zM9.397 10h10.028l-1.037-3.033l-1.522.487zM7.839 8.417L15.55 5.79l-1.604-2.25zM5.5 12h-2v2a2 2 0 0 0 2-2m10 4a3.5 3.5 0 1 0-7 0a3.5 3.5 0 0 0 7 0m5 4v-2a2 2 0 0 0-2 2zm-2-8a2 2 0 0 0 2 2v-2zm-15 8h2a2 2 0 0 0-2-2z"/></svg>`;
const CARD_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#fff" d="M32 416a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V222H32Zm66-138a8 8 0 0 1 8-8h92a8 8 0 0 1 8 8v64a8 8 0 0 1-8 8h-92a8 8 0 0 1-8-8ZM464 80H48a16 16 0 0 0-16 16v66h448V96a16 16 0 0 0-16-16"/></svg>`;
const TIME_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#fff" d="M115.063 21.97v9.343c0 101.953 38.158 189.648 96.343 222.093v6.094c-58.186 32.445-96.344 120.14-96.344 222.094v9.344H401.81v-9.344c0-102.552-38.804-190.274-97.53-222.188V253.5c58.722-31.917 97.53-119.64 97.53-222.188V21.97H115.06zM134 40.655h248.875c-2.477 96.445-42.742 175.523-91.938 198.906l-5.343 2.532v28.751l5.344 2.53c49.193 23.383 89.456 102.438 91.937 198.876H134c2.456-95.898 42.125-175.078 90.875-198.938l5.25-2.562v-28.594l-5.25-2.562c-48.748-23.86-88.42-103.04-90.875-198.938zm213.656 86.125c-57.607 27.81-124.526 27.84-177.562 4.095C184.748 181.78 213.91 218.012 248.22 224a12.18 12.18 0 0 0-2.47 7.344c0 6.76 5.488 12.25 12.25 12.25s12.25-5.49 12.25-12.25c0-2.72-.907-5.218-2.406-7.25c35.426-5.88 65.488-44.07 79.812-97.313zM258 258.626c-6.762 0-12.25 5.488-12.25 12.25s5.488 12.25 12.25 12.25s12.25-5.488 12.25-12.25s-5.488-12.25-12.25-12.25m0 39.28c-6.762 0-12.25 5.49-12.25 12.25c0 6.763 5.488 12.25 12.25 12.25s12.25-5.487 12.25-12.25c0-6.76-5.488-12.25-12.25-12.25m0 39.533c-6.762 0-12.25 5.488-12.25 12.25c0 6.76 5.488 12.25 12.25 12.25s12.25-5.49 12.25-12.25c0-6.762-5.488-12.25-12.25-12.25m.125 39.906c-23.21.28-46.19 25.77-75.813 75.656h153c-30.523-51.003-53.977-75.936-77.187-75.656"/></svg>`;

function TabNavigator({
  isDarkMode,
  toggleTheme,
  is3x2Active,
  toggle3x2,
  history,
  setHistory,
  currentOrder,
  addToCurrentOrder,
  navigation,
  registroInfo,
  setConfirmationModalVisible,
  expenses,
  handleResetExpenses,
  handleAddExpense,
  handleUpdateExpenses,
  loadHistory,
  lastClosedTimestamp,
  setLastClosedTimestamp,
  savedDays,
  setSavedDays
}) {


  const appStyles = {
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#fff',
    },
    text: {
      color: isDarkMode ? '#fff' : '#000',
    },
    tabBarStyle: {
      backgroundColor: 'red',
      height: Platform.OS === 'web' ? 70 : 60,
    },
    headerStyle: {
      backgroundColor: 'red',
    },
    headerTintColor: '#fff',
    tabBarLabelStyle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#fff',
      paddingBottom: 2,
      textAlign: 'center',
    },
    tabBarActiveTintColor: '#fff',
    tabBarInactiveTintColor: '#000',
    tabBarItemStyle: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 10,
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBarPosition="bottom"
        tabBar={(props) => <ModernTabBar {...props} isDarkMode={isDarkMode} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Sushi">
          {() => (
            <SushiScreen
              isDarkMode={isDarkMode}
              setHistory={setHistory}
              addToCurrentOrder={addToCurrentOrder}
              is3x2Active={is3x2Active}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Alitas">
          {() => (
            <AlitasScreen
              isDarkMode={isDarkMode}
              setHistory={setHistory}
              addToCurrentOrder={addToCurrentOrder}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Bebidas">
          {() => (
            <BebidasScreen
              isDarkMode={isDarkMode}
              setHistory={setHistory}
              addToCurrentOrder={addToCurrentOrder}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Extras">
          {() => (
            <PostresScreen
              isDarkMode={isDarkMode}
              setHistory={setHistory}
              addToCurrentOrder={addToCurrentOrder}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Historial">
          {() => (
            <HistorialScreen
              isDarkMode={isDarkMode}
              history={history}
              onUpdateHistory={setHistory}
              registro={registroInfo}
              expenses={expenses}
              navigation={navigation}
              handleResetExpenses={handleResetExpenses}
              onRefresh={loadHistory}
              lastClosedTimestamp={lastClosedTimestamp}
              savedDays={savedDays}
              onCloseDay={async (timestamp) => {
                const newDay = {
                  timestamp: timestamp,
                  date: new Date().toISOString(),
                  worker_name: registroInfo?.workerName || 'Sin nombre',
                  cash_in_box: parseFloat(registroInfo?.cashInBox || '0'),
                  branch: registroInfo?.direccion || 'Matriz',
                };

                // 1. Guardar en Supabase
                const { error } = await supabase
                  .from('cierres')
                  .insert([newDay]);

                if (error) {
                  Alert.alert('Error', 'No se pudo sincronizar el cierre con la base de datos. Se guardará localmente.');
                  console.error('Error saving cierre to Supabase:', error);
                }

                // 2. Actualizar estado local (esto también lo hará el Realtime, pero así es instantáneo)
                setLastClosedTimestamp(timestamp);
                const updatedSavedDays = [newDay, ...savedDays];
                setSavedDays(updatedSavedDays);

                // 3. Backup local
                await AsyncStorage.setItem('lastClosedTimestamp', timestamp.toString());
                await AsyncStorage.setItem('savedDays', JSON.stringify(updatedSavedDays));

                // 4. Borrar TODOS los clientes de Supabase y local (son de sesión, no permanentes)
                try {
                  // Primero obtener todos los IDs
                  const { data: allClients } = await supabase.from('clientes').select('id');
                  if (allClients && allClients.length > 0) {
                    const ids = allClients.map(c => c.id);
                    const { error: delError } = await supabase.from('clientes').delete().in('id', ids);
                    if (delError) {
                      console.error('Error borrando clientes:', delError);
                    }
                  }
                  await AsyncStorage.removeItem('@clients_key');
                } catch (e) {
                  console.log('Error limpiando clientes al cerrar día:', e);
                }
                setClients([]);
              }}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      {
        currentOrder.length > 0 && (
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => setConfirmationModalVisible(true)}>
            <Text style={styles.floatingButtonText}>
              Confirmar Pedido ({currentOrder.length})
            </Text>
          </TouchableOpacity>
        )
      }
    </View>
  );
}

function MainApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [is3x2Active, setIs3x2Active] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [clientSelectionVisible, setClientSelectionVisible] = useState(false);
  const [registroInfo, setRegistroInfo] = useState(null);
  const [clients, setClients] = useState([]);
  const [savedDays, setSavedDays] = useState([]);
  const [savedDaysModalVisible, setSavedDaysModalVisible] = useState(false);
  const [lastClosedTimestamp, setLastClosedTimestamp] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [isSnackEnvironment, setIsSnackEnvironment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cashAmount, setCashAmount] = useState('');
  const [change, setChange] = useState(0);
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [orderTypeModalVisible, setOrderTypeModalVisible] = useState(false);
  const [orderType, setOrderType] = useState('Para llevar');
  const [customOrderNote, setCustomOrderNote] = useState('');

  const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';

  // Catálogo REAL - idéntico a los botones manuales de la app
  const PRODUCT_CATALOG = {
    // Sushis - del SushiScreen.js
    sushi: {
      rollos: ['Torrelo', 'Vaquero', 'Mar y tierra', 'Camaron', 'Surimi', 'Costeño', 'Vegetariano', 'Gallinazo', 'Res', 'Ryu burro', 'Flamin', 'Goliat', 'Pastor'],
      preparaciones: ['Empanizado', 'Natural', 'Alga fuera', 'Flamin'],
      precios: { 'Vegetariano': 95, 'Ryu burro': 105, 'Flamin': 105, 'Goliat': 110 },
      precioBase: 100,
      // Cómo lo agrega el botón manual:
      build: (rollo, prep) => ({ type: 'Sushi', name: `${rollo} (${prep || 'Empanizado'})`, price: (PRODUCT_CATALOG.sushi.precios[rollo] || 100) + (prep === 'Flamin' && rollo !== 'Flamin' ? 5 : 0), details: prep || 'Empanizado' })
    },
    // Alitas - del AlitasScreen.js
    alitas: {
      'Natural': { price: 100 }, 'BBQ': { price: 105 }, 'Búfalo': { price: 105 }, 'Mango Habanero': { price: 110 }, 'Infierno': { price: 120 },
      build: (sabor, subtype) => {
        if (subtype === 'kilo') return { type: 'Alitas', name: `Kilo Alitas ${sabor}`, price: 200, details: `Alitas ${sabor} - Por kilo` };
        if (subtype === 'medio') return { type: 'Alitas', name: `Media Orden Alitas ${sabor}`, price: 110, details: `Alitas ${sabor} - Medio kilo` };
        const sabores = sabor.split('/');
        const p1 = PRODUCT_CATALOG.alitas[sabores[0]]?.price || 100;
        const p2 = PRODUCT_CATALOG.alitas[sabores[1]]?.price || p1;
        return { type: 'Alitas', name: `Wings ${sabor}`, price: Math.max(p1, p2), details: `Alitas ${sabor} - Orden completa` };
      }
    },
    boneless: {
      'Natural': { price: 130 }, 'BBQ': { price: 135 }, 'Búfalo': { price: 135 }, 'Mango Habanero': { price: 140 }, 'Infierno': { price: 150 },
      build: (sabor, subtype) => {
        if (subtype === 'kilo') return { type: 'Boneless', name: `Kilo Boneless ${sabor}`, price: 250, details: `Boneless ${sabor} - Por kilo` };
        if (subtype === 'medio') return { type: 'Boneless', name: `Media Orden Boneless ${sabor}`, price: 140, details: `Boneless ${sabor} - Medio kilo` };
        const sabores = sabor.split('/');
        const p1 = PRODUCT_CATALOG.boneless[sabores[0]]?.price || 130;
        const p2 = PRODUCT_CATALOG.boneless[sabores[1]]?.price || p1;
        return { type: 'Boneless', name: `Boneless ${sabor}`, price: Math.max(p1, p2), details: `Boneless ${sabor} - Orden completa` };
      }
    },
    papas: {
      'francesa': { type: 'Papas', name: 'Papas a la Francesa', price: 50, details: '-' },
      'gajo': { type: 'Papas', name: 'Papas Gajo', price: 60, details: '-' },
    },
    bebidas: {
      'coca': { type: 'Bebida', name: 'Coca-Cola 500ml', price: 20, details: 'Refresco' },
      'jugo': { type: 'Bebida', name: 'Jugo del Valle 237ml', price: 10, details: 'Jugo' },
      'sprite': { type: 'Bebida', name: 'Sprite 500ml (Vidrio)', price: 25, details: 'Refresco' },
      'jamaica': { type: 'Bebida', name: 'Agua de Jamaica', price: 15, details: 'Agua Fresca' },
      'horchata': { type: 'Bebida', name: 'Agua de Horchata', price: 15, details: 'Agua Fresca' },
    },
    combos: {
      1: { basePrice: 100, build: (sabor) => ({ type: 'Combo', name: `Combo 1: Boneless ${sabor || 'Natural'} y Papas`, price: 100, details: '200gr de BONELESS y 150gr de PAPAS A LA FRANCESA' }) },
      2: { basePrice: 130, build: (rollo) => ({ type: 'Combo', name: `Combo 2: Rollo ${rollo || 'Vaquero'} y Papas`, price: 130, details: '1 SUSHI y 150gr de PAPAS A LA FRANCESA' }) },
      3: { basePrice: 100, build: (sabor) => ({ type: 'Combo', name: `Combo 3: Alitas ${sabor || 'Natural'} y Papas`, price: 100, details: '200gr de ALITAS y 150gr de PAPAS A LA FRANCESA' }) },
      4: { basePrice: 140, build: (saborW, saborB) => ({ type: 'Combo', name: `Combo 4: Boneless ${saborB || 'Natural'} y Alitas ${saborW || 'Natural'}`, price: 140, details: '200gr de BONELESS y 200gr de ALITAS' }) },
      5: { basePrice: 200, build: (saborW, saborB, rollo) => ({ type: 'Combo', name: `Combo 5: Alitas ${saborW || 'Natural'}, Boneless ${saborB || 'Natural'} y Rollo ${rollo || 'Vaquero'}`, price: 200, details: '200gr de ALITAS, 200gr de BONELESS y 1 SUSHI' }) },
      6: { basePrice: 600, build: (saborW, saborB, rollos, bebida) => ({ type: 'Combo', name: `Combo 6: Rollos ${rollos || 'Surtidos'}, Boneless ${saborB || 'Natural'}, Alitas ${saborW || 'Natural'} y ${bebida || 'Refresco'}`, price: 600, details: '3 ROLLOS, 1 BONELESS, 1 ALITAS, 1 PAPAS Y 1 REFRESCO' }) },
    }
  };

  // Función que busca producto real en el catálogo
  const buildProductFromAI = (aiItem) => {
    const cat = aiItem.category?.toLowerCase() || '';
    const sabor = aiItem.flavor || '';
    const saborW = aiItem.wingsFlavor || sabor;
    const saborB = aiItem.bonelessFlavor || sabor;
    const prep = aiItem.preparation || 'Empanizado';
    const rollo = aiItem.roll || '';

    // Mapeo inteligente de bebidas
    const DRINK_MAP = {
      'coca': 'Coca-Cola', 'refresco': 'Coca-Cola', 'soda': 'Coca-Cola',
      'jugo': 'Jugo del Valle', 'valle': 'Jugo del Valle',
      'sprite': 'Sprite',
      'jamaica': 'Agua de Jamaica',
      'horchata': 'Agua de Horchata'
    };

    let bebida = aiItem.drink || '';
    for (const [key, val] of Object.entries(DRINK_MAP)) {
      if (bebida.toLowerCase().includes(key)) {
        bebida = val;
        break;
      }
    }

    if (cat === 'sushi') {
      const rollName = (rollo && rollo.toLowerCase().includes('burro')) ? 'Ryu burro' : rollo;
      const matched = PRODUCT_CATALOG.sushi.rollos.find(r => r.toLowerCase() === rollName.toLowerCase());
      if (matched) return PRODUCT_CATALOG.sushi.build(matched, prep);
    }
    if (cat === 'alitas') {
      return PRODUCT_CATALOG.alitas.build(saborW || 'Natural', aiItem.subtype);
    }
    if (cat === 'boneless') {
      return PRODUCT_CATALOG.boneless.build(saborB || 'Natural', aiItem.subtype);
    }
    if (cat === 'papas') {
      if (rollo.toLowerCase().includes('gajo')) return PRODUCT_CATALOG.papas['gajo'];
      return PRODUCT_CATALOG.papas['francesa'];
    }
    if (cat === 'bebida') {
      const drinkKey = Object.keys(DRINK_MAP).find(k => rollo.toLowerCase().includes(k)) || 'coca';
      return PRODUCT_CATALOG.bebidas[drinkKey === 'coca' ? 'coca' : drinkKey === 'jugo' ? 'jugo' : drinkKey] || PRODUCT_CATALOG.bebidas['coca'];
    }
    if (cat === 'combo') {
      const num = parseInt(aiItem.comboNumber) || 1;
      const comboBuilder = PRODUCT_CATALOG.combos[num];
      if (comboBuilder) {
        if (num === 2) return comboBuilder.build(rollo); // Solo rollo para el 2
        if (num === 4 || num === 5) return comboBuilder.build(saborW, saborB, rollo);
        if (num === 6) return comboBuilder.build(saborW, saborB, rollo, bebida);
        return comboBuilder.build(sabor, rollo);
      }
    }
    return null;
  };

  const processAIOrder = async (userInput) => {
    if (!userInput || !userInput.trim()) return;
    setIsAiProcessing(true);
    try {
      console.log('--- IA CATÁLOGO ---');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          response_format: { "type": "json_object" },
          messages: [
            {
              role: 'system',
              content: `Eres un clasificador de pedidos para RYU SUSHI. Responde solo en JSON.

              REGLAS DE ORO:
              1. Si el usuario dice "Combo X", el "comboNumber" DEBE ser X. No lo cambies.
              2. "3 Combos 1" -> category:combo, comboNumber:1, quantity:3.
              3. Solo agrupa en Combo 6 si el usuario lo pide o si describe exactamente 3 sushis, alitas, boneless y refresco juntos sin mencionar otro número.
              
              REGLAS DE FORMATO:
              1. COMBO 6: ÚNICAMENTE aquí, en el campo "roll", si son 3 del mismo, DEBES escribir el nombre 3 veces separado por comas (ej: "Mar y tierra, Mar y tierra, Mar y tierra"). 
              2. SUSHI INDIVIDUAL: Usa el nombre simple del rollo (ej: "Mar y tierra") y pon la cantidad en "quantity". NO repitas el nombre.
              3. PREPARACIÓN SUSHI: Empanizado(default), Natural, Alga fuera, Flamin. Si dicen "empanizado en flamin" usa "Flamin".
              4. Sabores: BBQ, Búfalo, Mango Habanero, Infierno, Natural.
              5. Rollos: Torrelo, Vaquero, Mar y tierra, Camaron, Surimi, Costeño, Vegetariano, Gallinazo, Res, Ryu burro (burro), Flamin, Goliat, Pastor.

              EJEMPLO KILOS Y MITAD: "3 kilos de boneless mitad bbq y mitad mango" ->
              {"items":[{"category":"boneless","subtype":"kilo","flavor":"BBQ/Mango Habanero","quantity":3}],"client":null}

              EJEMPLO SUSHI: "3 mar y tierra empanizados en flamin" ->
              {"items":[{"category":"sushi","roll":"Mar y tierra","preparation":"Flamin","quantity":3}],"client":null}              FORMATO OBJETIVO:
              {"items":[
                {
                  "category": "combo" | "sushi" | "alitas" | "boneless" | "papas" | "bebida",
                  "subtype": "completa" | "kilo" | "medio",
                  "comboNumber": 1-6,
                  "roll": string,
                  "quantity": number,
                  "is3x2": boolean, // USE is3x2: true for promotions
                  "flavor": string,
                  ...
                }
              ], "client": string | null}`
            },
            {
              role: 'user',
              content: `Pedido: ${userInput}`
            }
          ],
          temperature: 0,
        })
      });

      const data = await response.json();
      console.log('API Response completa:', JSON.stringify(data));

      if (data.error) {
        throw new Error(`API Error: ${data.error.message || JSON.stringify(data.error)}`);
      }

      const aiText = data?.choices?.[0]?.message?.content;
      if (!aiText) throw new Error('Sin contenido en respuesta');

      console.log('IA clasificación:', aiText);
      const result = JSON.parse(aiText);
      const items = result.items || [];
      const detectedClient = result.client || null;

      if (!items.length) throw new Error('Sin productos');

      items.forEach(aiItem => {
        const product = buildProductFromAI(aiItem);
        if (!product) return;

        const qty = aiItem.quantity || 1;
        // Detectar promoción de ambas formas por seguridad
        const is3x2 = aiItem.is3x2 === true || aiItem.promotion === '3x2';

        if (is3x2) {
          const cycles = Math.floor(qty / 3) || (qty >= 3 ? 1 : 0);
          const remaining = cycles > 0 ? (qty % 3) : qty;

          // Si hay al menos 3, hacemos ciclos de 3x2 (2 pagos full, 1 paga solo el excedente de $100)
          for (let c = 0; c < cycles; c++) {
            addToCurrentOrder({ ...product, clientId: null });
            addToCurrentOrder({ ...product, clientId: null });

            // El tercer producto tiene un descuento de $100
            const promotionalPrice = Math.max(0, product.price - 100);
            addToCurrentOrder({
              ...product,
              price: promotionalPrice,
              isPromotional: true,
              clientId: null
            });
          }
          // El resto se cobra normal
          for (let r = 0; r < remaining; r++) {
            addToCurrentOrder({ ...product, clientId: null });
          }
        } else {
          for (let i = 0; i < qty; i++) {
            addToCurrentOrder({ ...product, clientId: null });
          }
        }
      });

      // Si se detectó un cliente, intentamos vincularlo y abrir confirmación
      if (detectedClient) {
        // Buscar coincidencia en la lista de clientes existentes
        const match = clients.find(c =>
          String(c.name).toLowerCase().includes(String(detectedClient).toLowerCase()) ||
          String(detectedClient).toLowerCase().includes(String(c.name).toLowerCase())
        );

        if (match) {
          // Si encontramos al cliente, lo pre-seleccionamos y vamos a confirmación
          setAiModalVisible(false);
          setAiInput('');
          setConfirmationModalVisible(true);
        } else {
          // Si no existe, al menos agregamos los productos
          if (Platform.OS === 'web') alert(`Productos agregados. No se encontró al cliente "${detectedClient}".`);
        }
      }

      setAiInput('');
      setAiModalVisible(false);
      if (Platform.OS === 'web') alert('Pedido procesado con éxito');
    } catch (error) {
      console.error('Error detallado IA:', error);
      const msg = error.message.includes('Unexpected token')
        ? 'La IA devolvió un formato confuso. Intenta ser más específico.'
        : 'Error al procesar: ' + error.message;

      if (Platform.OS === 'web') alert(msg);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const startRecording = async () => {
    if (isRecording || recording) return;
    setAiInput(''); // Limpiar texto previo al iniciar nueva grabación
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(newRecording);
        setIsRecording(true);
      } else {
        alert('Se requieren permisos de micrófono para el dictado por voz.');
      }
    } catch (err) {
      console.error('Error al iniciar grabación:', err);
      setRecording(null);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return; // Seguridad
    setIsRecording(false);
    try {
      const status = await recording.getStatusAsync();
      if (status.canRecord) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        processAudioToText(uri);
      }
    } catch (err) {
      console.error('Error al detener grabación:', err);
      setRecording(null);
    }
  };

  const processAudioToText = async (uri) => {
    setIsAiProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      });
      formData.append('model', 'whisper-large-v3');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        setAiInput(data.text);
        processAIOrder(data.text);
      } else {
        throw new Error('No se pudo transcribir el audio.');
      }
    } catch (error) {
      console.error('Error Whisper:', error);
      alert('Error al procesar audio. Intenta de nuevo.');
      setIsAiProcessing(false);
    }
  };

  const showRegistroInfo = () => {
    if (registroInfo) {
      Alert.alert(
        'Información del Registro',
        `Cambio en caja: $${registroInfo.cashInBox}\nFecha: ${registroInfo.date}\nTrabajador: ${registroInfo.workerName}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Sin información',
        'No hay información de registro disponible',
        [{ text: 'OK' }]
      );
    }
  };

  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
      await loadDarkModePreference();
      // Ya no cargamos lastClosedTimestamp solo de AsyncStorage, se cargará desde Supabase en loadSavedDays
      loadSavedDays();
      loadExpenses();
      loadHistory();
      loadClients();
    };
    init();

    // Suscripción Realtime para Cierres de Día
    const cierresSubscription = supabase
      .channel('public:cierres')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cierres' }, payload => {
        console.log('Cambio en cierres detectado:', payload);
        loadSavedDays(); // Recargar todo cuando hay un cambio
      })
      .subscribe();

    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        body, html, #root {
          height: 100% !important;
          margin: 0;
          padding: 0;
          overflow: hidden !important;
        }
      `;
      document.head.append(style);
    }

    if (typeof expo !== 'undefined') {
      setIsSnackEnvironment(true);
    }

    // --- SISTEMA DE TIEMPO REAL REFORZADO ---
    const dbChannel = supabase
      .channel('pos-system-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          console.log('¡Cambio detectado en la nube!', payload.table, payload.eventType);
          if (payload.table === 'pedidos') {
            loadHistory();
          } else if (payload.table === 'clientes') {
            loadClients();
          }
        }
      )
      .subscribe((status) => {
        console.log('Estado de conexión Realtime:', status);
      });

    return () => {
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(cierresSubscription);
    };
  }, []);

  // Auto-save history when it changes (for edits, deletions, etc.)
  useEffect(() => {
    if (history.length > 0) {
      saveHistory(history);
    }
  }, [history]);

  const loadDarkModePreference = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem('expenses');
      if (savedExpenses !== null) {
        setExpenses(JSON.parse(savedExpenses));
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('history');
      if (savedHistory !== null) {
        setHistory(JSON.parse(savedHistory));
      }

      // Intentar cargar desde Supabase si es posible
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('time', { ascending: false });

      if (error) {
        console.warn('Error loading history from Supabase:', error.message);
      } else if (data) {
        // Supabase es la fuente de verdad. Si está vacío, vaciamos la app.
        // Si tiene datos, los reemplazamos exactamente como están en la nube.
        setHistory(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) setClients(data);
    } catch (error) {
      console.error('Error loading clients from Supabase:', error);
      // Fallback a local si falla
      const saved = await AsyncStorage.getItem('@clients_key');
      if (saved) setClients(JSON.parse(saved));
    }
  };

  const loadSavedDays = async () => {
    try {
      // 1. Intentar cargar desde Supabase
      const { data, error } = await supabase
        .from('cierres')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.warn('Error loading cierres from Supabase:', error.message);
        // Fallback a local si falla
        const localDays = await AsyncStorage.getItem('savedDays');
        if (localDays) setSavedDays(JSON.parse(localDays));
        const localTs = await AsyncStorage.getItem('lastClosedTimestamp');
        if (localTs) setLastClosedTimestamp(parseInt(localTs));
      } else if (data && data.length > 0) {
        setSavedDays(data);
        // El último cierre es el que define el filtro actual
        setLastClosedTimestamp(data[0].timestamp);
        // Guardar copia local
        await AsyncStorage.setItem('savedDays', JSON.stringify(data));
        await AsyncStorage.setItem('lastClosedTimestamp', data[0].timestamp.toString());
      } else {
        // Si no hay cierres en la nube
        setSavedDays([]);
        setLastClosedTimestamp(0);
        await AsyncStorage.setItem('lastClosedTimestamp', '0');
      }
    } catch (error) {
      console.error('Error in loadSavedDays:', error);
    }
  };

  const saveExpenses = async (newExpenses) => {
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify(newExpenses));
    } catch (error) {
      console.error('Error saving expenses:', error);
    }
  };

  const saveHistory = async (newHistory) => {
    try {
      await AsyncStorage.setItem('history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const handleResetExpenses = async () => {
    setExpenses([]);
    try {
      await AsyncStorage.setItem('expenses', JSON.stringify([]));
    } catch (error) {
      console.error('Error resetting expenses:', error);
    }
  };

  const handleAddExpense = (newExpense) => {
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
  };

  const handleUpdateExpenses = (updatedExpenses) => {
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
  };

  const handleExportDayReport = async (day) => {
    try {
      if (isSnackEnvironment) {
        Alert.alert(
          'Función limitada en Snack',
          'La exportación completa de PDF funciona en build local o Expo Go'
        );
        return;
      }

      const dayOrders = history.filter((order) => {
        try {
          const d1 = new Date(order.time);
          const d2 = new Date(day.date);
          return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
        } catch (e) {
          return false;
        }
      });

      const totalSales = dayOrders.reduce((sum, order) => sum + (parseFloat(order.price) || 0), 0);
      const dayExpenses = expenses.filter((expense) => {
        try {
          const d1 = new Date(expense.date);
          const d2 = new Date(day.date);
          return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
        } catch (e) {
          return false;
        }
      });
      const totalExpenses = dayExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; text-align: center; }
              .summary { margin: 20px 0; padding: 10px; background: #f5f5f5; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>Reporte Diario - ${new Date(day.date).toLocaleDateString()}</h1>
            
            <div class="summary">
              <h2>Resumen</h2>
              <p>Ventas Totales: $${totalSales.toFixed(2)}</p>
              <p>Gastos Totales: $${totalExpenses.toFixed(2)}</p>
              <p>Balance Neto: $${(totalSales - totalExpenses).toFixed(2)}</p>
            </div>

            <h2>Órdenes</h2>
            <table>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Método de Pago</th>
              </tr>
              ${dayOrders
          .map(
            (order) => `
                <tr>
                  <td>${new Date(order.time).toLocaleTimeString()}</td>
                  <td>${order.clientName || 'N/A'}</td>
                  <td>${order.type} - ${order.name}</td>
                  <td>$${order.price.toFixed(2)}</td>
                  <td>${order.paymentMethod || 'No especificado'}</td>
                </tr>
              `
          )
          .join('')}
            </table>

            <h2>Gastos</h2>
            <table>
              <tr>
                <th>Hora</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
              ${dayExpenses
          .map(
            (expense) => `
                <tr>
                  <td>${new Date(expense.date).toLocaleTimeString()}</td>
                  <td>${expense.description}</td>
                  <td>$${expense.amount.toFixed(2)}</td>
                </tr>
              `
          )
          .join('')}
            </table>
          </body>
        </html>
      `;

      if (!Print || !Print.printToFileAsync) {
        Alert.alert('Error', 'Funcionalidad de impresión no disponible');
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      if (!FileSystem || !FileSystem.copyAsync) {
        Alert.alert(
          'PDF Generado',
          'El PDF se generó correctamente. Función de compartir disponible en build local.'
        );
        return;
      }

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        const fileName = `reporte_${new Date(day.date)
          .toLocaleDateString()
          .replace(/\//g, '-')}.pdf`;
        const shareableUri = FileSystem.documentDirectory + fileName;
        await FileSystem.copyAsync({
          from: uri,
          to: shareableUri,
        });
        await Sharing.shareAsync(shareableUri);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert(
        'Error',
        'Hubo un error al generar el reporte. Por favor intenta de nuevo.'
      );
    }
  };

  const toggleTheme = async () => {
    try {
      const newDarkMode = !isDarkMode;
      setIsDarkMode(newDarkMode);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  const toggle3x2 = () => setIs3x2Active(!is3x2Active);

  const addToCurrentOrder = (item) => {
    setCurrentOrder((prevOrder) => {
      const newOrder = [
        ...prevOrder,
        {
          ...item,
          time: new Date().toLocaleString(),
          isPromotional: false,
        },
      ];

      if (is3x2Active && item.type === 'Sushi') {
        const sushiItems = newOrder.filter((i) => i.type === 'Sushi');
        if (sushiItems.length % 3 === 0) {
          const lastSushiIndex = newOrder.length - 1;
          newOrder[lastSushiIndex] = {
            ...newOrder[lastSushiIndex],
            originalPrice: newOrder[lastSushiIndex].price,
            price: 0,
            isPromotional: true,
          };
        }
      }

      return newOrder;
    });
  };

  const handleCreateNewClient = async (clientData) => {
    // Si clientData ya viene como objeto (desde el modal)
    if (typeof clientData === 'object' && clientData.id) {
      setClients((prev) => [...prev, clientData]);
      finalizeOrder(clientData);
      return;
    }

    // Si viene solo el nombre
    const newClient = {
      id: Date.now(),
      name: clientData,
      discount: 0
    };

    try {
      await supabase.from('clientes').insert(newClient);
      setClients((prevClients) => [...prevClients, newClient]);
      finalizeOrder(newClient);
    } catch (error) {
      console.error('Error creating client in Supabase:', error);
      // Fallback local
      setClients((prevClients) => [...prevClients, newClient]);
      finalizeOrder(newClient);
    }
  };

  const handleSelectClient = (client) => {
    finalizeOrder(client);
  };

  const finalizeOrder = async (client) => {
    const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

    const orderWithClientInfo = currentOrder.map(({ image, clientId, clientName, paymentMethod: pMethod, cashReceived, change: pChange, isPromotional, ispromotional, originalPrice, originalprice, ...item }) => ({
      ...item,
      clientid: client.id,
      clientname: client.name,
      time: new Date().toISOString(),
      paymentmethod: paymentMethod,
      ordertype: orderType,
      note: customOrderNote, // Nuevo campo
      cashreceived: paymentMethod === 'efectivo' ? parseFloat(cashAmount) : null,
      change: paymentMethod === 'efectivo' ? change : null,
      ispromotional: isPromotional || ispromotional || false,
      originalprice: originalPrice || originalprice || null,
    }));

    // Guardar en Supabase
    try {
      const { error } = await supabase
        .from('pedidos')
        .insert(orderWithClientInfo);

      if (error) {
        console.error('Error saving to Supabase:', error.message);
        Alert.alert('Aviso', 'No se pudo sincronizar el pedido con la nube, pero se guardó localmente.');
      }
    } catch (err) {
      console.error('Supabase unexpected error:', err);
    }

    const updatedHistory = [...history, ...orderWithClientInfo];
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    setCurrentOrder([]);
    setClientSelectionVisible(false);
    setPaymentMethod(null);
    setCashAmount('');
    setChange(0);
  };

  const confirmOrder = () => {
    if (currentOrder.length > 0) {
      setConfirmationModalVisible(false);
      setPaymentModalVisible(true);
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);

    const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

    if (method === 'efectivo') {
      setCashAmount('');
      setChange(0);
    } else {
      setPaymentModalVisible(false);
      setTimeout(() => {
        setOrderTypeModalVisible(true);
      }, 300);
    }
  };

  const calculateChange = (amount) => {
    const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
    const changeAmount = parseFloat(amount) - total;
    setChange(changeAmount >= 0 ? changeAmount : 0);
  };

  const confirmCashPayment = () => {
    const total = currentOrder.reduce((sum, item) => sum + item.price, 0);

    if (!cashAmount || parseFloat(cashAmount) < total) {
      Alert.alert('Error', 'El monto recibido debe ser mayor o igual al total');
      return;
    }

    setPaymentModalVisible(false);
    setTimeout(() => {
      setOrderTypeModalVisible(true);
    }, 300);
  };

  const cancelOrder = () => {
    setCurrentOrder([]);
    setConfirmationModalVisible(false);
    setPaymentModalVisible(false);
    setPaymentMethod(null);
    setCashAmount('');
    setChange(0);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#fff' }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen
          name="MainTabs"
          options={({ navigation }) => ({
            headerShown: true,
            headerStyle: {
              backgroundColor: 'red',
            },
            headerTintColor: '#fff',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('Registro', { currentInfo: registroInfo })
                }
                style={{ marginLeft: 15 }}>
                <Image
                  source={{ uri: 'https://res.cloudinary.com/drr6gpcyy/image/upload/q_auto/f_auto/v1779000563/LOGO_zek7to.jpg' }}
                  style={{
                    width: 40,
                    height: 40,
                    resizeMode: 'contain',
                    borderRadius: 20,
                  }}
                />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={toggle3x2} style={{ marginRight: 15 }}>
                  <View
                    style={[
                      styles.promoButton,
                      is3x2Active && styles.promoButtonActive,
                    ]}>
                    <Text style={styles.promoButtonText}>3x2</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ExpenseScreen')}
                  style={{ marginRight: 15 }}>
                  <View style={styles.expenseButton}>
                    <Text style={styles.promoButtonText}>Egresos</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PrinterScreen')}
                  style={{ marginRight: 15 }}>
                  <Icon name="print" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={showRegistroInfo}
                  style={{ marginRight: 15 }}>
                  <Icon name="information-circle" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={{ marginRight: 15 }}>
                  <Icon
                    name={isDarkMode ? 'moon' : 'sunny'}
                    size={30}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            ),
            headerTitle: () => null,
          })}>
          {(props) => (
            <TabNavigator
              {...props}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
              is3x2Active={is3x2Active}
              toggle3x2={toggle3x2}
              history={history}
              setHistory={setHistory}
              currentOrder={currentOrder}
              addToCurrentOrder={addToCurrentOrder}
              registroInfo={registroInfo}
              setConfirmationModalVisible={setConfirmationModalVisible}
              expenses={expenses}
              handleResetExpenses={handleResetExpenses}
              handleAddExpense={handleAddExpense}
              handleUpdateExpenses={handleUpdateExpenses}
              navigation={navigation}
              loadHistory={loadHistory}
              lastClosedTimestamp={lastClosedTimestamp}
              setLastClosedTimestamp={setLastClosedTimestamp}
              savedDays={savedDays}
              setSavedDays={setSavedDays}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Registro">
          {(props) => (
            <RegistroScreen
              {...props}
              setRegistroInfo={setRegistroInfo}
              isDarkMode={isDarkMode}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="PrinterScreen" component={PrinterScreen} options={{ title: 'Impresora' }} />
        <Stack.Screen
          name="ExpenseScreen"
          options={{
            title: 'Gestión de Egresos',
            headerShown: true,
            headerStyle: {
              backgroundColor: 'red',
            },
            headerTintColor: '#fff',
          }}>
          {(props) => (
            <ExpenseScreen
              isDarkMode={isDarkMode}
              expenses={expenses}
              onUpdateExpenses={setExpenses}
              navigation={navigation}
              lastClosedTimestamp={lastClosedTimestamp}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>

      {/* Modal de Confirmación de Pedido */}
      <Modal
        visible={confirmationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setConfirmationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              isDarkMode && styles.darkModalContent,
            ]}>
            <Text
              style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
              Confirmar Pedido
            </Text>
            <ScrollView style={styles.orderList}>
              {currentOrder.map((item, index) => (
                <View key={index} style={styles.orderListItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.orderItemName, isDarkMode && styles.darkModalTitle]}>
                      {(item.type === 'Extra' || item.type === 'Extra Personalizado') ? item.name : `${item.type} - ${item.name}`}
                    </Text>
                    <Text style={[styles.orderItemDetails, isDarkMode && styles.darkModalDescription]}>
                      {(item.type === 'Extra' || item.type === 'Extra Personalizado') ? '' : item.type}
                    </Text>
                    {item.details ? (
                      <Text style={[styles.orderItemDetails, isDarkMode && styles.darkModalDescription]}>
                        ({item.details})
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.orderItemPrice, isDarkMode && styles.darkModalDescription]}>
                    {item.isPromotional ? '3x2' : `$${parseFloat(item.price).toFixed(2)}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Text
              style={[styles.totalText, isDarkMode && styles.darkModalTitle]}>
              Total: ${currentOrder.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmOrder}>
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelOrder}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Método de Pago */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>

            <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
              Método de Pago
            </Text>

            <Text style={[styles.totalText, isDarkMode && styles.darkModalTitle]}>
              Total: ${currentOrder.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
            </Text>

            {!paymentMethod ? (
              <View style={styles.paymentMethodContainer}>
                <TouchableOpacity
                  style={styles.paymentMethodButton}
                  onPress={() => handlePaymentMethodSelect('efectivo')}>
                  <SvgXml xml={MONEY_ICON} width="40" height="40" />
                  <Text style={styles.paymentMethodText}>Efectivo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.paymentMethodButton}
                  onPress={() => handlePaymentMethodSelect('tarjeta')}>
                  <SvgXml xml={CARD_ICON} width="40" height="40" />
                  <Text style={styles.paymentMethodText}>Tarjeta</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.paymentMethodButton}
                  onPress={() => handlePaymentMethodSelect('pendiente')}>
                  <SvgXml xml={TIME_ICON} width="40" height="40" />
                  <Text style={styles.paymentMethodText}>Aún no cobrado</Text>
                </TouchableOpacity>
              </View>
            ) : paymentMethod === 'efectivo' ? (
              <View style={styles.cashPaymentContainer}>
                <Text style={[styles.cashPaymentLabel, isDarkMode && styles.darkModalDescription]}>
                  Monto recibido:
                </Text>
                <TextInput
                  style={[styles.cashInput, isDarkMode && styles.darkCashInput]}
                  placeholder="Ingresa el monto"
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  keyboardType="numeric"
                  value={cashAmount}
                  onChangeText={(text) => {
                    setCashAmount(text);
                    calculateChange(text);
                  }}
                />
                {change > 0 && (
                  <Text style={[styles.changeText, isDarkMode && styles.darkModalDescription]}>
                    Cambio: ${change.toFixed(2)}
                  </Text>
                )}
                <View style={styles.cashButtonContainer}>
                  <TouchableOpacity
                    style={styles.confirmCashButton}
                    onPress={confirmCashPayment}>
                    <Text style={styles.buttonText}>Confirmar Pago</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setPaymentMethod(null)}>
                    <Text style={styles.buttonText}>Atrás</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setPaymentModalVisible(false);
                setPaymentMethod(null);
                setCashAmount('');
                setChange(0);
              }}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>




      {/* Modal de Tipo de Pedido */}
      <Modal
        visible={orderTypeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setOrderTypeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
              Tipo de Pedido
            </Text>

            <View style={styles.orderTypeContainer}>
              <TouchableOpacity
                style={[styles.orderTypeButton, orderType === 'Comer aquí' && styles.orderTypeButtonActive]}
                onPress={() => {
                  setOrderType('Comer aquí');
                  setOrderTypeModalVisible(false);
                  setTimeout(() => setClientSelectionVisible(true), 300);
                }}>
                <Icon name="restaurant" size={30} color="#fff" />
                <Text style={styles.orderTypeButtonText}>Comer aquí</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.orderTypeButton, orderType === 'Para llevar' && styles.orderTypeButtonActive]}
                onPress={() => {
                  setOrderType('Para llevar');
                  setOrderTypeModalVisible(false);
                  setTimeout(() => setClientSelectionVisible(true), 300);
                }}>
                <Icon name="bag-handle" size={30} color="#fff" />
                <Text style={styles.orderTypeButtonText}>Para llevar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.orderTypeButton, orderType === 'A domicilio' && styles.orderTypeButtonActive]}
                onPress={() => {
                  setOrderType('A domicilio');
                  setOrderTypeModalVisible(false);
                  setTimeout(() => setClientSelectionVisible(true), 300);
                }}>
                <Icon name="bicycle" size={30} color="#fff" />
                <Text style={styles.orderTypeButtonText}>A domicilio</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.cashInput, isDarkMode && styles.darkCashInput, { marginTop: 20 }]}
              placeholder="Nota personalizada (ej: Sin Aguacate, extra salsa)"
              placeholderTextColor={isDarkMode ? '#888' : '#999'}
              value={customOrderNote}
              onChangeText={setCustomOrderNote}
            />

            <TouchableOpacity
              style={[styles.cancelButton, { width: '100%', marginTop: 20, backgroundColor: '#ff1c02ff' }]}
              onPress={() => setOrderTypeModalVisible(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ClientSelectionModal
        visible={clientSelectionVisible}
        onClose={() => {
          setClientSelectionVisible(false);
          setConfirmationModalVisible(false);
          setPaymentModalVisible(false);
        }}
        onSelectClient={handleSelectClient}
        onCreateNewClient={handleCreateNewClient}
        isDarkMode={isDarkMode}
        existingClients={clients}
        lastClosedTimestamp={lastClosedTimestamp}
      />

      <SavedDaysModal
        visible={savedDaysModalVisible}
        onClose={() => setSavedDaysModalVisible(false)}
        savedDays={savedDays}
        isDarkMode={isDarkMode}
        onExportDay={handleExportDayReport}
      />

      {/* Modal de Asistente IA */}
      <Modal
        visible={aiModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setAiModalVisible(false);
          setAiInput('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.darkModalContent, { width: '95%', maxWidth: 500 }]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>Asistente Inteligente</Text>
            <Text style={[styles.modalDescription, isDarkMode && styles.darkModalDescription]}>
              Escribe o dicta tu pedido (ej: "2 sushis vaqueros y un agua de jamaica")
            </Text>

            <TextInput
              style={[styles.cashInput, isDarkMode && styles.darkCashInput, { height: 100, textAlignVertical: 'top' }]}
              placeholder="¿Qué te gustaría ordenar?"
              multiline={true}
              placeholderTextColor="#999"
              value={aiInput}
              onChangeText={setAiInput}
            />

            <View style={{ flexDirection: 'row', gap: 15, marginTop: 25 }}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: '#ff1c02ff', flex: 1 }]}
                onPress={() => processAIOrder(aiInput)}
                disabled={isAiProcessing || !aiInput.trim()}
              >
                <Text style={styles.buttonText}>{isAiProcessing ? 'Procesando...' : 'Procesar Pedido'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: isRecording ? '#c01802' : '#ff1c02ff', width: 60, paddingHorizontal: 0 }
                ]}
                onPressIn={startRecording}
                onPressOut={stopRecording}
              >
                <Icon name={isRecording ? 'stop' : 'mic'} size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.cancelButton, { width: '100%', marginTop: 15, backgroundColor: '#ff1c02ff' }]}
              onPress={() => {
                setAiModalVisible(false);
                setAiInput('');
              }}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Botón Flotante IA */}
      <TouchableOpacity
        style={styles.aiFloatingButton}
        onPress={() => setAiModalVisible(true)}
      >
        <Icon name="hardware-chip" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MainApp />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  promoButton: {
    backgroundColor: '#ddd',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
  },
  promoButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
  },
  promoButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  expenseButton: {
    backgroundColor: '#ddd',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 30,
    borderRadius: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    maxWidth: 500,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  darkModalTitle: {
    color: '#ffffff',
  },
  modalDescription: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555',
  },
  darkModalDescription: {
    color: '#cccccc',
  },
  orderList: {
    maxHeight: 400,
    width: '100%',
    paddingHorizontal: 5,
  },
  orderListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  orderItemDetails: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  orderItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 15,
  },
  confirmButton: {
    backgroundColor: '#ff1c02ff',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  orderButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 200 : 180, // Bajado como se solicitó
    right: 20,
    backgroundColor: '#ff1900ff', // Rojo como se solicitó
    paddingVertical: 15, // Más altura
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 8,
    zIndex: 9999,
  },
  aiFloatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 120 : 100, // Bajado como se solicitó
    right: 20,
    backgroundColor: '#2196F3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    zIndex: 9998,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  darkFloatingButton: {
    backgroundColor: '#333',
  },
  floatingButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  paymentMethodButton: {
    backgroundColor: '#ff1c02ff', // Rojo solicitado
    padding: 10,
    borderRadius: 0, // Cuadrados (sin redondeo)
    width: '31%', // Tres en una fila
    aspectRatio: 1, // Forma cuadrada
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11, // Tamaño reducido para que quepa en el cuadrado
    textAlign: 'center',
    marginTop: 5,
  },
  cashPaymentContainer: {
    width: '100%',
    marginVertical: 15,
  },
  cashPaymentLabel: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  cashInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    width: '100%',
  },
  darkCashInput: {
    backgroundColor: '#444',
    borderColor: '#666',
    color: 'white',
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: 'green',
  },
  cashButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmCashButton: {
    backgroundColor: '#ff1c02ff',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#ff1c02ff',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  orderTypeContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginTop: 20,
  },
  orderTypeButton: {
    backgroundColor: '#ff1c02ff',
    padding: 20,
    borderRadius: 15,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  orderTypeButtonActive: {
    backgroundColor: '#ff1e00ff', // Rojo más oscuro para el activo
  },
  orderTypeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});