import { addKeyword, EVENTS } from '@builderbot/bot';

import { usuariosPausados } from '../../app.js';

/**
 * @file blackholFlow.ts
 * @author Juan David Nieto
 * @description
 * Flujo encargado de interceptar eventos que no deben continuar
 * hacia los demás flujos del chatbot.
 *
 * Funcionalidades:
 * - Detener el bot cuando un usuario está siendo atendido por un asesor.
 * - Evitar que multimedia active nuevamente el menú.
 * - Interceptar ubicaciones.
 * - Permitir que los mensajes de texto continúen normalmente.
 */

// =========================================================
// LIMPIAR TELÉFONO
// =========================================================

const limpiarTelefono = (telefono: string): string => {
  if (!telefono) return '';

  return String(telefono)
    .replace(/@c\.us|@s\.whatsapp\.net/g, '')
    .replace(/\D/g, '');
};

// =========================================================
// BLACKHOLE FLOW
// =========================================================

export const blackholeFlow = addKeyword([
  EVENTS.WELCOME,
  EVENTS.MEDIA,
  EVENTS.VOICE_NOTE,
  EVENTS.DOCUMENT,
  EVENTS.LOCATION,
  EVENTS.ACTION
])

  // =======================================================
  // CONTROL PRINCIPAL
  // =======================================================

  .addAction(
    async (ctx: any, { endFlow }: any) => {
      const telefono = limpiarTelefono(ctx?.from);
      const tipoEvento = ctx?.type;

      // =====================================================
      // 1. USUARIO CON ATENCIÓN HUMANA
      // =====================================================
      //
      // Si el usuario está siendo atendido por un asesor,
      // el chatbot no debe responder automáticamente.
      //

      if (
        telefono &&
        usuariosPausados.has(telefono)
      ) {
        console.log('');
        console.log('==========================================');
        console.log(
          '🛑 BLACKHOLE - USUARIO EN ATENCIÓN HUMANA'
        );
        console.log(`📱 Teléfono: ${telefono}`);
        console.log(`📨 Evento: ${tipoEvento}`);
        console.log(
          '🚫 Bot detenido para este usuario'
        );
        console.log('==========================================');
        console.log('');

        return endFlow();
      }

      // =====================================================
      // 2. MULTIMEDIA
      // =====================================================
      //
      // La descarga de multimedia se procesa desde main.ts.
      //
      // Aquí solamente detenemos el flujo para evitar que
      // una imagen, audio, video o documento active otros
      // flujos del chatbot.
      //

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
        console.log(
          '🚫 No se ejecutarán los flujos del menú'
        );
        console.log(
          '📥 La descarga se procesa desde main.ts'
        );
        console.log('==========================================');
        console.log('');

        return endFlow();
      }

      // =====================================================
      // 3. UBICACIÓN
      // =====================================================

      if (
        tipoEvento === EVENTS.LOCATION
      ) {
        console.log(
          `📍 Ubicación recibida de ${telefono}`
        );

        return endFlow();
      }

      // =====================================================
      // 4. EVENTOS DE ACCIÓN
      // =====================================================

      if (
        tipoEvento === EVENTS.ACTION
      ) {
        console.log(
          `⚡ Acción recibida de ${telefono}`
        );

        return endFlow();
      }

      // =====================================================
      // 5. TEXTO NORMAL
      // =====================================================
      //
      // Si no es multimedia, ubicación, acción ni usuario
      // pausado, no hacemos nada y permitimos que los demás
      // flujos continúen.
      //

      return;
    }
  );

