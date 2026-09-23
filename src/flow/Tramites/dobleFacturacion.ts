import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { masOpcionesFlow } from '../MenusPrincipales/masOpcionesFlow.js'
import { usuariosPausados } from '../../app.js'

const mensajeDobleFact = `📄 *DOBLE FACTURACIÓN*\n\nSi te llegó un cobro duplicado en tu factura, por favor ten a la mano el número de cuenta contrato y acércate a nuestras oficinas ubicadas en 🕒 Lunes a Viernes: 7:30 a.m. - 5:30 p.m.\n📍 Dirección: Carrera 24 #39-54 o envía una solicitud formal con el número de predio a los siguientes numeros de telefono  3024091910 o el 3024091899.`
const botonesRetorno = ['Más opciones']

export const dobleFacturacionFlow = addKeyword(['DOBLE_FACTURACION_FLOW', '📄 Doble facturación'])
  
.addAction(async (ctx: any) => {

    await guardarMensaje(
      ctx.from, 
      mensajeDobleFact, 
      'BOT', 
      botonesRetorno
    )

  })
  .addAnswer(
    mensajeDobleFact,
    {
      buttons: [
        { body: 'Más opciones' }
      ],
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
             return gotoFlow(masOpcionesFlow);
           }
     
           const msgError = '⚠️ Por favor, presiona el botón para regresar.';
           return fallBack(msgError);
         }
  )