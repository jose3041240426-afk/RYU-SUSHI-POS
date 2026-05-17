import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';

const AnimatedChipTabs = ({ tabs, selectedTab, onTabPress, isDarkMode }) => {
  const pillX = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const itemLayouts = useRef({}).current;
  const [isReady, setIsReady] = useState(false);
  const [layoutsReady, setLayoutsReady] = useState(false);

  useEffect(() => {
    if (!layoutsReady) return;

    const index = tabs.indexOf(selectedTab);
    const layout = itemLayouts[index];

    if (layout) {
      if (!isReady) {
        // Primera vez que se posiciona: sin animación de movimiento, solo fade in
        pillX.setValue(layout.x);
        pillWidth.setValue(layout.width);
        setIsReady(true);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false, // width no soporta native driver
        }).start();
      } else {
        // Cambios posteriores: animación suave de X y Width
        Animated.parallel([
          Animated.spring(pillX, {
            toValue: layout.x,
            useNativeDriver: false,
            friction: 8,
            tension: 50,
          }),
          Animated.spring(pillWidth, {
            toValue: layout.width,
            useNativeDriver: false,
            friction: 8,
            tension: 50,
          }),
        ]).start();
      }
    }
  }, [selectedTab, layoutsReady]);

  const handleLayout = (index, x, width) => {
    itemLayouts[index] = { x, width };
    if (Object.keys(itemLayouts).length === tabs.length && !layoutsReady) {
      setLayoutsReady(true);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <Animated.View 
          style={[
            styles.pill, 
            { 
              left: pillX,
              width: pillWidth,
              opacity: opacity,
            }
          ]} 
        />
        
        {tabs.map((tab, index) => {
          const isSelected = selectedTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabPress(tab)}
              onLayout={(e) => handleLayout(index, e.nativeEvent.layout.x, e.nativeEvent.layout.width)}
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              <Text style={[
                styles.tabText, 
                isSelected ? styles.selectedTabText : styles.unselectedTabText
              ]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    marginVertical: 10,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#ff1c02ff',
    borderRadius: 25,
    padding: 4,
    minWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  darkContainer: {
    backgroundColor: '#b31201',
  },
  pill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  unselectedTabText: {
    color: '#fff',
  },
  selectedTabText: {
    color: '#ff1c02ff',
  },
});

export default AnimatedChipTabs;
