import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeLuminariaEncendida = 'LUMINARIA ENCENDIDA DE DÍA Hemos registrado tu reporte. Para ayudarnos a cuidar la energía y agilizar la inspección técnica del sector, te invitamos a enviar la dirección exacta o punto de referencia a nuestras líneas de atención: Líneas de Soporte Técnico: 302 409 1910';
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