import { addKeyword } from '@builderbot/bot'
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js'

export const volverMenuPrincipalFlow = addKeyword([
    '1',
    'volver_menu'
])

.addAction(async (_, { gotoFlow }) => {
  return gotoFlow(menuPrincipalFlow)
})