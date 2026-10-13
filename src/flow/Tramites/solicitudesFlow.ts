import { addKeyword } from "@builderbot/bot";
import {
  guardarMensaje,
  obtenerTextoLimpio
} from "../conexionApi.js";

import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from "../../app.js";

const botones = ["Menú principal"];

const mensajeSolicitudes = `MÁS INFORMACIÓN Y GESTIÓN DE SOLICITUDES

Para consultar más información o realizar un trámite formal, te invitamos a ingresar a nuestro portal web oficial (Trámites, Solicitudes, PQR y Derechos de Petición):

https://www.emca-calarca-quindio.gov.co/peticiones-quejas-reclamos

Tener en cuenta: Cada petición formal tiene un tiempo de respuesta de hasta 15 días hábiles a partir de la fecha de radicación.

Haz clic en el botón de abajo para regresar:`;

export const SolicitudesFlow = addKeyword(["Solicitudes"])

  // =====================================================
  // MOSTRAR MENSAJE
  // =====================================================
  .addAction(async (ctx: any) => {

    await guardarMensaje(
      ctx.from,
      mensajeSolicitudes,
      "BOT",
      botones
    );

  })

  // =====================================================
  // BOTÓN MENÚ PRINCIPAL
  // =====================================================
  .addAnswer(
    mensajeSolicitudes,
    {
      buttons: [
        {
          body: "Menú principal"
        }
      ],
      capture: true
    },

    async (
      ctx: any,
      {
        gotoFlow,
        fallBack,
        endFlow
      }
    ) => {

      const telefono = ctx.from;

      const bodyText = String(
        ctx.body || ""
      ).trim();

      console.log(
        "📱 Respuesta Solicitudes:",
        bodyText
      );

      // =================================================
      // USUARIO PAUSADO
      // =================================================

      if (
        usuariosPausados.has(telefono) ||
        bodyText.startsWith("_event_")
      ) {
        return endFlow();
      }

      // =================================================
      // LIMPIAR TEXTO
      // =================================================

      const opcion = obtenerTextoLimpio(bodyText)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      console.log(
        "🔎 Opción detectada:",
        opcion
      );

      // =================================================
      // MENÚ PRINCIPAL
      // =================================================

      if (
        opcion === "menu principal" ||
        opcion === "menu" ||
        opcion.includes("menu principal") ||
        opcion.includes("principal")
      ) {

        console.log(
          "🏠 Regresando al menú principal..."
        );

        return gotoFlow(
          menuPrincipalFlow
        );
      }

      // =================================================
      // RESPUESTA NO VÁLIDA
      // =================================================

      return fallBack(
        "⚠️ Por favor, presiona el botón *Menú principal* para regresar."
      );
    }
  );