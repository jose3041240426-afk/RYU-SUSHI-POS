import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const progressValue = useRef(new Animated.Value(0)).current;
  const sushiRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación del sushi (independiente, en loop)
    Animated.loop(
      Animated.timing(sushiRotate, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Secuencia principal de navegación
    const timer = setTimeout(() => {
      Animated.sequence([
        // 1. Aparecer logo
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        
        // 2. Pequeña pausa
        Animated.delay(200),
        
        // 3. Barra de carga
        Animated.timing(progressValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Navegar después de completar
        setTimeout(() => {
          navigation.replace('MainTabs');
        }, 300);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [navigation]);

  const sushiRotation = sushiRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Overlay gradiente */}
      <View style={styles.gradientOverlay} />
      
      {/* Logo con animación */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoShadow} />
        <Image 
          source={require('../../assets/LOGO.jpg')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Barra de carga estilo sushi */}
      <View style={styles.loadingContainer}>
        {/* Sushi girando debajo del logo */}
        <Animated.View
          style={[
            styles.sushiContainer,
            {
              transform: [{ rotate: sushiRotation }],
            },
          ]}
        >
          {/* Sushi empanizado */}
          <View style={styles.sushi}>
            {/* Capa de empanizado (panko) */}
            <View style={styles.pankoCrust}>
              {/* Textura del empanizado */}
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pankoParticle,
                    {
                      top: `${Math.random() * 80 + 10}%`,
                      left: `${Math.random() * 80 + 10}%`,
                      width: Math.random() * 3 + 2,
                      height: Math.random() * 3 + 2,
                    },
                  ]}
                />
              ))}
            </View>
            {/* Interior del sushi */}
            <View style={styles.sushiRice} />
            <View style={styles.sushiFilling} />
          </View>
        </Animated.View>

        {/* Barra de fondo (plato) */}
        <View style={styles.loadingBarBackground}>
          {/* Patrón de bambú decorativo */}
          <View style={styles.bambooPattern}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={styles.bambooLine} />
            ))}
          </View>
        </View>
        
        {/* Barra de progreso */}
        <Animated.View
          style={[
            styles.loadingBarFill,
            {
              width: progressValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          {/* Efecto de arroz */}
          <View style={styles.riceTexture} />
        </Animated.View>

        {/* Sushi girando debajo del logo */}
        <Animated.View
          style={[
            styles.sushiContainer,
            {
              transform: [{ rotate: sushiRotation }],
            },
          ]}
        >
          {/* Sushi empanizado */}
          <View style={styles.sushi}>
            {/* Capa de empanizado (panko) */}
            <View style={styles.pankoCrust}>
              {/* Textura del empanizado */}
              {[...Array(12)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pankoParticle,
                    {
                      top: `${Math.random() * 80 + 10}%`,
                      left: `${Math.random() * 80 + 10}%`,
                      width: Math.random() * 3 + 2,
                      height: Math.random() * 3 + 2,
                    },
                  ]}
                />
              ))}
            </View>
            {/* Interior del sushi */}
            <View style={styles.sushiRice} />
            <View style={styles.sushiFilling} />
          </View>
        </Animated.View>
      </View>

      {/* Elementos decorativos */}
      <View style={styles.topCornerDecor} />
      <View style={styles.bottomCornerDecor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20, 20, 20, 0.3)',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  logoShadow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF0000',
    opacity: 0.15,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: Platform.OS === 'android' ? 20 : 0,
  },
  logo: {
    width: 170,
    height: 170,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: Platform.OS === 'android' ? 15 : 0,
  },
  
  // Barra de carga estilo sushi
  loadingContainer: {
    width: '60%',
    maxWidth: 300,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loadingBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3a3a3a',
  },
  bambooPattern: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 4,
  },
  bambooLine: {
    width: 2,
    height: '60%',
    backgroundColor: '#1a1a1a',
    borderRadius: 1,
  },
  loadingBarFill: {
    position: 'absolute',
    left: 0,
    height: 12,
    backgroundColor: '#FF0000',
    borderRadius: 20,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 5 : 0,
    overflow: 'hidden',
  },
  riceTexture: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  
  // Sushi empanizado girando
  sushiContainer: {
    position: 'absolute',
    top: -60,
  },
  sushi: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pankoCrust: {
    position: 'absolute',
    width: 48,
    height: 48,
    backgroundColor: '#f4d58d',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e8c170',
    shadowColor: '#d4a254',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 8 : 0,
  },
  pankoParticle: {
    position: 'absolute',
    backgroundColor: '#fff8e7',
    borderRadius: 2,
    shadowColor: '#d4a254',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  sushiRice: {
    position: 'absolute',
    width: 32,
    height: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    opacity: 0.9,
  },
  sushiFilling: {
    position: 'absolute',
    width: 18,
    height: 18,
    backgroundColor: '#ff8c42',
    borderRadius: 9,
    shadowColor: '#ff6b1a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  
  // Decorativos
  topCornerDecor: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF0000',
    opacity: 0.05,
  },
  bottomCornerDecor: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#FF0000',
    opacity: 0.03,
  },
});

export default SplashScreen;

