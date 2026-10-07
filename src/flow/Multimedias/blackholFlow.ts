import { addKeyword, EVENTS } from '@builderbot/bot';
import { usuariosPausados } from '../../app.js';

const limpiarTelefono = (telefono) => {
  if (!telefono) return '';

  return String(telefono)
    .replace(/@c\.us|@s\.whatsapp\.net/g, '')
    .replace(/\D/g, '');
};

export const blackholeFlow = addKeyword([
  EVENTS.WELCOME,
  EVENTS.MEDIA,
  EVENTS.VOICE_NOTE,
  EVENTS.DOCUMENT,
  EVENTS.LOCATION,
  EVENTS.ACTION
])
  .addAction(async (ctx, { endFlow }) => {
    const telefono = limpiarTelefono(ctx?.from);
    const tipoEvento = ctx?.type;

    /*
     * =========================================================
     * 1. SI EL ASESOR TIENE PAUSADO EL BOT
     * =========================================================
     *
     * No debe responder absolutamente nada.
     */
    if (telefono && usuariosPausados.has(telefono)) {
      console.log('');
      console.log('==========================================');
      console.log('🛑 BLACKHOLE - USUARIO EN ATENCIÓN HUMANA');
      console.log(`📱 Teléfono: ${telefono}`);
      console.log(`📨 Evento: ${tipoEvento}`);
      console.log('🚫 Bot detenido para este usuario');
      console.log('==========================================');
      console.log('');

      return endFlow();
    }

    /*
     * =========================================================
     * 2. MULTIMEDIA
     * =========================================================
     *
     * La descarga de multimedia se hace desde main.ts.
     *
     * Aquí únicamente detenemos el flujo para impedir que
     * una imagen, audio, video o documento active nuevamente
     * el menú del chatbot.
     */
    const esMultimedia =
      tipoEvento === EVENTS.MEDIA ||
      tipoEvento === EVENTS.VOICE_NOTE ||
      tipoEvento === EVENTS.DOCUMENT;

    if (esMultimedia) {
      console.log('');
      console.log('==========================================');
      console.log('📎 MULTIMEDIA RECIBIDO');
      console.log(`📱 Teléfono: ${telefono}`);
      console.log(`📨 Evento: ${tipoEvento}`);
      console.log('🚫 No se ejecutarán los flujos del menú');
      console.log('📥 La descarga se procesa desde main.ts');
      console.log('==========================================');
      console.log('');

      return endFlow();
    }

    /*
     * =========================================================
     * 3. UBICACIÓN
     * =========================================================
     */
    if (tipoEvento === EVENTS.LOCATION) {
      console.log(`📍 Ubicación recibida de ${telefono}`);
      return endFlow();
    }

    /*
     * =========================================================
     * 4. TEXTO NORMAL
     * =========================================================
     *
     * Los mensajes de texto continúan normalmente hacia
     * los demás flujos del chatbot.
     */
    return;
  });