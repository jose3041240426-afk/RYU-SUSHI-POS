import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import ThermalPrinterModule from 'react-native-thermal-printer';
import { generateTicketHTML, calculateOrderTotals } from '../utils/pdfGenerator';

const useBluetoothPrinter = () => {
  const [printerConnected, setPrinterConnected] = useState(false);
  const [availablePrinters, setAvailablePrinters] = useState([]);

  const scanForPrinters = async () => {
    try {
      const devices = await ThermalPrinterModule.searchPrinters();
      setAvailablePrinters(devices);
      return devices;
    } catch (error) {
      console.error('Error scanning for printers:', error);
      Alert.alert(
        "Error",
        "No se pudieron encontrar impresoras Bluetooth. Verifica que el Bluetooth esté activado."
      );
      return [];
    }
  };

  const connectToPrinter = async (address) => {
    try {
      await ThermalPrinterModule.connectPrinter(address);
      setPrinterConnected(true);
      return true;
    } catch (error) {
      console.error('Error connecting to printer:', error);
      Alert.alert(
        "Error",
        "No se pudo conectar a la impresora. Intenta nuevamente."
      );
      return false;
    }
  };

  const printTicket = async (orderData, registro) => {
    if (Platform.OS === 'web') {
      const html = generateTicketHTML(orderData, registro);
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    // Lógica para detectar impresora o simular
    if (!printerConnected) {
      // Intentar escanear
      let devices = [];
      try {
        devices = await scanForPrinters();
      } catch (e) {
        console.log("Scanner failed or not available, defaulting to empty");
      }

      if (devices.length > 0) {
        const connected = await connectToPrinter(devices[0].address);
        if (!connected) return;
      } else {
        // MODO SIMULACIÓN / DEBUG
        // Si no se encuentra impresora, simulamos el proceso para que el usuario verifique
        // que la lógica de "imprimir" se ejecuta correctamente.
        Alert.alert(
          "Modo Simulación",
          "No se detectó ninguna impresora Bluetooth. Se simulará la impresión en consola.",
          [
            {
              text: "OK",
              onPress: () => console.log("Simulando impresión... Continuando con generación de comandos.")
            }
          ]
        );
        // NO retornamos aquí, dejamos que continúe para generar los comandos y mostrarlos
        // return; 
      }
    }

    try {
      const printCommands = [
        { appendAlignment: 'center' },
        { appendFontSize: 2 },
        { append: 'RYU SUSHI\n\n' },
        { appendFontSize: 1 },
        { append: 'Tel: 6181268154\n' },
        { append: `Fecha: ${new Date().toLocaleString()}\n` },
        { append: `Cliente: ${orderData.clientNumber}\n\n` },
        { append: '--------------------------------\n' },

        // Items del pedido
        ...orderData.items.flatMap(item => [
          { appendAlignment: 'left' },
          { append: `${item.name} ${item.option || ''}\n` },
          { appendAlignment: 'right' },
          { append: `${item.isPromotional ? 'PROMO 3x2' : `$${item.price}`}\n\n` }
        ]),

        { append: '--------------------------------\n' },

        // Totales
        { appendAlignment: 'right' }
      ];

      // Calcular totales
      const orderTotals = calculateOrderTotals(orderData.items);
      const discountItems = orderData.items.filter(item => item.isPromotional);
      const discountTotal = discountItems.reduce((sum, item) => sum + (item.originalPrice || 0), 0);

      printCommands.push(
        { append: `Subtotal: $${orderTotals.total + discountTotal}\n` }
      );

      if (discountTotal > 0) {
        printCommands.push(
          { append: `Descuento: $${discountTotal}\n` }
        );
      }

      printCommands.push(
        { append: `Total: $${orderTotals.total}\n` },
        { appendAlignment: 'center' },
        { append: '\n¡Gracias por elegir Ryu Sushi!\n' },
        { append: '¡Esperamos verte pronto!\n' },
        { append: '\n\n\n' },
        { cut: true }
      );

      console.log('Comandos de impresión generados:', JSON.stringify(printCommands, null, 2));

      // Si estamos conectados, imprimimos. Si no (modo simulación), solo mostramos alerta de éxito simulado.
      if (printerConnected) {
        await ThermalPrinterModule.printBill(printCommands);
      } else {
        // Simulación
        Alert.alert(
          "Simulación Exitosa",
          `Se han generado ${printCommands.length} comandos de impresión. Revisa la consola para ver el detalle.`,
          [{ text: "OK" }]
        );
        return; // Salir para no mostrar la otra alerta de éxito real
      }

      Alert.alert(
        "Éxito",
        "Ticket impreso correctamente",
        [{ text: "OK" }]
      );

    } catch (error) {
      console.error('Error printing ticket:', error);
      Alert.alert(
        "Error",
        "No se pudo imprimir el ticket. Verifica la conexión con la impresora.",
        [{ text: "OK" }]
      );
    }
  };

  return {
    printTicket,
    scanForPrinters,
    connectToPrinter,
    printerConnected,
    availablePrinters
  };
};

export default useBluetoothPrinter;

