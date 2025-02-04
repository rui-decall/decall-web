import { atom } from 'nanostores'

export interface CallState {
  isCalling: boolean
  callStatus: string
  callId: string | null
  agentState: string
}

export const $callState = atom<CallState>({
  isCalling: false,
  callStatus: 'Not started',
  callId: null,
  agentState: 'Idle'
})

// Helper functions to update state
export function setCallState(state: Partial<CallState>) {
  $callState.set({
    ...$callState.get(),
    ...state
  })
} 