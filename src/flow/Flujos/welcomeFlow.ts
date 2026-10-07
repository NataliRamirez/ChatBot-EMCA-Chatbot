import { addKeyword, EVENTS } from '@builderbot/bot';
import { guardarMensaje, registrarUsuarioBot } from '../conexionApi.js';
import { conversacionalOrquestadorFlow } from '../conversacionalOrquestador/conversacionalOrquestadorFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeBienvenidaNuevo = `👋 ¡Hola! Bienvenido al sistema de atención virtual de *EMCA*.\n\nPara brindarte una atención personalizada, necesitamos realizar un registro rápido por única vez.\n\nPor favor, escribe tu *Nombre completo*:`;
const mensajePideCedula = `🆔 ¡Gracias! Ahora, ingresa tu número de *Cédula o Documento de Identidad* (solo números, sin puntos ni espacios):`;
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

        // Si el usuario ya está totalmente registrado en BD, va directo al orquestador
        if (user && user.cedula && user.nombre && user.email) {
          const primerNombre = user.nombre.split(' ')[0];
          await state.update({ nombre: primerNombre, cedula: user.cedula, email: user.email, enRegistro: false });
          return gotoFlow(conversacionalOrquestadorFlow);
        }
      }
    } catch (error) {
      console.error('❌ Error/Timeout verificando usuario en welcomeFlow:', error);
    }

    // Marcamos el inicio del proceso de registro
    await state.update({ enRegistro: true });
  })

  // ==========================================
  // PASO 1: CAPTURA OBLIGATORIA DE NOMBRE
  // ==========================================
  .addAnswer(
    mensajeBienvenidaNuevo,
    { capture: true },
    async (ctx: any, { state, fallBack, gotoFlow }: any) => {
      const currentState = state.getMyState() || {};
      
      if (currentState.cedula && currentState.email) {
        return gotoFlow(conversacionalOrquestadorFlow);
      }

      const nombreInput = String(ctx.body || '').trim();

      // Validación: Mínimo 3 letras y no puede contener solo números
      if (!nombreInput || nombreInput.length < 3 || /^\d+$/.test(nombreInput)) {
        return fallBack('⚠️ Por favor ingresa un nombre y apellido válido (mínimo 3 caracteres, sin números).');
      }

      await state.update({ nombre: nombreInput });
      guardarMensajeBackground(ctx.from, mensajeBienvenidaNuevo, 'BOT', 'BOT_TEXTO');
    }
  )

  // ==========================================
  // PASO 2: CAPTURA OBLIGATORIA DE CÉDULA
  // ==========================================
  .addAnswer(
    mensajePideCedula,
    { capture: true },
    async (ctx: any, { state, fallBack }: any) => {
      const rawInput = String(ctx.body || '').trim();
      
      // Sanitizamos quitando espacios o puntos adicionales que escriba el usuario
      const cedulaLimpia = rawInput.replace(/[\s.-]/g, '');

      // Regex: Debe ser numérico y tener entre 5 y 10 dígitos (ajustable según requerimiento)
      const cedulaValidaRegex = /^[0-9]{5,10}$/;

      if (!cedulaValidaRegex.test(cedulaLimpia)) {
        return fallBack('⚠️ Número de cédula inválido. Por favor ingresa solo números (de 5 a 10 dígitos, sin puntos ni comas).');
      }

      // Guardamos la cédula limpia en el estado
      await state.update({ cedula: cedulaLimpia });
      guardarMensajeBackground(ctx.from, mensajePideCedula, 'BOT', 'BOT_TEXTO');
    }
  )

  // ==========================================
  // PASO 3: CAPTURA OBLIGATORIA DE EMAIL Y REGISTRO FINAL
  // ==========================================
  .addAnswer(
    mensajePideEmail,
    { capture: true },
    async (ctx: any, { state, fallBack, flowDynamic, gotoFlow }: any) => {
      const emailInput = String(ctx.body || '').trim().toLowerCase();

      // Expressión regular estándar para correos
      const validacionEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!emailInput || !validacionEmailRegex.test(emailInput)) {
        return fallBack('⚠️ Correo electrónico inválido. Por favor ingresa una dirección válida (ejemplo: usuario@gmail.com).');
      }

      await state.update({ email: emailInput });
      
      const userData = state.getMyState() || {};
      const telefono = limpiarTelefono(ctx.from);

      // Verificación de seguridad extra antes de llamar a la API
      if (!userData.nombre || !userData.cedula || !userData.email) {
        return fallBack('Faltan datos obligatorios para el registro. Por favor escribe tu correo electrónico nuevamente:');
      }

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

          // Pasa al menú / orquestador principal
          return gotoFlow(conversacionalOrquestadorFlow);
        } else {
          await state.update({ enRegistro: false });
          return flowDynamic("❌ Hubo un problema al guardar tus datos en el servidor. Por favor, escribe *Hola* para reiniciar el registro.");
        }
      } catch (error) {
        console.error("❌ Error en registro API:", error);
        await state.update({ enRegistro: false });
        return flowDynamic("⚠️ Ocurrió un error con el servidor durante el registro. Escribe *Hola* para reintentar.");
      }
    }
  );