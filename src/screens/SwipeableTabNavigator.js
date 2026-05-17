import React, { useRef, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SushiScreen from './SushiScreen';
import AlitasScreen from './AlitasScreen';
import BebidasScreen from './BebidasScreen';
import PostresScreen from './PostresScreen';
import HistorialScreen from './HistorialScreen';

const TopTab = createMaterialTopTabNavigator();

/**
 * Navegador con soporte de deslizamiento (swipe) entre pantallas
 * Sincronizado con el Bottom Tab Navigator para navegación dual
 */
export default function SwipeableTabNavigator({
    isDarkMode,
    setHistory,
    addToCurrentOrder,
    is3x2Active,
    history,
    onUpdateHistory,
    registro,
    expenses,
    navigation,
    handleResetExpenses,
    initialRouteName = 'SushiTab',
    onIndexChange,
}) {
    const { width } = Dimensions.get('window');

    return (
        <TopTab.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                tabBarStyle: { height: 0 }, // Ocultar barra superior (usamos la inferior)
                tabBarIndicatorStyle: { height: 0 },
                swipeEnabled: true, // Habilitar deslizamiento
                lazy: true, // Carga lazy de pantallas
                animationEnabled: true,
            }}
            screenListeners={{
                state: (e) => {
                    // Sincronizar con Bottom Tab cuando cambia el índice
                    if (onIndexChange && e.data.state) {
                        const state = e.data.state;
                        // Asegurarnos de que estamos en una ruta válida antes de notificar
                        if (state.routes && state.routes[state.index]) {
                            const currentIndex = state.index;
                            onIndexChange(currentIndex);
                        }
                    }
                },
            }}
        >
            <TopTab.Screen name="SushiTab">
                {() => (
                    <SushiScreen
                        isDarkMode={isDarkMode}
                        setHistory={setHistory}
                        addToCurrentOrder={addToCurrentOrder}
                        is3x2Active={is3x2Active}
                    />
                )}
            </TopTab.Screen>

            <TopTab.Screen name="AlitasTab">
                {() => (
                    <AlitasScreen
                        isDarkMode={isDarkMode}
                        setHistory={setHistory}
                        addToCurrentOrder={addToCurrentOrder}
                    />
                )}
            </TopTab.Screen>

            <TopTab.Screen name="BebidasTab">
                {() => (
                    <BebidasScreen
                        isDarkMode={isDarkMode}
                        setHistory={setHistory}
                        addToCurrentOrder={addToCurrentOrder}
                    />
                )}
            </TopTab.Screen>

            <TopTab.Screen name="ExtrasTab">
                {() => (
                    <PostresScreen
                        isDarkMode={isDarkMode}
                        setHistory={setHistory}
                        addToCurrentOrder={addToCurrentOrder}
                    />
                )}
            </TopTab.Screen>

            <TopTab.Screen name="HistorialTab">
                {() => (
                    <HistorialScreen
                        isDarkMode={isDarkMode}
                        history={history}
                        onUpdateHistory={onUpdateHistory}
                        registro={registro}
                        expenses={expenses}
                        navigation={navigation}
                        handleResetExpenses={handleResetExpenses}
                    />
                )}
            </TopTab.Screen>
        </TopTab.Navigator>
    );
}

