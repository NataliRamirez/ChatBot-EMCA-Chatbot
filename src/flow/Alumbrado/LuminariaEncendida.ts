import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeLuminariaEncendida = '💡 *REPORTAR LUMINARIA ENCENDIDA DE DÍA*\n\nHemos registrado tu reporte de falla en el alumbrado público. Por eso lo invitamos a realizar el reporte al siguiente numero telefonico 3024091910 o el 3024091899 y nuestro equipo técnico procederá a verificar el sector.\n\nPresiona el botón para volver al menú principal:';
const botonesLuminaria = ['Menú principal'];

export const LuminariaEncendidaFlow = addKeyword([
  'luminaria encendida', 
  'encendida', 
  '💡 Luz Encendida', 
  'luz encendida'
])
  .addAction(async (ctx: any) => {
    // Registrar inmediatamente cuando el bot envía la respuesta
    await guardarMensaje(
      ctx.from, 
      mensajeLuminariaEncendida, 
      'BOT', 
      botonesLuminaria, 
      null, 
      'BOT_BOTONES'
    ).catch(() => {});
  })
  .addAnswer(
    mensajeLuminariaEncendida,
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