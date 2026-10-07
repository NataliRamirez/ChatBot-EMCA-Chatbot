import { addKeyword } from '@builderbot/bot';
import { usuariosPausados } from '../../app.js';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';

export const asesorFlow = addKeyword(['Asesor', 'asesor'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from;
    const opcion =obtenerTextoLimpio(ctx);

    // 1. Marcar como pausado en la RAM local
    usuariosPausados.add(telefono);

    // 2. Marcar bot_activo = 0 en la BD MySQL
    try {
      await fetch('http://127.0.0.1:4000/v1/user/pausar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'EmcaSecret2026'
        },
        body: JSON.stringify({ telefono, bot_activo: 0 })
      });
    } catch (e) {
      console.error('❌ Error al pausar bot en BD:', e);
    }

    const mensajePausa = '🙋‍♂️ Un asesor atenderá tu solicitud en breve. El bot ha sido pausado.';
    
    // Guardar la respuesta final del BOT
    await guardarMensaje(telefono, mensajePausa, 'BOT', [], null, 'BOT_TEXTO');

    return endFlow(mensajePausa);
  });