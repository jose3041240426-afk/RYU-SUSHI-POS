import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Premium (Ryu Sushi Red) */}
      <LinearGradient
        colors={['#ff0000', '#cc0000']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Ryu Admin</Text>
        <Text style={styles.headerSubtitle}>Consultor IA & Análisis</Text>
      </LinearGradient>

      {/* Contenido Dinámico */}
      <ScrollView style={styles.content}>
        {activeTab === 'Dashboard' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resumen del Día</Text>
            <Text style={styles.cardText}>Aquí irán las ventas de Supabase</Text>
          </View>
        )}
        
        {activeTab === 'IA' && (
          <View style={[styles.card, { borderColor: '#8E54E9', borderWidth: 2 }]}>
            <Text style={[styles.cardTitle, { color: '#8E54E9' }]}>DeepSeek AI Analyst</Text>
            <Text style={styles.cardText}>Esperando datos para dar consejos financieros...</Text>
          </View>
        )}
        
        {activeTab === 'Costos' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Inventario & Costos Operativos</Text>
            <Text style={styles.cardText}>Registra el costo de tus insumos aquí para calcular el margen de ganancia.</Text>
          </View>
        )}
      </ScrollView>

      {/* Menú Inferior de Prueba (Reemplazaremos con ModernTabBar) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Dashboard')}>
          <Text style={[styles.tabText, activeTab === 'Dashboard' && styles.tabActiveText]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('IA')}>
          <Text style={[styles.tabText, activeTab === 'IA' && styles.tabActiveText]}>Consultor IA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Costos')}>
          <Text style={[styles.tabText, activeTab === 'Costos' && styles.tabActiveText]}>Costos</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    height: Platform.OS === 'ios' ? 80 : 60,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  tabActiveText: {
    color: '#ff0000',
    fontWeight: 'bold',
  },
});
