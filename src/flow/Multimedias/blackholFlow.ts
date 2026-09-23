import { addKeyword, EVENTS } from '@builderbot/bot';
import { usuariosPausados } from '../../app.js';

export const blackholeFlow = addKeyword([
  EVENTS.WELCOME,
  EVENTS.MEDIA,
  EVENTS.VOICE_NOTE,
  EVENTS.DOCUMENT,
  EVENTS.LOCATION,
  EVENTS.ACTION
])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = String(ctx.from || '').replace(/\D/g, '');

    // Si el usuario está pausado por estar con un asesor humano:
    if (usuariosPausados.has(telefono)) {
      // Finaliza el flujo inmediatamente sin enviar ninguna respuesta automática
      return endFlow();
    }
  });