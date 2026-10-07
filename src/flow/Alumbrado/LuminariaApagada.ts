import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeLuminariaApagada = 'REPORTE DE ALUMBRADO PÚBLICO Hemos registrado tu novedad sobre la luminaria apagada. Para coordinar la inspección con nuestro equipo técnico, te invitamos a comunicarte o enviar los detalles de la ubicación a nuestras líneas de atención: Líneas de Atención Técnica: 302 409 1910';
const botones = [ 'Menú principal' ]

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