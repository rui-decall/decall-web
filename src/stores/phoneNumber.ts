import { atom } from 'nanostores'

const PHONE_NUMBER_STORAGE_KEY = 'payphone_caller_phone'

// Load cached phone number from localStorage
const getCachedPhoneNumber = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(PHONE_NUMBER_STORAGE_KEY) || ''
  }
  return ''
}

export const $callerPhoneNumber = atom<string>(getCachedPhoneNumber())

export function setCallerPhoneNumber(phoneNumber: string) {
  $callerPhoneNumber.set(phoneNumber)
  
  // Cache in localStorage
  if (typeof window !== 'undefined') {
    if (phoneNumber) {
      localStorage.setItem(PHONE_NUMBER_STORAGE_KEY, phoneNumber)
    } else {
      localStorage.removeItem(PHONE_NUMBER_STORAGE_KEY)
    }
  }
}
