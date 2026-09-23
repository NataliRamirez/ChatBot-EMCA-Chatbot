import { addKeyword } from '@builderbot/bot';
import { guardarMensaje } from '../conexionApi.js';
import { tramitesFlow } from '../Tramites/tramitesFlow.js';
import { dobleFacturacionFlow } from '../Tramites/dobleFacturacion.js';
import { masOpciones2Flow } from './masOpciones2Flow.js';
import { usuariosPausados } from '../../app.js';

/**
 * @file masOpcionesFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de mostrar la primera página del menú de
 * opciones avanzadas del chatbot EMCA, permitiendo al usuario acceder
 * a consultas relacionadas con trámites, facturación y navegación hacia
 * módulos complementarios del sistema.
 */

const mensajeMasOpciones = '📑 *GESTIÓN DE FACTURACIÓN Y TRÁMITES*\n──────────────────────────────────\n🔹 *Página 1 de 3*\n\nConsulta el estado de tu cuenta, solicita el duplicado de tu factura o realiza peticiones comerciales.\n\n📌 *Toca un botón del menú para avanzar:*';
const botones = ['Trámites', 'Doble facturación', 'Siguiente'];

export const masOpcionesFlow = addKeyword(['Más opciones', 'mas opciones'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from;
    if (usuariosPausados.has(telefono)) return endFlow();

    // 💾 Guardar mensaje del BOT en BD
    await guardarMensaje(telefono, mensajeMasOpciones, 'BOT', botones, null, 'BOT_BOTONES').catch(() => {});
  })
  .addAnswer(
    mensajeMasOpciones,
    {
      buttons: [
        { body: 'Trámites' },
        { body: 'Doble facturación' },
        { body: 'Siguiente' }
      ],
      capture: true
    },
    async (ctx: any, { gotoFlow, fallBack, endFlow }) => {
      const telefono = ctx.from;
      const rawText = String(ctx.body || '').trim();


      if (usuariosPausados.has(telefono) || rawText.startsWith('_event_')) {
        return endFlow();
      }

      const textoLimpio = rawText
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (textoLimpio.includes('tramite')) return gotoFlow(tramitesFlow);
      if (textoLimpio.includes('doble')) return gotoFlow(dobleFacturacionFlow);
      if (textoLimpio.includes('siguiente')) return gotoFlow(masOpciones2Flow);

      const msgError = '⚠️ Selecciona una opción válida del menú.';
      return fallBack(msgError);
    }
  );