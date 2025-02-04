import { map } from 'nanostores'

export interface RetellVariables {
  [key: string]: string
}

export const $retellVariables = map<RetellVariables>({})

// Helper functions to manipulate the store
export function setVariable(key: string, value: string) {
  $retellVariables.setKey(key, value)
}

export function removeVariable(key: string) {
  $retellVariables.setKey(key, undefined)
} 