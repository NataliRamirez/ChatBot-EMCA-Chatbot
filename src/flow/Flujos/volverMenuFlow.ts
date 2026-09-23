import { addKeyword } from '@builderbot/bot'
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js'

/**
 * @file volverMenuPrincipalFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de redirigir al usuario hacia el menú principal
 * del chatbot EMCA, permitiendo retornar a las opciones generales de navegación
 * desde cualquier módulo o proceso activo.
 */

export const volverMenuPrincipalFlow = addKeyword([
    '1',
    'volver_menu'
])

.addAction(async (_, { gotoFlow }) => {
  return gotoFlow(menuPrincipalFlow)
})