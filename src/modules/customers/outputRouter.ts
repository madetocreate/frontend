import { CustomerActionId } from './types'

export type OutputDestination = 'context' | 'result' | 'activity' | 'tags'

export const getOutputDestination = (actionId: CustomerActionId): OutputDestination => {
  switch (actionId) {
    case 'customers.profileShort':
    case 'customers.suggestTags':
      return 'context'
    default:
      return 'result'
  }
}
