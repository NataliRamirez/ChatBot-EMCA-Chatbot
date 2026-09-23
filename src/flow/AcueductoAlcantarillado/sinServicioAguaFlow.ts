import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from '../../app.js';

const mensajeServicioAgua = '❌ *REPORTAR CORTE O FALTA DE SERVICIO DE AGUA*\n\nTu reporte ha sido ingresado en nuestro sistema. Estamos verificando los sectores afectados. Lo invitamos a sercase a nuestras oficinas para que pueda generar el pago del servicio y asi poder reactivar el servicio \n\nPresiona el botón para regresar al menú principal:';
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