import { addKeyword, EVENTS } from '@builderbot/bot';
import { usuariosPausados } from '../../app.js';

/**
 * @file reportesFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de la gestión inicial de reportes de servicios
 * públicos dentro del chatbot EMCA. Permite al usuario seleccionar el área
 * correspondiente para registrar novedades relacionadas con alumbrado público,
 * acueducto, alcantarillado y aseo.
 */

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