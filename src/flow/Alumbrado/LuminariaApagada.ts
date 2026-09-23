import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeLuminariaApagada = '🔦 *REPORTAR LUMINARIA APAGADA*\n\nHemos registrado tu reporte de falla en el alumbrado público. Por eso lo invitamos a realizar el reporte al siguiente numero telefonico 3024091910 o el 3024091899 y nuestro equipo técnico procederá a verificar el sector.\n\nPresiona el botón para regresar al menú principal:';
const botones = [ 'Menú principal' ]

/**
 * @file LuminariaApagadaFlow.ts
 * @author Juan David Nieto
 * @description Flujo conversacional encargado de atender reportes
 * relacionados con luminarias apagadas en el sistema de alumbrado público.
 * El sistema informa al usuario los canales oficiales de atención y permite
 * regresar al menú principal del chatbot.
 */

export const LuminariaApagadaFlow = addKeyword([
  'luminaria apagada', 
  'apagada', 
  '🔦 Luz Apagada', 
  'luz apagada'
])
  .addAction(async (ctx: any) => {
    await guardarMensaje(
      ctx.from, 
      mensajeLuminariaApagada, 
      'BOT', 
      botones, 
      null, 
      'BOT_BOTONES'
    ).catch(() => {});
  })
  .addAnswer(
    mensajeLuminariaApagada,
    {
      buttons: [{ body: 'Menú principal' }],
      capture: true
    },
    async (ctx: any, { gotoFlow, fallBack, endFlow }) => {
      const telefono = ctx.from;
      const bodyText = String(ctx.body || '').trim();

      if (usuariosPausados.has(telefono) || bodyText.startsWith('_event_')) {
        return endFlow();
      }

      const opcion = obtenerTextoLimpio(bodyText)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      if (opcion.includes('menu') || opcion.includes('princip')) {
        return gotoFlow(menuPrincipalFlow);
      }

      return fallBack('⚠️ Por favor, presiona el botón para regresar.');
    }
  );