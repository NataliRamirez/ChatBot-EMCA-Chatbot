import { addKeyword, EVENTS } from '@builderbot/bot';
import { guardarMensaje, registrarUsuarioBot } from '../conexionApi.js';
import { conversacionalOrquestadorFlow } from '../conversacionalOrquestador/conversacionalOrquestadorFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeBienvenidaNuevo = `👋 ¡Hola! Bienvenido al sistema de atención virtual de *EMCA*.\n\nPara brindarte una atención personalizada, necesitamos realizar un registro rápido por única vez.\n\nPor favor, escribe tu *Nombre completo*:`;
const mensajePideCedula = `🆔 ¡Gracias! Ahora, ingresa tu número de *Cédula o Documento de Identidad* (sin puntos ni espacios):`;
const mensajePideEmail = `📧 Excelente. Por último, ingresa tu *Correo Electrónico*:`;

const limpiarTelefono = (phone: string): string => {
  if (!phone) return '';
  return String(phone).replace(/@c\.us|@s\.whatsapp.net/g, '').replace(/\D/g, '');
};

const guardarMensajeBackground = (telefono: string, mensaje: string, emisor: string, tipo: string) => {
  Promise.resolve().then(async () => {
    try {
      await guardarMensaje(telefono, mensaje, emisor, [], null, tipo);
    } catch (err: any) {
      console.error(`⚠️ Error guardando mensaje en BG (${emisor}):`, err?.message || err);
    }
  });
};

export const welcomeFlow = addKeyword([EVENTS.WELCOME, 'hola', 'buenas', 'hi', 'hello', 'inicio', 'start'])
  .addAction(async (ctx: any, { gotoFlow, endFlow, state }) => {
    const telefono = limpiarTelefono(ctx.from);
    const bodyText = String(ctx.body || '').trim();

    if (usuariosPausados.has(telefono) || bodyText.startsWith('_event_')) {
      return endFlow();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`http://127.0.0.1:4000/v1/user/${telefono}`, {
        headers: { 'x-api-key': process.env.API_KEY || 'EmcaSecret2026' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const user = await res.json();

        if (Number(user?.bot_activo) === 0) {
          usuariosPausados.add(telefono);
          return endFlow();
        }

        // Si el usuario ya está registrado, va directo al orquestador
        if (user && user.cedula && user.nombre && user.email) {
          const primerNombre = user.nombre.split(' ')[0];
          await state.update({ nombre: primerNombre, cedula: user.cedula, email: user.email, enRegistro: false });
          return gotoFlow(conversacionalOrquestadorFlow);
        }
      }
    } catch (error) {
      console.error('❌ Error/Timeout verificando usuario en welcomeFlow:', error);
    }

    // Marcamos que el usuario inicia el proceso de registro
    await state.update({ enRegistro: true });
  })

  // PASO 1: CAPTURA DE NOMBRE
  .addAnswer(
    mensajeBienvenidaNuevo,
    { capture: true },
    async (ctx: any, { state, fallBack, gotoFlow }: any) => {
      const currentState = state.getMyState() || {};
      
      // Si ya no está en proceso de registro, derivar
      if (currentState.cedula && currentState.email) {
        return gotoFlow(conversacionalOrquestadorFlow);
      }

      const nombreInput = String(ctx.body || '').trim();

      if (!nombreInput || nombreInput.length < 3) {
        return fallBack('Por favor ingresa un nombre válido (mínimo 3 caracteres).');
      }

      await state.update({ nombre: nombreInput });

      guardarMensajeBackground(ctx.from, mensajeBienvenidaNuevo, 'BOT', 'BOT_TEXTO');
     
    }
  )

  // PASO 2: CAPTURA DE CÉDULA
  .addAnswer(
    mensajePideCedula,
    { capture: true },
    async (ctx: any, { state, fallBack }: any) => {
      const rawInput = String(ctx.body || '').trim();
      const cedulaInput = rawInput.replace(/^[0-9]{6,10}$/, '');

      if (!cedulaInput || cedulaInput.length < 5) {
        return fallBack('Por favor ingresa solo los números de tu cédula (mínimo 5 dígitos).');
      }

      // Guardamos la cédula correctamente en el estado
      await state.update({ cedula: cedulaInput });

      guardarMensajeBackground(ctx.from, mensajePideCedula, 'BOT', 'BOT_TEXTO');
      
    }
  )

  // PASO 3: CAPTURA DE CORREO Y REGISTRO FINAL
  .addAnswer(
    mensajePideEmail,
    { capture: true },
    async (ctx: any, { state, fallBack, flowDynamic, gotoFlow }: any) => {
      const emailInput = String(ctx.body || '').trim().toLowerCase();

      const validacionEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


      if (!emailInput || !emailInput.match(validacionEmailRegex)) {
        return fallBack('Por favor ingresa un correo electrónico válido (ejemplo: usuario@gmail.com).');
      
      }

      await state.update({ email: emailInput });
      const userData = state.getMyState() || {};
      const telefono = limpiarTelefono(ctx.from);

      try {
        const resultadoApi: any = await registrarUsuarioBot({
          telefono,
          nombre: userData.nombre,
          cedula: userData.cedula,
          email: userData.email
        });

        if (resultadoApi && resultadoApi.success !== false) {
          const primerNombre = (userData.nombre || '').split(' ')[0];
          await state.update({ nombre: primerNombre, enRegistro: false });

          const mensajeExito = `✅ *¡Registro completado con éxito!*\n\n¡Bienvenido, ${primerNombre}! Es un placer atenderte.`;

          await flowDynamic(mensajeExito);
          guardarMensajeBackground(ctx.from, mensajeExito, 'BOT', 'BOT_TEXTO');

          return gotoFlow(conversacionalOrquestadorFlow);
        } else {
          await state.update({ enRegistro: false });
          return flowDynamic("Hubo un problema procesando tus datos. Por favor, escribe *Hola* para intentar de nuevo.");
        }
      } catch (error) {
        console.error("❌ Error en registro (Timeout/Server):", error);
        await state.update({ enRegistro: false });
        return flowDynamic("Lo siento, el servicio de registro tardó demasiado en responder. Inténtalo más tarde.");
      }
    }
  );