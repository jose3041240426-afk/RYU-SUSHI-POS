# Documentación del Proyecto: Ryu Sushi POS (v22-alter43)

Este documento proporciona una visión técnica y funcional completa del sistema de Punto de Venta (POS) diseñado específicamente para el restaurante **Ryu Sushi**.

## 1. Descripción General
**Ryu Sushi POS** es una aplicación móvil y web multiplataforma construida con **React Native** y **Expo**. Está diseñada para optimizar la toma de pedidos, la gestión de inventarios, el seguimiento de gastos y la sincronización en tiempo real de las ventas mediante una base de datos en la nube.

---

## 2. Arquitectura del Sistema

### Stack Tecnológico
- **Frontend:** React Native (Expo SDK 54).
- **Base de Datos y Backend:** Supabase (PostgreSQL) con capacidades de sincronización en tiempo real.
- **Inteligencia Artificial:**
  - **Procesamiento de Lenguaje Natural (NLP):** Groq API (Llama 3.3 70B) para clasificación de pedidos.
  - **Trascripción de Voz:** Groq API (Whisper-large-v3).
- **Navegación:** React Navigation (Material Top Tabs & Stack Navigator).
- **Estado Local:** React Hooks (`useState`, `useEffect`, `useContext`) y `AsyncStorage` para persistencia local.
- **Impresión y Reportes:** `expo-print`, `jspdf`, `react-native-thermal-printer`.

### Estructura de Directorios
```text
/
├── App.js                # Punto de entrada y lógica central (Navegación, Pedidos, IA)
├── app.json              # Configuración de Expo
├── package.json          # Dependencias y scripts
├── src/
│   ├── components/       # Componentes UI reutilizables
│   │   ├── ui/           # Componentes de diseño (ModernTabBar, etc.)
│   │   └── CalculatorModal.js
│   ├── screens/          # Pantallas principales de la aplicación
│   │   ├── SushiScreen.js
│   │   ├── AlitasScreen.js
│   │   ├── BebidasScreen.js
│   │   ├── PostresScreen.js (Extras)
│   │   ├── HistorialScreen.js
│   │   ├── InventarioScreen.js
│   │   ├── ExpenseScreen.js
│   │   └── ...
│   ├── services/         # Servicios externos
│   │   ├── supabase.js   # Cliente de Supabase
│   │   └── impresion/    # Lógica de impresión térmica y PDF
│   ├── utils/            # Funciones auxiliares y formateadores
│   └── hooks/            # Hooks personalizados
└── assets/               # Imágenes, fuentes y recursos estáticos
```

---

## 3. Funcionalidades Principales

### 3.1. Gestión de Pedidos (Toma de Orden)
El sistema permite agregar productos de tres formas:
1.  **Manual:** Navegación por pestañas (Sushi, Alitas, Bebidas, Extras) y selección táctil.
2.  **Dictado por Voz:** Integración con Whisper para transcribir la voz del mesero.
3.  **Comando de Texto AI:** Un procesador basado en Llama 3.3 interpreta frases como *"2 rollos mar y tierra y un combo 3"* y los convierte automáticamente en ítems del pedido.

**Características de Pedidos:**
- Soporte para promociones automáticas (ej. 3x2 en sushi).
- Personalización de productos (preparaciones, sabores, extras).
- Asignación de clientes a los pedidos.

### 3.2. Historial y Cierre de Caja
- **Visualización:** Registro detallado de todas las ventas realizadas.
- **Sincronización:** Cada pedido se guarda en Supabase y se actualiza en todos los dispositivos conectados en tiempo real.
- **Cierre de Día:** Función para finalizar la jornada, calcular el total de caja y guardar el registro histórico de cierres.
- **Limpieza de Sesión:** Al cerrar el día, se pueden limpiar los clientes temporales.

### 3.3. Gastos
- **Gastos:** Registro de salidas de dinero (pagos a proveedores, servicios, etc.) para un balance neto preciso.

### 3.4. Generación de Reportes y Tickets
El sistema cuenta con un robusto motor de generación de documentos ubicado en `src/utils/pdfGenerator.js`.

#### Tipos de Documentos:
1.  **Reporte Detallado de Ventas (PDF):**
    *   Genera un resumen completo del turno o día.
    *   Incluye: Información del negocio, resumen de ventas (total clientes, promociones, ventas totales), desglose por categorías (Sushi, Alitas, Boneless, etc.), y una tabla detallada de **Egresos**.
    *   Calcula automáticamente el **Balance Neto** (Ventas - Gastos).

2.  **Ticket de Venta (Imagen/PDF/Impresión):**
    *   Diseñado para el cliente final.
    *   Incluye el logo de Ryu Sushi, fecha, nombre del cliente, lista de productos con precios, descuentos aplicados (ahorro total), método de pago (efectivo/tarjeta) y cambio entregado.
    *   Añade notas especiales del pedido y datos de contacto para servicio a domicilio.

#### Funciones de Gestión Avanzada:
- **Vistas según el Día (Archivo Histórico):**
  *   Permite navegar por cierres de caja anteriores.
  *   Al seleccionar un día guardado, la vista de historial se filtra automáticamente para mostrar solo los pedidos y egresos de esa fecha específica.
  *   Facilita la auditoría de ventas pasadas sin mezclar los datos con el turno actual.

- **Sistema de Egresos (Gastos):**
  *   Módulo dedicado para registrar salidas de efectivo.
  *   Cada egreso incluye descripción, monto y hora.
  *   Los egresos se restan automáticamente del total de ventas en los reportes diarios para dar el balance real en caja.

- **Información Personalizable del Negocio:**
  *   A través de la pantalla de **Registro de Turno**, el usuario puede configurar la sucursal (Matriz/Sucursal), el nombre del trabajador, la dirección y el teléfono.
  *   Esta información se inyecta dinámicamente en los encabezados de los tickets de venta y los reportes PDF.

- **Botón de Promoción Inteligente (3x2):**
  *   Ubicado en la barra superior para fácil acceso.
  *   Al activarse, el sistema aplica automáticamente la promoción **3x2 en Sushi**.
  *   Lógica: Por cada 3 sushis agregados al carrito, el de menor precio (o el tercero) se marca como "Promocional" con costo $0.00, manteniendo el registro del precio original para estadísticas de ahorro del cliente.

- **Calculadora Flotante Integrada:**
  *   Disponible mediante un modal táctil para realizar cálculos rápidos de cuentas compartidas o cambios complejos sin salir de la toma de pedido.

---

## 4. Configuración y Servicios

### Supabase (Base de Datos en la Nube)
La aplicación utiliza Supabase como backend principal para garantizar que los datos estén sincronizados entre múltiples dispositivos (móviles y web).

#### Tablas Principales y Esquema:

1.  **`pedidos`**: Registra cada producto vendido de forma individual.
    *   `id`: Identificador único (autoincremental).
    *   `clientid`: ID del cliente asociado al pedido (vincula varios productos a una sola orden).
    *   `clientname`: Nombre del cliente (ej. "Cliente 14").
    *   `name`: Nombre del producto (ej. "Vaquero (Empanizado)").
    *   `price`: Precio del producto en ese momento.
    *   `type`: Categoría (Sushi, Alitas, Bebida, Combo, etc.).
    *   `details`: Detalles adicionales (preparación, sabores, notas).
    *   `time`: Timestamp de la venta (ISO string).
    *   `isdidifood`: Booleano para identificar pedidos de plataforma externa.

2.  **`clientes`**: Gestión de la cola de clientes activa.
    *   `id`: ID único.
    *   `name`: Nombre asignado al cliente.
    *   `status`: Estado del pedido (pendiente, pagado).

3.  **`cierres`**: Histórico de balances diarios.

#### Lógica de Sincronización y Realtime:
- **Sincronización Multidispositivo:** Gracias a la arquitectura orientada a eventos de Supabase, el sistema permite que varios meseros o administradores usen la app simultáneamente. Si se registra un pedido en una tablet, este aparecerá en segundos en el historial de todos los demás dispositivos conectados.
- **Suscripciones Activas**: La app se suscribe a los cambios de las tablas `pedidos`, `clientes` y `extras` usando `supabase.channel()`.
- **Persistencia Híbrida**: Se utiliza `AsyncStorage` (o `localStorage` en web) para cachear los datos. Esto garantiza que la app inicie instantáneamente con los últimos datos conocidos y se actualice en segundo plano al detectar conexión.

#### Configuración:
El archivo de conexión se encuentra en `src/services/supabase.js`. Contiene la `supabaseUrl` y la `supabaseAnonKey` necesarias para la comunicación con la API REST y los WebSockets de Supabase.

### IA (Groq Cloud)
- **API Key:** Configurada en `App.js` (Nota: Actualmente integrada directamente en el código para facilitar el desarrollo).
- **Modelo de Procesamiento:** Utiliza `Llama 3.3 70B` para la interpretación de pedidos y `Whisper-large-v3` para la transcripción de audio.
- **Dictado por Voz:** El botón de micrófono captura el audio, lo envía a Groq para transcripción y el texto resultante es procesado por la lógica de IA para añadir productos al carrito automáticamente.
- **Prompt System:** El sistema incluye un "System Message" que contiene todo el catálogo de productos y precios, permitiendo que la IA corrija errores ortográficos o variaciones en los nombres de los platos (ej: "un vaquero frito" -> "Vaquero (Empanizado)").

---

## 5. Guía de Uso Rápido

1.  **Inicio:** Al abrir la app, se muestra el `SplashScreen`.
2.  **Registro de Turno:** El usuario ingresa la cantidad inicial en caja y su nombre.
3.  **Venta:**
    - Seleccionar productos manualmente o usar el botón flotante de IA.
    - Presionar "Confirmar Pedido".
    - Seleccionar cliente y método de pago.
4.  **Historial:** Revisar ventas, editar pedidos o imprimir tickets.
5.  **Cierre:** Al final del día, ir a Historial -> Cierre de Día.

---

## 6. Consideraciones Técnicas y Mantenimiento

- **Modo Oscuro Persistente:** La aplicación implementa un sistema de temas dinámico (`isDarkMode`). La preferencia del usuario se guarda localmente, de modo que al cerrar y abrir la app, el tema (claro u oscuro) se mantiene según la última elección.
- **Interfaz Premium:** El diseño utiliza una estética bento-style en color rojo corporativo, optimizada para reducir la fatiga visual en entornos de poca luz (restaurantes).
- **Responsive:** Adaptada para funcionar perfectamente en tablets (iPad/Android) y navegadores web, aprovechando el espacio en pantallas grandes para mostrar el catálogo y el carrito simultáneamente.

---
*Documentación generada por Antigravity AI - Mayo 2026*
