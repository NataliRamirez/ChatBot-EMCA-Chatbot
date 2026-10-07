import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { basuraCalleFlow } from '../AseoGeneral/basurasCalleFlow.js';
import { SolicitudPodaFlow } from '../AseoGeneral/SolicitudPodaFlow.js';
import { recolecionEspecialesFlow } from '../AseoGeneral/recolecionEspecialesFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeAseo = '🗑 *GESTIÓN Y REPORTES DE ASEO*\n\nSelecciona una de las siguientes opciones:';
// Botones acortados a <= 20 caracteres
const botones = ['Basura en Calle', 'Solicitud Poda', 'Recolección Esp.'];

export const aseoFlow = addKeyword(['Aseo', 'aseo'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from;
    if (usuariosPausados.has(telefono)) return endFlow();

    await guardarMensaje(
      telefono,
      mensajeAseo,
      'BOT',
      botones,
      null,
      'BOT_TEXTO'
    ).catch(() => {});
  })
  .addAnswer(
    mensajeAseo,
    {
      buttons: [
        { body: 'Basura en Calle' },
        { body: 'Solicitud Poda' },
        { body: 'Recolección Esp.' }
      ],
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

      if (opcion.includes('basura') || opcion.includes('calle')) {
        return gotoFlow(basuraCalleFlow);
      }
      if (opcion.includes('poda') || opcion.includes('solicitud')) {
        return gotoFlow(SolicitudPodaFlow);
      }
      if (opcion.includes('recoleccion') || opcion.includes('esp')) {
        return gotoFlow(recolecionEspecialesFlow);
      }

      const msgError = '⚠️ Selecciona una opción válida usando los botones del menú.';
      return fallBack(msgError);
    }
  );