import { addKeyword, EVENTS } from '@builderbot/bot';

import {
  guardarMensaje,
  registrarUsuarioBot
} from '../conexionApi.js';

import { conversacionalOrquestadorFlow } from '../conversacionalOrquestador/conversacionalOrquestadorFlow.js';

import { usuariosPausados } from '../../app.js';

/**
 * @file welcomeFlow.ts
 * @author Juan David Nieto
 * @description
 * Flujo de bienvenida y registro inicial del chatbot de EMCA.
 *
 * Se encarga de:
 * - Verificar si el usuario ya existe.
 * - Validar si el bot está activo para el usuario.
 * - Solicitar nombre completo.
 * - Solicitar cédula.
 * - Solicitar correo electrónico.
 * - Registrar al usuario en la API.
 * - Redirigir al flujo conversacional principal.
 */

// =========================================================
// MENSAJES
// =========================================================

const mensajeBienvenidaNuevo = `
👋 ¡Hola! Bienvenido al sistema de atención virtual de *EMCA*.

Para brindarte una atención personalizada, necesitamos realizar un registro rápido por única vez.

Por favor, escribe tu *Nombre completo*:
`;

const mensajePideCedula = `
🆔 ¡Gracias! Ahora, ingresa tu número de *Cédula o Documento de Identidad* (sin puntos ni espacios):
`;

const mensajePideEmail = `
📧 Excelente. Por último, ingresa tu *Correo Electrónico*:
`;

// =========================================================
// UTILIDADES
// =========================================================

const limpiarTelefono = (phone: string): string => {
  if (!phone) return '';

  return String(phone)
    .replace(/@c\.us|@s\.whatsapp\.net/g, '')
    .replace(/\D/g, '');
};

// =========================================================
// GUARDAR MENSAJES EN SEGUNDO PLANO
// =========================================================

const guardarMensajeBackground = (
  telefono: string,
  mensaje: string,
  emisor: string,
  tipo: string
) => {
  Promise.resolve().then(async () => {
    try {
      await guardarMensaje(
        telefono,
        mensaje,
        emisor,
        [],
        null,
        tipo
      );
    } catch (err: any) {
      console.error(
        `⚠️ Error guardando mensaje en BG (${emisor}):`,
        err?.message || err
      );
    }
  });
};

// =========================================================
// FLUJO DE BIENVENIDA
// =========================================================

export const welcomeFlow = addKeyword([
  EVENTS.WELCOME,
  'hola',
  'buenas',
  'hi',
  'hello',
  'inicio',
  'start'
])

  // =========================================================
  // VERIFICAR SI EL USUARIO YA ESTÁ REGISTRADO
  // =========================================================

  .addAction(
    async (ctx: any, { gotoFlow, endFlow, state }: any) => {
      const telefono = limpiarTelefono(ctx.from);
      const bodyText = String(ctx.body || '').trim();

      // -----------------------------------------------------
      // VERIFICAR USUARIOS PAUSADOS
      // -----------------------------------------------------

      if (
        usuariosPausados.has(telefono) ||
        bodyText.startsWith('_event_')
      ) {
        return endFlow();
      }

      try {
        // ---------------------------------------------------
        // CONSULTAR USUARIO EN LA API
        // ---------------------------------------------------

        const controller = new AbortController();

        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 2000);

        const res = await fetch(
          `http://127.0.0.1:4000/v1/user/${telefono}`,
          {
            headers: {
              'x-api-key':
                process.env.API_KEY || 'EmcaSecret2026'
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        // ---------------------------------------------------
        // USUARIO ENCONTRADO
        // ---------------------------------------------------

        if (res.ok) {
          const user = await res.json();

          // -----------------------------------------------
          // BOT DESACTIVADO
          // -----------------------------------------------

          if (Number(user?.bot_activo) === 0) {
            usuariosPausados.add(telefono);

            return endFlow();
          }

          // -----------------------------------------------
          // USUARIO COMPLETAMENTE REGISTRADO
          // -----------------------------------------------

          if (
            user &&
            user.cedula &&
            user.nombre &&
            user.email
          ) {
            const primerNombre = String(user.nombre)
              .split(' ')[0];

            await state.update({
              nombre: primerNombre,
              cedula: user.cedula,
              email: user.email,
              enRegistro: false
            });

            return gotoFlow(
              conversacionalOrquestadorFlow
            );
          }
        }
      } catch (error) {
        console.error(
          '❌ Error/Timeout verificando usuario en welcomeFlow:',
          error
        );
      }

      // -----------------------------------------------------
      // EL USUARIO NO ESTÁ REGISTRADO
      // -----------------------------------------------------

      await state.update({
        enRegistro: true
      });
    }
  )

  // =========================================================
  // PASO 1: CAPTURA DEL NOMBRE
  // =========================================================

  .addAnswer(
    mensajeBienvenidaNuevo,
    {
      capture: true
    },
    async (
      ctx: any,
      { state, fallBack }: any
    ) => {
      const currentState =
        state.getMyState() || {};

      // -----------------------------------------------------
      // SI YA ESTÁ REGISTRADO, NO VOLVER A REGISTRAR
      // -----------------------------------------------------

      if (
        currentState.cedula &&
        currentState.email
      ) {
        return;
      }

      const nombreInput = String(
        ctx.body || ''
      ).trim();

      // -----------------------------------------------------
      // VALIDAR NOMBRE
      // -----------------------------------------------------

      if (
        !nombreInput ||
        nombreInput.length < 3
      ) {
        return fallBack(
          '⚠️ Por favor ingresa un nombre válido (mínimo 3 caracteres).'
        );
      }

      // -----------------------------------------------------
      // GUARDAR NOMBRE
      // -----------------------------------------------------

      await state.update({
        nombre: nombreInput
      });

      guardarMensajeBackground(
        ctx.from,
        mensajeBienvenidaNuevo,
        'BOT',
        'BOT_TEXTO'
      );
    }
  )

  // =========================================================
  // PASO 2: CAPTURA DE CÉDULA
  // =========================================================

  .addAnswer(
    mensajePideCedula,
    {
      capture: true
    },
    async (
      ctx: any,
      { state, fallBack }: any
    ) => {
      const rawInput = String(
        ctx.body || ''
      ).trim();

      // -----------------------------------------------------
      // LIMPIAR CÉDULA
      // -----------------------------------------------------

      const cedulaLimpia = rawInput.replace(
        /[\s.-]/g,
        ''
      );

      // -----------------------------------------------------
      // VALIDAR CÉDULA
      // Entre 5 y 10 dígitos
      // -----------------------------------------------------

      const cedulaValidaRegex =
        /^[0-9]{5,10}$/;

      if (
        !cedulaValidaRegex.test(
          cedulaLimpia
        )
      ) {
        return fallBack(
          '⚠️ Número de cédula inválido. Por favor ingresa solo números (de 5 a 10 dígitos, sin puntos ni comas).'
        );
      }

      // -----------------------------------------------------
      // GUARDAR CÉDULA
      // -----------------------------------------------------

      await state.update({
        cedula: cedulaLimpia
      });

      guardarMensajeBackground(
        ctx.from,
        mensajePideCedula,
        'BOT',
        'BOT_TEXTO'
      );
    }
  )

  // =========================================================
  // PASO 3: CAPTURA DE EMAIL
  // =========================================================

  .addAnswer(
    mensajePideEmail,
    {
      capture: true
    },
    async (
      ctx: any,
      {
        state,
        fallBack,
        flowDynamic,
        gotoFlow
      }: any
    ) => {
      const emailInput = String(
        ctx.body || ''
      )
        .trim()
        .toLowerCase();

      // -----------------------------------------------------
      // VALIDAR EMAIL
      // -----------------------------------------------------

      const validacionEmailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (
        !emailInput ||
        !validacionEmailRegex.test(
          emailInput
        )
      ) {
        return fallBack(
          '⚠️ Correo electrónico inválido. Por favor ingresa una dirección válida (ejemplo: usuario@gmail.com).'
        );
      }

      // -----------------------------------------------------
      // GUARDAR EMAIL
      // -----------------------------------------------------

      await state.update({
        email: emailInput
      });

      // -----------------------------------------------------
      // OBTENER TODOS LOS DATOS
      // -----------------------------------------------------

      const userData =
        state.getMyState() || {};

      const telefono = limpiarTelefono(
        ctx.from
      );

      // -----------------------------------------------------
      // VERIFICACIÓN FINAL
      // -----------------------------------------------------

      if (
        !userData.nombre ||
        !userData.cedula ||
        !userData.email
      ) {
        return fallBack(
          '⚠️ Faltan datos obligatorios para el registro. Por favor escribe tu correo electrónico nuevamente:'
        );
      }

      try {
        // ===================================================
        // REGISTRAR USUARIO EN LA API
        // ===================================================

        const resultadoApi: any =
          await registrarUsuarioBot({
            telefono,
            nombre: userData.nombre,
            cedula: userData.cedula,
            email: userData.email
          });

        // ===================================================
        // REGISTRO EXITOSO
        // ===================================================

        if (
          resultadoApi &&
          resultadoApi.success !== false
        ) {
          const primerNombre =
            String(userData.nombre)
              .split(' ')[0];

          await state.update({
            nombre: primerNombre,
            enRegistro: false
          });

          const mensajeExito = `
✅ *¡Registro completado con éxito!*

¡Bienvenido, ${primerNombre}! Es un placer atenderte.
`;

          await flowDynamic(
            mensajeExito
          );

          guardarMensajeBackground(
            ctx.from,
            mensajeExito,
            'BOT',
            'BOT_TEXTO'
          );

          // -----------------------------------------------
          // IR AL ORQUESTADOR PRINCIPAL
          // -----------------------------------------------

          return gotoFlow(
            conversacionalOrquestadorFlow
          );
        }

        // ===================================================
        // ERROR DE REGISTRO
        // ===================================================

        await state.update({
          enRegistro: false
        });

        return flowDynamic(
          '❌ Hubo un problema al guardar tus datos en el servidor. Por favor, escribe *Hola* para reiniciar el registro.'
        );

      } catch (error) {
        // ===================================================
        // ERROR DE API
        // ===================================================

        console.error(
          '❌ Error en registro API:',
          error
        );

        await state.update({
          enRegistro: false
        });

        return flowDynamic(
          '⚠️ Ocurrió un error con el servidor durante el registro. Escribe *Hola* para reintentar.'
        );
      }
    }
  );

