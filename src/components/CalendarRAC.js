import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const dayNames = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

const CalendarRAC = ({ visible, onClose, selectedDate, onSelectDate, isDarkMode }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));
  const now = new Date();

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const [slideAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(1));

  const changeMonth = (offset) => {
    // Animación de salida
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: offset > 0 ? -20 : 20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Cambiar mes
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
      
      // Resetear posición para entrada
      slideAnim.setValue(offset > 0 ? 20 : -20);
      
      // Animación de entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const renderGrid = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    // Header de días
    dayNames.forEach(d => days.push(
      <View key={`h-${d}`} style={styles.gridHeaderCell}>
        <Text style={styles.gridHeaderText}>{d}</Text>
      </View>
    ));

    // Espacios iniciales
    for (let i = 0; i < startDay; i++) {
      days.push(<View key={`e-${i}`} style={styles.gridCell} />);
    }

    // Días
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const isSelected = selectedDate && 
        new Date(selectedDate).getDate() === i && 
        new Date(selectedDate).getMonth() === month && 
        new Date(selectedDate).getFullYear() === year;
      
      const isToday = now.getDate() === i && 
                      now.getMonth() === month && 
                      now.getFullYear() === year;

      days.push(
        <TouchableOpacity
          key={`d-${i}`}
          style={[
            styles.gridCell,
            isSelected && styles.cellSelected,
          ]}
          onPress={() => onSelectDate(date)}
        >
          <Text style={[
            styles.cellText,
            isDarkMode && styles.darkText,
            isSelected && styles.cellTextSelected
          ]}>
            {i}
          </Text>
          {isToday && !isSelected && <View style={styles.todayIndicator} />}
        </TouchableOpacity>
      );
    }
    return days;
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.container, isDarkMode && styles.darkContainer]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}>
              <MaterialCommunityIcons name="chevron-left" size={20} color={isDarkMode ? '#999' : '#666'} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, isDarkMode && styles.darkText]}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}>
              <MaterialCommunityIcons name="chevron-right" size={20} color={isDarkMode ? '#999' : '#666'} />
            </TouchableOpacity>
          </View>

          <Animated.View style={[
            styles.grid, 
            { 
              transform: [{ translateX: slideAnim }],
              opacity: opacityAnim 
            }
          ]}>
            {renderGrid()}
          </Animated.View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Listo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  darkContainer: {
    backgroundColor: '#09090b',
    borderColor: '#27272a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  navButton: {
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#09090b',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridHeaderCell: {
    width: '14.28%',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridHeaderText: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '500',
  },
  gridCell: {
    width: '14.28%',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  cellText: {
    fontSize: 14,
    color: '#09090b',
  },
  darkText: { color: '#fafafa' },
  cellSelected: {
    backgroundColor: '#ff1c02ff',
  },
  cellTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#ff1c02ff',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  closeButtonText: {
    color: '#ff1c02ff',
    fontWeight: '600',
    fontSize: 14,
  }
});

export default CalendarRAC;
