import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { masOpcionesFlow } from '../MenusPrincipales/masOpcionesFlow.js'
import { usuariosPausados } from '../../app.js'


const mensajeTramites = `📝 *TRÁMITES, SOLICITUDES, PQR Y DERECHOS DE PETICIÓN*
Para más información y poder gestionar su solicitud, le invitamos a ingresar a nuestra página:
🔗 https://www.emca-calarca-quindio.gov.co/peticiones-quejas-reclamos

Allí podrá realizar:
• Peticiones
• Quejas
• Reclamos
• Solicitudes
• Derechos de petición. 
⏳ Tenga en cuenta que cada petición tiene un tiempo de respuesta de *15 días hábiles* después de radicada.`

const botones = ['Más opciones']

export const tramitesFlow = addKeyword(['📝 Trámites y solicitudes', '📝 Trámites'])

  .addAction(async (ctx:any)=>{
     await guardarMensaje(
      ctx.from,
      mensajeTramites,
      'BOT',
      botones
     )
  })
  
  .addAnswer(
    mensajeTramites,
    {
      buttons: [
        { body: 'Más opciones' }
      ],
      capture: true
    },
    async (ctx:any, {gotoFlow, fallBack, endFlow}) =>{
      const telefono = ctx.from;
      const  bodyText = String(ctx.body || '').trim();

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