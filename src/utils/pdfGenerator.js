import { Platform, Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useRef, useState, useEffect } from 'react';

// Dynamic requires to bypass Expo Snack static analyzer
// These modules are built into Expo Go and resolve at runtime
let Print = null;
let Sharing = null;
let FileSystem = null;
let MediaLibrary = null;
try {
  const m1 = 'expo-print';
  Print = require(m1);
  const m2 = 'expo-sharing';
  Sharing = require(m2);
  const m3 = 'expo-file-system';
  FileSystem = require(m3);
  const m4 = 'expo-media-library';
  MediaLibrary = require(m4);
} catch (e) {
  // Modules not available in Snack web preview - native functions will be disabled
}

// Función para generar el contenido del reporte de ventas
export const generatePDFContent = (history, expenses, registro) => {
  const orders = groupOrdersByClient(history);
  const totalClients = Object.keys(orders).length;

  const totals = {
    sushi: 0,
    alitas: 0,
    bebidas: 0,
    boneless: 0,
    papas: 0,
    promociones: 0,
    general: 0,
  };

  Object.values(orders).forEach((orderData) => {
    orderData.items.forEach((item) => {
      const price = parseFloat(item.price) || 0;
      if (item.type === 'Sushi') totals.sushi += price;
      if (item.type === 'Alitas') totals.alitas += price;
      if (item.type === 'Bebida') totals.bebidas += price;
      if (item.type === 'Boneless') totals.boneless += price;
      if (item.type === 'Papas') totals.papas += price;
      if (item.isPromotional) totals.promociones++;
      totals.general += price;
    });
  });

  const totalEgresos = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page { size: A4; margin: 1cm; }
          body { font-family: Arial, sans-serif; padding: 15px; line-height: 1.4; max-width: 21cm; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .header h1 { font-size: 24px; color: #000; margin: 0 0 5px 0; }
          .header p { font-size: 14px; margin: 2px 0; }
          .section-title { font-size: 16px; font-weight: bold; margin-top: 15px; margin-bottom: 10px; background-color: #f5f5f5; padding: 8px; border-radius: 4px; }
          .content { font-size: 13px; margin-left: 10px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0; }
          .stat-box { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; text-align: center; }
          .stat-value { font-size: 18px; font-weight: bold; color: #cc0000; }
          .stat-label { font-size: 12px; color: #666; }
          .sales-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0; }
          .sales-item { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; }
          .sales-item-title { color: #cc0000; font-weight: bold; margin-bottom: 5px; }
          .expenses-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
          .expenses-table th, .expenses-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .expenses-table th { background-color: #f5f5f5; font-weight: bold; }
          .total-section { margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px; }
          .total-text { font-size: 14px; font-weight: bold; text-align: right; margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RYU SUSHI</h1>
          <p><strong>Reporte Detallado de Ventas</strong></p>
          <p><strong>Fecha:</strong> ${currentDate} <strong>Hora:</strong> ${currentTime}</p>
        </div>
        <div class="section-title">INFORMACIÓN DEL NEGOCIO</div>
        <div class="content">
          <p><strong>Dirección:</strong> ${registro?.direccion || 'No disponible'}</p>
          <p><strong>Teléfono:</strong> ${registro?.telefono || '6181268154'}</p>
          <p><strong>Trabajador:</strong> ${registro?.workerName || 'No disponible'}</p>
          <p><strong>Cambio en caja:</strong> $${registro?.cashInBox || '0'}</p>
        </div>
        <div class="section-title">RESUMEN DE VENTAS</div>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-value">${totalClients}</div>
            <div class="stat-label">Total Clientes</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${totals.promociones}</div>
            <div class="stat-label">Promociones</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">$${totals.general.toFixed(2)}</div>
            <div class="stat-label">Ventas Totales</div>
          </div>
        </div>
        <div class="section-title">DETALLE DE PRODUCTOS VENDIDOS</div>
        <div class="sales-summary">
          <div class="sales-item">
            <div class="sales-item-title">Sushi</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Sushi').length} unidades</p>
            <p>Total: $${totals.sushi.toFixed(2)}</p>
          </div>
          <div class="sales-item">
            <div class="sales-item-title">Alitas</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Alitas').length} unidades</p>
            <p>Total: $${totals.alitas.toFixed(2)}</p>
          </div>
          <div class="sales-item">
            <div class="sales-item-title">Bebidas</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Bebida').length} unidades</p>
            <p>Total: $${totals.bebidas.toFixed(2)}</p>
          </div>
          <div class="sales-item">
            <div class="sales-item-title">Boneless</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Boneless').length} unidades</p>
            <p>Total: $${totals.boneless.toFixed(2)}</p>
          </div>
          <div class="sales-item">
            <div class="sales-item-title">Papas</div>
            <p>Cantidad: ${history.filter((item) => item.type === 'Papas').length} unidades</p>
            <p>Total: $${totals.papas.toFixed(2)}</p>
          </div>
        </div>
        <div class="section-title">EGRESOS</div>
        <div class="content">
          <table class="expenses-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map((expense) => `
                <tr>
                  <td>${new Date(expense.date).toLocaleTimeString()}</td>
                  <td>${expense.description}</td>
                  <td>$${expense.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2"><strong>Total Egresos:</strong></td>
                <td><strong>$${totalEgresos.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="total-section">
          <p class="total-text">TOTAL VENTAS: $${totals.general.toFixed(2)}</p>
          <p class="total-text">TOTAL EGRESOS: $${totalEgresos.toFixed(2)}</p>
          <p class="total-text">BALANCE NETO: $${(totals.general - totalEgresos).toFixed(2)}</p>
        </div>
      </body>
    </html>
  `;
};

// Función para generar el contenido del ticket con información de pago
export const generateTicketHTML = (orderData, registro) => {
  const orderTotals = calculateOrderTotals(orderData.items);
  const currentDate = new Date().toLocaleString();

  // Calcular el descuento total sumando la diferencia entre precio original y precio final
  const discountTotal = orderData.items.reduce((sum, item) => {
    const isPromo = item.isPromotional || item.ispromotional;
    const originalPrice = item.originalPrice || item.originalprice;
    const currentPrice = parseFloat(item.price) || 0;
    
    // Si es promocional y no tiene originalPrice, intentamos inferirlo o usamos 0
    if (isPromo && !originalPrice) return sum + 0; 
    
    const original = parseFloat(originalPrice) || currentPrice;
    return sum + Math.max(0, original - currentPrice);
  }, 0);

  // Obtener información de pago del primer item (todos los items del pedido tienen la misma info)
  const paymentInfo = orderData.items[0] || {};

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Helvetica', sans-serif; width: 100%; max-width: 300px; margin: 0 auto; padding: 10px; }
          .header-container { display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
          .logo { width: 50px; height: 50px; margin-right: 10px; }
          .header { font-size: 16px; font-weight: bold; text-align: center; }
          .info { font-size: 12px; text-align: center; margin-bottom: 5px; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .items { margin: 10px 0; }
          .item { font-size: 12px; margin: 5px 0; display: flex; justify-content: space-between; }
          .total { font-size: 14px; font-weight: bold; text-align: right; margin: 5px 0; }
          .payment-info { 
            font-size: 12px; 
            margin: 10px 0;
            padding: 8px;
            background-color: #f5f5f5;
            border-radius: 4px;
          }
          .delivery-info { 
            font-size: 11px; 
            text-align: center; 
            margin-top: 15px;
            padding: 5px;
          }
          .footer { font-size: 10px; margin-top: 5px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header-container">
          <!-- PON TU BASE64 DEL LOGO AQUÍ -->
          <img src="data:image/jpeg;base64,/9j/6zMdSlAkAAAAAAAAADMTanVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAAMu1qdW1iAAAAR2p1bWRjMm1hABEAEIAAAKoAOJtxA3Vybjp1dWlkOjlmOTQ5MWFhLTdjM2EtNDk5Yy05NzQ1LWNkMTU1YWEyNmExNQAAAAQdanVtYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAAC52p1bWIAAABBanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5oYXNoLmJveGVzAAAAABhjMnNo4h6xmG9Xl+x0gimKvxV9mAAAAp5jYm9yomNhbGdmc2hhMjU2ZWJveGVzjKNlbmFtZXOBY1NPSWRoYXNoWCBxVjrYAGFAft6cbzFoNihL03EKUgxaeSte2hy3A2kIFWNwYWRAo2VuYW1lc4FkQzJQQWRoYXNoQQBjcGFkQKNlbmFtZXOBZEFQUDBkaGFzaFggZghNsgxwUgc65MvBDD5KYQ5GOs6iMPrFUwk/5LYzFiNjcGFkQKNlbmFtZXOBY0RRVGRoYXNoWCCpCKD5ZtuNKbhUfRpxu4HMpI0tx2V47fnZct88cL+gcmNwYWRAo2VuYW1lc4FjRFFUZGhhc2hYIHTyHwfplI97RZ9zn7YPvc0to5v7Wsp5Qi5sBzd29OOQY3BhZECjZW5hbWVzgWRTT0YwZGhhc2hYIEOZIfOKtsMxQseaNacrnLcTTB8dbyaLAxbzRV5+xedVY3BhZECjZW5hbWVzgWNESFRkaGFzaFggi33gSmKpOgwEasSxD71IHV762BXSHCZWJT7LoAa233BjcGFkQKNlbmFtZXOBY0RIVGRoYXNoWCAqabdjzjoE8U/M1CiRaSX4mnCr/X6/ak691R9jR4ft42NwYWRAo2VuYW1lc4FjREhUZGhhc2hYIPNXdg8p1I1tkgB5cC7JtIgNxzQTJvEup/Xr9nXv0aHsY3BhZECjZW5hbWVzgWNESFRkaGFzaFggYn9oeDtfUFm8zmTdUOIdC564oIMFHxBdaoCnYM0qVk5jcGFkQKNlbmFtZXOBY1NPU2RoYXNoWCCVIVPx2yHzr7Ik0j52e2FQ6GKzNjfqg7aCUqy/Ll2QYGNwYWRAo2VuYW1lc4FjRU9JZGhhc2hYIM3mbnjlQZ3qdN989D2aqHa4xmnUAGeZLnGc75CsXz/gY3BhZEAAAAEFanVtYgAAAD5qdW1kY2JvcgARABCAAACqADibcRNjMnBhLmFjdGlvbnMAAAAAGGMyc2jiHrGYb1eX7HSCKYq/FX2YAAAAv2Nib3KhZ2FjdGlvbnOBpGZhY3Rpb25sYzJwYS5jcmVhdGVkbXNvZnR3YXJlQWdlbnR1QXp1cmUgT3BlbkFJIEltYWdlR2VuZHdoZW50MjAyNS0xMS0wMlQxODo0ODowM1pxZGlnaXRhbFNvdXJjZVR5cGV4Rmh0dHA6Ly9jdi5pcHRjLm9yZy9uZXdzY29kZXMvZGlnaXRhbHNvdXJjZXR5cGUvdHJhaW5lZEFsZ29yaXRobWljTWVkaWEAAAJyanVtYgAAACRqdW1kYzJjbAARABCAAACqADibcQNjMnBhLmNsYWltAAAAAkZjYm9yp2NhbGdmc2hhMjU2aWRjOmZvcm1hdGppbWFnZS9qcGVnaXNpZ25hdHVyZXhMc2VsZiNqdW1iZj1jMnBhL3Vybjp1dWlkOjlmOTQ5MWFhLTdjM2EtNDk5Yy05NzQ1LWNkMTU1YWEyNmExNS9jMnBhLnNpZ25hdHVyZWppbnN0YW5jZUlEYzEuMG9jbGFpbV9nZW5lcmF0b3J4HE1pY3Jvc29mdF9SZXNwb25zaWJsZV9BSS8xLjB0Y2xhaW1fZ2VuZXJhdG9yX2luZm+BomRuYW1leClNaWNyb3NvZnQgUmVzcG9uc2libGUgQUkgSW1hZ2UgUHJvdmVuYW5jZWd2ZXJzaW9uYzEuMGphc3NlcnRpb25zgqNjYWxnZnNoYTI1NmN1cmx4XXNlbGYjanVtYmY9YzJwYS91cm46dXVpZDo5Zjk0OTFhYS03YzNhLTQ5OWMtOTc0NS1jZDE1NWFhMjZhMTUvYzJwYS5hc3NlcnRpb25zL2MycGEuaGFzaC5ib3hlc2RoYXNoWCB1Avv7M2acENXIogo5P/erKaobzRYMpoeFuNLlIraojaNjYWxnZnNoYTI1NmN1cmx4WnNlbGYjanVtYmY9YzJwYS91cm46dXVpZDo5Zjk0OTFhYS03YzNhLTQ5OWMtOTc0NS1jZDE1NWFhMjZhMTUvYzJwYS5hc3NlcnRpb25zL2MycGEuYWN0aW9uc2RoYXNoWCBSvgafKGKMad3fRtLo5U5uMpCrCqt4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AAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9+oxS0lABRRRQAUUUUAFFFLQAlFLSUAFFFFABRRRQAUUUUAFFFFAC0lFLQAlFFFABRS0lABRRRQAUUUUAFFLSUAFFFFABRRRQAUUUtACUUUUAFFFFABRRRQAUUUUAFFFLQAlFLRQAlFLSUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAYooxS0AJRS0UAJRRRQAUUUUAFFLSUAFFFFABiiiigAooooAKKKKACiiloASilooASiiigAoopaAEooooAKKKKADiiiigAo4oooAKKKKACiiigAooooAKKKKACiiloASiiigAoopaAEooooAKKWkoAKKKKACiiigAooooAKKKKACiiigBaKKSgAooooAKKKKACiiigBaSlpKACiiigBaSiigAooooAKKKKAFopKWgBKKKKAClpKWgBKKKKACiiigAoopaACkpaSgAooooAKKKWgBKKWkoAKWkooAKKWigBKKKKAFpKKWgAooooAKSlooASiiigAooooAKKKKAClpKKACiiigApaSigAooooAKKKKAClpKWgBKWiigBKKKKAClpKWgApKKKACiiigAooooAKKKKACiiigAopaKAEopaKAEooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAWkpaSgAooooAKWiigBKKKKAFpKWigBKKKKACiiigAooooAKKWkoAKKKKAFpKKKACiiigAooooAKKKWgBKWkooAKKWkoAKKWigBKWkooAWkoooAWkoooAWkpaKAEpaKKACkpaSgAooooAKKKKACiiigApaSloAKSlpKAFpKKKACiiigBaKKKAEooooAKKKKACiiigApaSigAooooAKKKKACiiigAooooAKWkooAWkopaACkpaKAEpaSloAKSlpKAFoopKACiiigAooooAKKKKAFpKWkoAWkoooAKKKKAClpKWgAopKWgBKWkpaACiiigApKWigBKKKKAClpKWgAoopKACiiigAooooAKWkooAKKKWgBKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApaSloASiiigAooooAKKKKACiiigAooooAKKKWgBKWkooAKKKKACilpKACiiigAoopaAEopaKAEopaKACikooAKKKKACiiigAooooAKKKKACiiloAKKKSgAooooAKKKKACilooASilooASiiigAopaKAEpaSigAooooAKWkooAKKKKACiiigApaSigBaKSloASlopKAClpKKACiiloASlopKACiiloASiiigBaSlooASiiigAooooAKKKKAClpKWgAooooAKKSigBaKSloAKKKSgAooooAKKWigApKWigBKKKKACiiigAooooAKKKKACiiigAooooAWkoooAKKKWgBKKKKAClpKWgBKKWigBKKKKAFopKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAWkpaKAEooooAWkpaKAEpaKKAEopaKACkoooAKKKKACiiigAooooAKKWkoAKKKKAFpKWkoAKKKKACiiigApaKKACiiigBKWkooAKKKWgAooooASiiigBaSiigAooooAKKKKACiiigBaSiloAKSiigApaSigBaKSloASiiigAooooAKWikoAKKKWgApKKKACiiigAooooAKWkpaAEopaKAEooooAKWkpaACiiigBKKKKAClpKWgAopKWgBKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKWkpaACkpaSgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKWgBKKKKACiiigBaSiigAooooAKKKKAFpKWkoAKKWkoAWikpaAEopaSgBaSiigAooooAKKKKACiiloASilpKAFoopKAFpKWigBKKKKACiiigApaSloAKSlooAKSlpKACiiigAooooAKWkooAWkpaSgApaSloAKSlooASiiigAooooAKKKKACiiigAooooAWiiigBKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoopaAEooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKWkoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiloASiiigAooooAKWiigBKKKWgBKKKKAFpKKKACiiloASiiigAooooAWikooAWkoooAKKKKAClpKKACiiigAooooAKWkpaACkzRRQAtFFFABSUtJQAUUtFACUUtJQAUUUtABRRRQAUlFFABRS0lABRS0UAJRRRQAUUUUALRSUUALRSUUAFFFFABRRRQAUUUUAFFFFABRRRQAtFJRQAUUUUAFLSUtACUtJRQAUUtJQAUUUUAFFFLQAlFFFABRRRQAUtJRQAUUUtACUUUUAFFLSUAFFFFABRRRQAtJRRQAUUUUAFFFFABRRRQAUUUtACUUtFACUUUUAFFFFABRRRQAUUtJQAUUUUAFFFLQAlFFFABRRRQAtFJS0AJRRRQAUtFFABRRRQAUlFFABRRRQAUtJRQAUUtFACUUtFACUtJS0AJRRS0AJS0lFABRRRQAUUUUAFFFFABRRRQAUUtJQAtFFFABSUtFACUtFFABSUUUAFLSUUAFLRRQAUUUUAFJS0lABRS0UAFFFJQAtJRS0AJRRRQAUUtJQAUUUUAFFFFAC0UUUAJRRRQAUUUUAFFFFABRRRQAUUUUALRRRQAlFFFABRRRQAUtJS0AJS0lLQAlFLSUAFFFFABRRS0AJRRS0AFFFJQAUUUUAFFFFABRRS0AJRS0lABRRRQAUUUUALSUtFABSUtFACUUUtACUtFJQAUtFJQAUtJRQAtJRRQAUUUUAFFFLQAlFLSUAFLSUUAFFFLQAlLSUtACUtJS0AJRRRQAUtJRQAUtFFABRRRQAlLRRQAUUUUAFFFFABSUtJQAUUUUAFFFFAC0lLSUAFLRRQAUlLSUAFFFFABRRRQAUtJRQAtJRRQAUUUUAFFFFABRS0UAFJS0lABRRRQAUUUUAFLSUUALRSUZoAWiiigApKKKACiiigApaSigBaKKKAEopaSgApaSigAooooAWikooAKKKKACiiigAopaSgApaSloASiiigAoopaAEooooAKKKKAClpKKACiiigBaSlpKACiiigAooooAKKKKACiiigBaKKSgAopaKACiiigAooozQAlLSUtACUUUUAFFFFAC0UlLQAlLSUtABRRRQAlFFLQAlLSUUAFFLRQAlLRRQAlLSUUAFFFFAC0UlFABS0lFABS0UUAJRS0UAFFFJQAtFJRQAtFJRQAUtJS0AJRRRQAtJRRQAtFJRQAtFJS0AJRS0UAJRRRQAtJRS0AFFJRQAUUUUAFFFFAC0UlFAC0lFLQAlFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABS0UUAFFFJQAUUUUAFLSUUALSUtJQAUtFJQAUUUUAFFFFABRS0UAJS0lFABRRRQAUtJRQAUtJRQAUUUUAFFFFABRRRQAUUUtACUUtJQAUtJRQAUUUUAFFFFAC0lLSUALRSUUALRRRQAlFFFAC0UUUAJRRS0AJS0UUAFFJS0AJS0lLQAUUUlABRRRQAUtFFABSUtFACUUtJQAtFFJQAUUtFACUUtJQAUtJRQAtFFFACUtFFACUUUUAFLSUUAFFFFABRRS0AJRRRQAUUUUAFFFFABS0lLQAUUUUAJRRRQAUtJS0AFFFJQAUtJRQAtJRRQAtJS0UAJRRRQAtJRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRS0AFFFFABSUtJQAUUUUAFFFFABRRRQAtJRRQAUUUUAFFFFABRRRQAUUUtACUUUUAFFFFABRRRQAtJRRQAUUUUAFFFFAC0lFFABS0lFABRS0lABRRS0AJRS0UAJRRS0AJRRRQAUUUtACUtFFACUtJRQAUtFFABRRRQAlLSUUAFFLRQAUlFFABRRS0AJS0lLQAUUlFABS0lLQAlFFFABRRRQAUtFFABSUUUAFFFFAC0lFLQAlFLSUALSUtFABRRSUAFFFFABRRRQAUUtJQAUUUtACUUUUAFLSUUALRSUUAFFFFABRRRQAUUtJQAUUUUAFFFLQAUlLRQAUUUUAFJRRQAUUUUAFFFFABRRRQAtJRRQAtFJRQAUUUUAFLSUUAFLSUtABSUtFACUUUUAFFFFABS0UUAFFFFABRRRQAlLRSUALRRRQAlFLRQAlFFFABRRRQAUUUUAFFFFABS0lLQAlLSUtABSUtFACUUUUAFFFFIBaSlopgJS0lFAC0lFLQAUUUUAFFFJQAtJS0lAC0UlLQAlFFLQAlApaSgAooooAKKKKAClpKKACiiigApaSloASiiloASilooASiiigAooooAKKKWgApKWigBKKWigAopKKAFopKKAFpKKKAClpKKAClpKKACloooASiiigAoopaACkoooAWkoooAKKKWgApKWkoAKKKKACilooAKKKSgBaSiigBaSiigAooooAKKKKACiiigApaSigAopaKAEooooAKKKKACiiigBaSiigAoopaAEopaSgApaSigApaSigBaKSigBaKSigBaKSigBaSiigAooooAKKKKACilooASiiigAooooAWiikoAKKKKACkLAHkj86ORycYr47+LHigeKfHt7cQvutbY/ZoCOhVTyfxOTQB9h71/vD86XcD3H518CV7R+z/AODf7R1qbxNdxg21iTHbBhw0xHLf8BB/Mj0oA+lKKTvS0AFFLRQAlLRSUALRRSUALRSUUAFFFJ3oAWikpfX/AAoAKKKWgBKKWkoAKKKKAFpKKKACiiigApaSigApaKKACiiigBKKWigAoopKACiiigBaKSloAKKSigBaKSigBaKSigBaSlpKAFpKKKACiiigAooooAKKWkoAWikpaACkpaSgAopaSgAooooAKWkpaAEoopaAEpaSigBaKSloAKSlpKACiiigBaSiigAooooAKKKKACiiigAoopaAEoopaACkpaSgAopaSgAooooAKKKKACloooAKSlpKACiiigAooooAKKKWgBKWkpaAEooooAKKKKACiiigApaKSgApc0lFABS0lFABRS0lAC0lLSUAFJS0lAHDfFnxV/wingS8mik23t2Pstt67mByw+i5P1xXx6ef8a9R+Oniv+3vGx02CTdZ6UDAMHhpTjefwOF/4DXl3agCxYWVxqeoW9jaRmS4uJFijQDqxOAK+2PCXhy38J+F7HRbbBFvGN7gf6xzyzfiSf0rwr9nzwf9v1m48T3UeYLL91bZHDSkcsP91T+be1fSFAB2paT+dLQAtFJRQAtJRRQAUtJRSAKSsjWvFWg+Hoy+r6taWnfbJIN5+ijk/lXmmvftDeHrLdHo1jc6jL2d/wBzHn8QW/SmB7FVTUNVsNKgM+oXtvaxD+OaQIP1r5a1345+M9Y3R21xDpkJ/htE+b/vpsn8sV55eaheajOZ767nuZTyXmkLn8zQB9w6Lr2meIbE3ulXS3VqJGj81QQCw69a064j4Sad/Zvwv0OMqFaSEzt772LD9CK7agBaWkpaACiiigBKWkooAKWikoAWkoooAKKKKAClpKKAFopKWgBKWkpaACiiigApKWkoAKKKTJ+tAwz7UenpRTXdY1ZnYKo5LE4AoEOo6VxW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aKAFooooAKWkooAWiiigApKKWgBKKKWgBKKWkoAKKKKACiiloASilooASiiloASiiigApaSigAooooAKWkooAWkoooAKWiigAopKKAFpKKKACiiloASilooASiiigBaSiigAoopaAEooooAKKKKACilpKACilpKACiiigAooooAKKKKACiiigApaSigAooooAKKKKAFooooAKSlooASiiigAooooAKKKKAFopKKACiiigAooooAWiiigBKWkooAWkpaSgBaSlpKACiiigApaSloASiiigBaKKSgAopaSgAooooAKKWkoAKKKKACiiigAooooAWikpaAEooooAKKWkoAWkopaAEpaSloASk7UtJQBzXjnVJ9O8PPb2POoX7iztR6O/G78Bk/hWl4f0aDw/oFlpVt/q7aIJn+8e5P1OTTLrR1vPEVnqU53JZxMIU7B24LfXAx+Na1ABiloooAKWiigAooooAKSiigAooooAKWkpaACiiigApKWkoAKKWkoAKWkooAKKKKACiiigAooooAKWkooAKKKKACiiigAooooAKKKKAClpKKAClpKWgBKWiigApKKKACiiigAoopaAEpaSigAooooAKKKKACilooASiiigAooooAKKKKACiiigBaSiloASiiigAooooAKKKWgBKKWigBKKKKACilooASiiigBaKKSgAooooAKWkpaAEopaKAEooooAKKKKAClpKWgBKKWkoAKKKKAFpKKKAFopKKAClpKKAFooooAKKKKACikooAKKKWgApKWkoAWkoooAKKWkoAKKKWgBKKKKAFpKKKACiiigAooooEFLRSUDCiiigApaSigBaKKKACiiigBKKWigApKKWgBKKWigAooooASiiigApaSigAoopaAEooooAKKKWgApKKKAFopKWgApKWkoAKKKKACiiigAooooAKKKKAFpKKKACiiigAoopaAEpaKSgAoopaAEoopaAEooooAKKKKACiiigAooooAKWkooAKWkooAKKKKACilooASiiigAooooAWikooAWkpaSgAooooAWikooAWkoooAKWkpaAEopaKAEooooAKKKKAClpKKACiiloASiiigAooooAKKKKAFpKKKAFopKKAFopKKACiiigApaKSgBaSiigAooooAKKKKAClpKKACiiigBaSiigApaKSgBaSlpKACiiigAooooAKKKKACiiigBaSiigBaKSigAooooAKWkpaAEpaSigApaSigApaSigAooooAKKKKACiiigAooooAKWkooAWkoooAKKKKAFpKKKACiiigAooooAKKKKACiiigAooooAKWkooAKKKKACiiloASiiloASiiigAooooAKKKKAClpKKACiiigAooooAKKWigBKKKKACiiigAooooAWkpaSgAooooAKKKKACiiigAooooAWikooAKKKKACiiloASiiigApaSigAooooAKKKKACiiigAooooAKKKKACiiigAopaSgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKWkpaACiikoAWkoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAWkopaAEooooAKKKKACiiigAooooAKKKKACiiigAooooAKKWkoAKKKKACikooAWikooAKWkooAWikooAKKKKACiiigBaKSigBaSiigBaKSigBaKSigAooooAKWkooAKKKKAClpKKAFopKWgBKKKWgAopKKACiiloAKKKSgBaSiigAooooAKKKKACiiigAooooAWkpaSgAooooAKKKKACiiigAooooAKKKKAFopKKACiiigBaSiigAooooAKKKKAFopKKAFopKKAFopKKACiiigAooooAKKKKAFpKKKAClpKKAFopKKACiiigBaKKSgBaKSigBaKSjNABS0lFAC0lFFAC0lLSUALRRRQAUUlFAC0UlFAC0UlFAC0UlLQAlLSUUAFLRSUAFLSUUAFLSUUALRSUUALRSUtABRSZpaACikooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACjNFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAC0UlFABRmiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKWkoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKWgBKKKKACiiigAoopaAEooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAopaSgAooooAKKKKACiiigAooooAKKKKACig0UAFFFFABRS0lABRRS0AJRRRQAUUUUAFFFFABRRRQAUUUUAFFLSUALSUtJQAUUtFACUUtJQAUUUtACUtJRQAtJS0lABRRRQAUUUUAFFFFABS0UlABRRRQAUUUUAFFFFABRRRQAUUtJQAUUtJQAUUtFABSUUUAFFFFABRRRQAUUtJQAUUUUAFFFFAC0lFLQAlFFFABRRRQAUUtJQAUUUUAFFLSUAFFFFABRRRQAUUtJQAUUUUAFFFFABRRS0AJRRS0AFFFFABSUtFACUUUUAFFFFABRS0lABRRS0AFJS0UAJS0lLQAlFLRQAlFFFABRS0UAJRRS0AFJRS0AFFJS0AFFFFABRRRQAUlLRQAUUlLQAlFLRQAlFFFABRRS0AJRS0lAC0lLRQAlFLRQAlFFFAC0UlGaAFpKKKAFpKWkoAKKWkoAKWkooAKKWigAoopKACilooAKSlooAKSiloASilooAKKKKACiiigBKWiigBKWikoAWkpaKAEpaKKAEooooAWikooAKWkpaACkoooAKKWkoAKKKWgBKWikoAKKKKACiiigAopaSgAooooAWkopaAEpaKSgAooooAKKKKACiiigAooooAKKKKACilpKACilpKAFpKKKACilpKAFpKWkoAWkpaKACkopaAEpaKKAEopaKAEopaSgApaSigApaKKAEpaKKAEopaKAEooooAKWkpaACkpaKAEpaKSgBaKSloAKKSloAKKKKACiiigAooooASiiigBaSiigBaKKKACkpaKACiiigApKWigAoopKAFooooASiiigAooooAKKKKACiiigAooooAWkopaACikpaACiiigBKWikoAKWkooAKWkooAWikpaACikpaACiiigApKWigApKWigBKKWkoAKKKKACiiigAoopaAEooooAKKWkoAKKWkoAKKKKAFpKKKACiiigAopaSgBaSlooASlpKKACiiigAooooAKKWkoAKKKKACiiigAooooAKKKWgAoopKACiiigApaSigBaKKSgBaKSloAKKKKACkpaSgAooooAWiiigAooooAKKKKAEpaKKACiikoAWiiigAooooASloooAKKKKACiiigAooooAKKKKAEpaSloAKKKKACkpaKACkpaKAEpaKSgBaKSigApaKKAEopaKACkoooAKKWkoAKKKWgApKWigBKKKWgBKWiigBKKWigApKWigBKKWkoAWkoooAWiiigBKKKWgAooooAKKKKACkpaKACkpaKAEooooAWikooAKKKKACiiigApaKKAEpaKKACiiigApKWkoAKKKKACilooASilooAKKSigAoopaAEopaSgBaKSigBaKSloASilooASilpKACiiigAopaKACkoooAKKKKACilooASilpKACilooASilooAKKKKACkpaKACiiigAooooAKKKKAEopaKACiiigAooooAKKSigBaKKKACiiigAooooAKKKKACiiigBKKKKACloooAKKKKAEpaKKACiiigBKWkooAWiiigBKWikoAWkoooAKKKKACiiigBaSlooASilpKAFooooAKSlpKACiiloASilpKAClpKKAFopKKAFooooAKKSloAKKKKACikooAWkpaKACiiigApKXvSUAFFFFABS0lFAC0UlFAC0UlLQAUUlFABS0lFABRRRQAUd6KKACiiloAKSlpKACiiigApaKKAEooooAKWkooAKWkpaAEooooAKKWkoAWkpaKAEopaSgAopaSgBaSiloASilpKAFoopKAFooooAKKKKACiiigAooooAKKKKACkpaKACikpaACiiigApKWigAooooASloooAKKKKACiiigAooooAKKKSgApaSloAKSlpKAFooooAKKKKACkpaSgBaKKKACiiigAopKKACiiigAooooAKKKKAFooooASiiloASloooASilooASlpKWgApKWigBKKKKAFpKKKAFopKKAClpKWgAooooASilooAKSiloASiiigBe9JR3o70AFFFFABS0lFABRRRQAUtJRQAUUUUAFFFFABRRRQAUUUlAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUALSUUUAFFFFABRRRQAUtJRQAtJRRQAtFJS0AFFJRQAUUZooAWikpaACkpaSgBaKKSgBaKSloAKKKKACkpaKAEpaSloAKKKKACiikoAWkoooAWiiigAooooAKKKKACiiigAooooASlpKKAFoopKACloooAKKKKACikpaADvRRRQAUUUUAFFFFACUtFJQAUvekpaACikpaACiikoAKKKWgAooooAKM0lLQAlLRRQAUUUUAJRRRQAtFFFABSUUUALRSUUALRSUtABRRRQAUUlFABRRRQAUUUUAFFFLQAlFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFJQAtFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAC0UlFAC0UlLQAUUUlAC0UUlAC0lFFABRRRQAtFFJQAtFJS0AFFFFABRRRQAUUUlAC0UlLQAUUUUAFFFFABRSUtABRRRQAUUUUAFFFFABRRRQAUUUUAJS0lFAC0UUUAFFFFABRSUtABRRSUALRRSUALRRSd6AF70UUUAJRS0lABR3paSgBaSijvQAtJR3paAEpaKKACiikoAWiikoAXvRRRQAUlFHegAooooAWikooAWiikoAKKWkoAWkpaKACikooAKKKKAFpKKKACiiigAo70UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFJS0AFFJS0AFFFFABRRRQAUUUUAFFFFABRRmigAooooAKKKKACiiigAooooAWkoooAWkpaSgAooooAWiiigApKKWgBKKKWgBKWikoAWiiigAopKKAFooooAKKSigApaSloAKKKKAEpaKSgBaSlooAKKKKACiiigAooooAKKKKACiiigBKKKWgAooooAKKKKACiiigApKWkoAKWkpaAAUd6O9HegAoopKAFpKKKACiiloAKO9J3o70AL3pKO9HegApaTvRQAtJRRQAUUtJQAUUUtACUUd6O9AC0lHeigBaKSl70AHeiikoAO9FHejvQAtJRRQAUUUUAFFLSUAFFFFABRRRQAd6KKKACiiigAooooAKKKO9ABRR3pKAFopKWgA70UnejvQAtFHek70AFLSUd6AFooooAKKKKACiiigAo70Ud6ACiik70AFLRRQAUUUUAHeijvRnmgAooooAKKKKADvRRRQAUUUUAFLSUUALSUtJQAtFJS0AFFFJQAtJS0lAC0UUUAFJS0UAFJS0lABS0lLQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACUUd6KAFopO9FAC96KSl70AFFJR3oAWk70d6O9AC96O9J3o70AHejvR3o70AFHejvR3oAKO9FHegA70d6O9J3oAXvR3o70d6ADvRR3o70AHeijvRnmgA70UUd6ADvR3o70d6ACiiigAo70d6O9AB3o70d6O9AB3o70Ud6ADvRnmjvR3oAKKM80d6AFpO9GeaO9ABR3o70d6AClpO9FAB3oo70d6ADvRR3o70AHejvR3o70AFHejvR3oAO9HejvR3oAO9Hek70vegBO9Hel70negA70vek70d6AF70d6TvRnmgA70d6O9HegA70d6O9FAB3o70Ud6AF70d6TvRQA6kpKKADvS96TvS96AE70Ud6O9AB3paTvRQAtHeik70AL3opM80UALRRR3oAO9HejvR3oAO9FFFAB3o70Ud6ACijvRQAUZoooAWikooAKWkooAWik70UALRSUtABSUtJQAtJ3o70d6ADvS0lFAC0UlFAC0UlFAC0UlFAC0UlGaAFooooAKKTNFAC0UlLQAUUUUAN70tJRQAvejNJS0AFJ3oooAKM80UUAGeaO9FFAB3pc80lFABnmjvRRQAUtJRQAtFJRQAuaTvRzSUALnmjPNFFABnmjPNJRQAueaM80lFAC0UlFAC55ozzSc0oNABR3oooAO9HeikoAXvRnmiigAzR3oooAO9L3pvNLQAd6WkooAM0d6OaKADvR3pKWgA70d6KKACjPNFJQAtGaKSgBc80d6SigBaO9JS0AHejPNFJQAvejvSUUAHelzSUUALnmjNJRQAvek70UUAHejPNFFABRRRQAtHeko5oAXNGaSigAozRRQAd6KOaKADNGaKKADPNLmkooAXNGeaSigBc80ZpKKAFBopKWgA70d6KKACjvRSUAL3o70lLQAd6O9FFABS5pKKAFozSUUAGaXNJRQAZooooAWikooAWkoooAXNJnmiigBaKSigBc0ZpKKAFooooAKKSigBaKKKACiiigAozRRQAUUUUAFFFFAH//2Q==" class="logo" />
          <div class="header">RYU SUSHI MATRIZ</div>
        </div>
        
        <div class="info">¡El mejor sushi de la ciudad!</div>
        <div class="info">Fecha: ${currentDate}</div>
        <div class="info">Cliente: ${orderData.clientNumber}</div>
        
        <div class="divider"></div>
        
        <div class="items">
          ${orderData.items.map((item) => {
    const isPromo = item.isPromotional || item.ispromotional;
    const originalPrice = item.originalPrice || item.originalprice;
    const hasDiscount = (item.clientDiscount > 0 || (originalPrice && originalPrice > item.price)) && !isPromo;
    
    return `
            <div class="item">
              <span>${item.name} ${item.option || ''}</span>
              <span>
                ${isPromo ? 
                  '<strong>3X2</strong>' :
                  hasDiscount ?
                  `<del style="color: #999;">$${(parseFloat(originalPrice) || 0).toFixed(2)}</del> $${(parseFloat(item.price) || 0).toFixed(2)}` :
                  `$${(parseFloat(item.price) || 0).toFixed(2)}`}
              </span>
            </div>
          `;
  }).join('')}
        </div>
        
        <div class="divider"></div>
        
        <div class="total">Subtotal: $${(orderTotals.total + discountTotal).toFixed(2)}</div>
        ${discountTotal > 0 ? `<div class="total">Ahorrado: $${discountTotal.toFixed(2)}</div>` : ''}
        <div class="total" style="font-size: 16px;">Total: $${orderTotals.total.toFixed(2)}</div>
        
        <!-- Información de pago -->
        <div class="payment-info">
          <div><strong>Método de pago:</strong> ${paymentInfo.paymentMethod === 'efectivo'
      ? 'EFECTIVO'
      : paymentInfo.paymentMethod === 'tarjeta'
        ? 'TARJETA'
        : paymentInfo.paymentMethod === 'pendiente'
          ? 'AÚN NO COBRADO'
          : 'Pendiente'
    }</div>
          ${paymentInfo.paymentMethod === 'efectivo' ? `
            <div><strong>Recibido:</strong> $${paymentInfo.cashReceived?.toFixed(2) || '0.00'}</div>
            <div><strong>Cambio:</strong> $${paymentInfo.change?.toFixed(2) || '0.00'}</div>
          ` : ''}
          ${paymentInfo.clientDiscount > 0 ? `
            <div style="color: #28a745; font-weight: bold; margin-top: 5px;">
              <strong>Descuento aplicado:</strong> ${paymentInfo.clientDiscount}%
            </div>
          ` : ''}
        </div>
        
        <div class="divider"></div>
        
        ${paymentInfo.note ? `
          <div style="margin: 10px 0; padding: 10px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">Nota del pedido:</div>
            <div style="font-size: 11px;">${paymentInfo.note}</div>
          </div>
        ` : ''}
        
        <!-- Texto del servicio a domicilio ABAJO del precio -->
        <div class="delivery-info">
        Contamos con servicio al número 618-126-8154
        </div>
        
        <div class="footer">
          ¡Gracias por elegir Ryu Sushi!<br>
          ¡Esperamos verte pronto!<br>
          Síguenos en redes sociales
        </div>
      </body>
    </html>
  `;
};

// Componente WebView para renderizar HTML y capturar como imagen
export const HTMLtoImageView = ({ html, onImageCreated, visible = true }) => {
  const webViewRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Inject html2canvas script into the original HTML without stripping styles
  const captureScript = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script>
      window.onload = function() {
        setTimeout(function() {
          html2canvas(document.body, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: document.body.scrollWidth,
            height: document.body.scrollHeight
          }).then(function(canvas) {
            var dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'image', data: dataUrl }));
          }).catch(function(error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: error.toString() }));
          });
        }, 1500);
      };
    </script>
  `;

  // Insert the script just before the closing </body> tag to preserve all original styles
  const wrappedHtml = html.replace('</body>', captureScript + '</body>');

  const handleMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'image' && message.data) {
        // Remove the data:image/jpeg;base64, prefix
        const base64Data = message.data.replace(/^data:image\/\w+;base64,/, '');
        onImageCreated(base64Data, null);
      } else if (message.type === 'error') {
        console.error('html2canvas error:', message.message);
        onImageCreated(null, new Error(message.message));
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
      onImageCreated(null, error);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: wrappedHtml }}
        style={styles.webView}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        scrollEnabled={false}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          onImageCreated(null, new Error('WebView load error'));
        }}
      />
      <View style={styles.loaderOverlay}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -9999,
    left: -9999,
    width: 800,
    height: 1200,
    backgroundColor: 'white',
    opacity: 0,
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});

// Función para exportar el PDF
export const exportToPDF = async (html, fileName) => {
  try {
    // Web: abrir ventana de impresión
    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    // Generar PDF desde HTML
    const { uri } = await Print.printToFileAsync({ html, base64: false });

    // Compartir PDF usando el diálogo nativo del sistema
    // Esto permite al usuario guardar en Descargas, compartir por WhatsApp, Email, etc.
    await Sharing.shareAsync(uri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
      dialogTitle: 'Guardar o compartir ticket'
    });

  } catch (error) {
    console.error('Error al exportar PDF:', error);
    Alert.alert(
      'Error',
      'No se pudo generar el PDF. Por favor, intente nuevamente.',
      [{ text: 'OK' }]
    );
  }
};

// Función para exportar como imagen
export const exportToImage = async (html, fileName) => {
  try {
    if (Platform.OS === 'web') {
      // En web, abrir en nueva ventana para imprimir/guardar como imagen
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    return new Promise((resolve, reject) => {
      const RenderComponent = ({ onComplete }) => {
        const [base64Data, setBase64Data] = useState(null);
        const [error, setError] = useState(null);
        const [showWebView, setShowWebView] = useState(true);

        useEffect(() => {
          if (base64Data) {
            const saveAndShareImage = async () => {
              try {
                const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
                const imageFileName = `${fileNameWithoutExt}.jpg`;
                const filePath = `${FileSystem.cacheDirectory}${imageFileName}`;

                // Write base64 data to file
                await FileSystem.writeAsStringAsync(filePath, base64Data, {
                  encoding: 'base64',
                });

                // Request permission and save to gallery automatically
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                  const asset = await MediaLibrary.createAssetAsync(filePath);
                  Alert.alert('✅ Imagen guardada', 'El reporte se guardó en tu galería de fotos.', [{ text: 'OK' }]);
                } else {
                  // If no permission, fallback to share dialog
                  await Sharing.shareAsync(filePath, { mimeType: 'image/jpeg' });
                }

                resolve(filePath);
              } catch (err) {
                console.error('Error al guardar/compartir la imagen:', err);
                Alert.alert('Error', 'No se pudo compartir la imagen', [{ text: 'OK' }]);
                reject(err);
              } finally {
                setShowWebView(false);
                if (onComplete) onComplete();
              }
            };

            saveAndShareImage();
          }

          if (error) {
            // Fallback: generar PDF en lugar de imagen
            Alert.alert('Aviso', 'No se pudo generar la imagen. Se generará un PDF en su lugar.',
              [{
                text: 'OK',
                onPress: async () => {
                  try {
                    const { uri } = await Print.printToFileAsync({ html, base64: false });
                    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
                    resolve(uri);
                  } catch (pdfError) {
                    console.error('Error en fallback a PDF:', pdfError);
                    reject(pdfError);
                  } finally {
                    setShowWebView(false);
                    if (onComplete) onComplete();
                  }
                }
              }]
            );
          }
        }, [base64Data, error]);

        return (
          <HTMLtoImageView
            html={html}
            onImageCreated={(data, err) => {
              if (data) setBase64Data(data);
              if (err) setError(err);
            }}
            visible={showWebView}
          />
        );
      };

      resolve(RenderComponent);
    });
  } catch (error) {
    console.error('Error general en exportToImage:', error);
    Alert.alert('Error', 'No se pudo generar la imagen. Por favor, intente nuevamente.', [{ text: 'OK' }]);
    throw error;
  }
};

// Función para imprimir el ticket
export const printTicket = async (html) => {
  try {
    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    const { uri } = await Print.printToFileAsync({ html, width: 300, height: 'auto' });

    await Print.printAsync({ uri, width: 300, height: 'auto' });

    Alert.alert('Éxito', 'Ticket generado correctamente', [{ text: 'OK' }]);
  } catch (error) {
    console.error('Error al imprimir:', error);
    Alert.alert('Error de impresión', 'Verifica que tu impresora esté conectada y configurada correctamente', [{ text: 'OK' }]);
  }
};

// Función para agrupar pedidos por cliente
const groupOrdersByClient = (history) => {
  const clientGroups = {};
  history.forEach((item) => {
    if (!clientGroups[item.clientId]) {
      clientGroups[item.clientId] = [];
    }
    clientGroups[item.clientId].push(item);
  });

  const orders = {};
  Object.entries(clientGroups).forEach(([clientId, items]) => {
    const clientName = typeof items[0].clientName === 'object'
      ? items[0].clientName?.name || `Cliente ${Object.keys(orders).length + 1}`
      : String(items[0].clientName || `Cliente ${Object.keys(orders).length + 1}`);

    orders[clientId] = {
      items,
      clientNumber: clientName,
      time: items[0].time,
      clientId,
    };
  });
  return orders;
};

// Función para calcular los totales de un pedido
export const calculateOrderTotals = (orderItems) => {
  return {
    total: orderItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    sushi: orderItems.filter((item) => item.type === 'Sushi').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    wings: orderItems.filter((item) => item.type === 'Alitas').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    drinks: orderItems.filter((item) => item.type === 'Bebida').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    fries: orderItems.filter((item) => item.type === 'Papas').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    boneless: orderItems.filter((item) => item.type === 'Boneless').reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
    halfOrdersWings: orderItems.filter((item) => item.type === 'Alitas' && item.name.toLowerCase().includes('media')).length,
    halfOrdersBoneless: orderItems.filter((item) => item.type === 'Boneless' && item.name.toLowerCase().includes('media')).length,
  };
};