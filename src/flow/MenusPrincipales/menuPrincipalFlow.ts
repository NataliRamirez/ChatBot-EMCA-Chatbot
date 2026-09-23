import { addKeyword } from '@builderbot/bot';
import { guardarMensaje } from '../conexionApi.js';
import { horariosFlow } from '../Horarios/horariosFlow.js';
import { reportesFlow } from './reportesFlow.js';
import { masOpcionesFlow } from './masOpcionesFlow.js';
import { usuariosPausados } from '../../app.js';

/**
 * @file menuPrincipalFlow.ts
 * @author Juan David Nieto
 * @description Flujo principal de navegación del chatbot EMCA.
 * Presenta las categorías principales de atención y dirige al usuario
 * hacia los módulos correspondientes según la opción seleccionada.
 */

const TEXTO_MENU = '📋 *MENÚ PRINCIPAL DE ATENCIÓN*\n───────────────────────────────\n¡Hola! Bienvenido a nuestro canal de atención interactivo. 📌 *¿En qué te podemos ayudar hoy?* Selecciona la categoría correspondiente en los botones de abajo para guiarte en tu solicitud:';
const BOTONES_MENU = ['Horarios', 'Reportes', 'Más opciones'];

export const menuPrincipalFlow = addKeyword(['MENU_PRINCIPAL', 'Menú principal', 'menu'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from;

    if (usuariosPausados.has(telefono)) {
      return endFlow();
    }

    try {
      const res = await fetch(`http://127.0.0.1:4000/v1/user/${telefono}`, {
        headers: { 'x-api-key': 'EmcaSecret2026' }
      });
      if (res.ok) {
        const user = await res.json();
        if (Number(user?.bot_activo) === 0) {
          usuariosPausados.add(telefono);
          return endFlow();
        }
      }
    } catch (error) {
      console.error('❌ Error verificando estado del usuario:', error);
    }

    // 💾 Registrar mensaje enviado por el BOT
    try {
      await guardarMensaje(
        telefono,
        TEXTO_MENU,
        'BOT',
        BOTONES_MENU,
        null,
        'BOT_BOTONES'
      );
    } catch (error) {
      console.error('❌ Error guardando mensaje de Menú Principal en BD:', error);
    }
  })
  .addAnswer(
    TEXTO_MENU,
    {
      buttons: [
        { body: 'Horarios' },
        { body: 'Reportes' },
        { body: 'Más opciones' }
      ],
      capture: true
    },
    async (ctx: any, { gotoFlow, fallBack, endFlow }) => {
      const telefono = ctx.from;
      const bodyRaw = String(ctx.body || '').trim();


      if (usuariosPausados.has(telefono) || bodyRaw.startsWith('_event_')) {
        return endFlow();
      }

      const textoLimpio = bodyRaw
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (['menu', 'inicio', 'buenas'].includes(textoLimpio)) {
        return gotoFlow(menuPrincipalFlow);
      }

      if (textoLimpio.includes('horario')) {
        return gotoFlow(horariosFlow);
      }

      if (textoLimpio.includes('reporte')) {
        return gotoFlow(reportesFlow);
      }

      if (textoLimpio.includes('mas opciones') || textoLimpio.includes('siguiente')) {
        return gotoFlow(masOpcionesFlow);
      }

      const msgError = '⚠️ Por favor selecciona una opción válida haciendo clic en uno de los botones.';
      return fallBack(msgError);
    }
  );