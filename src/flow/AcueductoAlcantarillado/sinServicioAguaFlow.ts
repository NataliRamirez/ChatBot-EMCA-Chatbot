import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from '../../app.js';

const mensajeServicioAgua = 'ESTADO Y REACTIVACIÓN DEL SERVICIO ¡Gracias por comunicarte con EMCA! Hemos registrado tu novedad. Si la interrupción del servicio se debe a saldos pendientes, puedes acercarte a nuestra sede comercial para efectuar el pago y solicitar el restablecimiento del agua. Soporte Comercial y Consultas: 302 409 1910 Presiona el botón para volver al menú de opciones:';
const botones = ['Menú principal']


export const sinServicioAguaFlow = addKeyword(['sin_servicio_agua_action', 'falta de agua', 'corte de agua'])
  
.addAction(async (ctx:any) =>{

  await guardarMensaje(
      ctx.from,
      mensajeServicioAgua,
      'BOT',
      botones
  )
})


.addAnswer(
    mensajeServicioAgua,
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

      const msgError = '⚠️ Por favor, presiona el botón para regresar.';
      return fallBack(msgError);
    }
  );