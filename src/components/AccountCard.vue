<template>
    <div class="account-card-container" :class="$attrs.class">
        <div class="w-full bg-stone-800 rounded-xl border border-white/20 relative">
            <!-- Add close button at the top level of the component -->
            <button 
                v-if="showCloseButton"
                @click="$emit('close')" 
                class="absolute top-4 right-4 text-white/70 hover:text-white focus:outline-none z-10"
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <!-- Phone Number Entry State -->
            <div v-if="currentState === 'phone'" class="p-6">
                <h3 class="text-white text-2xl font-bold mb-2">Welcome</h3>
                <p class="text-white/50 text-sm mb-4">Enter your phone number to continue</p>

                <div class="space-y-4">
                    <div class="w-full">
                        <Label class="pr-2" for="phone">Phone Number</Label>
                        <IntlTelInput :options="{
                            initialCountry: 'us',
                            customContainer: 'w-full mt-2',
                        }" class="tel-input-custom border w-full" @changeNumber="phoneNumber = $event" @changeValidity="isValid = $event"
                            @changeErrorCode="errorCode = $event" />
                    </div>

                    <!-- reCAPTCHA container (required by Firebase) -->
                    <div id="recaptcha-container"></div>

                    <form @submit.prevent="handlePhoneSubmit" class="flex justify-end">
                        <Button type="submit" class="bg-stone-900 border-white/20"
                            :disabled="isLoading || !isValid">
                            <span class="flex items-center">
                                <span v-if="isLoading" class="mr-2 h-4 w-4 animate-spin">
                                    <Loader2 class="h-4 w-4" />
                                </span>
                                {{ isLoading ? 'Checking...' : 'Next' }}
                                <ChevronRight v-if="!isLoading" class="ml-2 h-4 w-4" />
                            </span>
                        </Button>
                    </form>
                </div>
            </div>

            <!-- OTP state -->
            <div v-if="currentState === 'otp'" class="p-6">
                <h3 class="text-white text-2xl font-bold mb-2">Verify Phone</h3>
                <p class="text-white/50 text-sm mb-4">Enter the verification code sent to your phone</p>

                <div class="space-y-4">
                    <div>
                        <Label for="otp">Verification Code</Label>
                        <div class="mt-2 flex gap-2 justify-center">
                            <input v-for="(digit, index) in 6" :key="index" :ref="el => otpInputs[index] = el"
                                v-model="otpDigits[index]" type="text" maxlength="1"
                                class="w-12 h-12 text-center bg-stone-800 border border-white/20 rounded-md text-white text-xl focus:border-blue-500/50 focus:outline-none"
                                @input="handleOtpInput(index)" @keydown="handleOtpKeydown($event, index)"
                                @keyup.enter="isOtpComplete && verifyOtp()" @paste="handleOtpPaste" />
                        </div>
                    </div>

                    <div class="text-center">
                        <button @click="resendOtp" :disabled="resendTimer > 0"
                            class="text-sm text-blue-400 hover:text-blue-300 disabled:text-white/30">
                            {{ resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code' }}
                        </button>
                    </div>
                    
                    <div class="flex justify-between">
                        <Button variant="ghost" class="border-white/20" @click="currentState = 'phone'">
                            <ChevronLeft class="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button class="bg-stone-900 border-white/20" @click="verifyOtp"
                            :disabled="isVerifying || !isOtpComplete">
                            <span class="flex items-center">
                                <span v-if="isVerifying" class="mr-2 h-4 w-4 animate-spin">
                                    <Loader2 class="h-4 w-4" />
                                </span>
                                {{ isVerifying ? 'Verifying...' : 'Verify' }}
                                <ChevronRight v-if="!isVerifying" class="ml-2 h-4 w-4" />
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Register State -->
            <div v-if="currentState === 'register'" class="p-6">
                <h3 class="text-white text-2xl font-bold mb-2">Register</h3>
                <p class="text-white/50 text-sm mb-4">Create a new account using your phone number</p>

                <div class="space-y-4">
                    <form @submit.prevent="handleRegister">
                        <div>
                            <Label for="name">Name</Label>
                            <Input class="mt-2 bg-stone-800 border-white/20" id="name" v-model="name"
                                placeholder="Enter name" @keyup.enter="handleRegister" />
                        </div>
                    </form>
                    
                    <div class="flex justify-end">
                        <Button class="bg-stone-900 border-white/20" @click="handleRegister" :disabled="isRegistering">
                            <span class="flex items-center">
                                <span v-if="isRegistering" class="mr-2 h-4 w-4 animate-spin">
                                    <Loader2 class="h-4 w-4" />
                                </span>
                                {{ isRegistering ? 'Creating Account...' : 'Register' }}
                                <ChevronRight v-if="!isRegistering" class="ml-2 h-4 w-4" />
                            </span>
                        </Button>
                    </div>
                </div>
            </div>

            <!-- Welcome Back State -->
            <div v-if="currentState === 'welcome'" class="p-6 flex flex-col items-center justify-center">
                <h3 class="text-white text-2xl font-bold mb-2">Welcome Back!</h3>
                <p class="text-white/50 text-sm mb-4">{{ name }}</p>
                
                <div class="flex flex-col items-center gap-2">
                    <span class="loading loading-spinner loading-md"></span>
                    <p class="text-white/70">Logging you in...</p>
                </div>
            </div>

            <!-- Account State - Horizontal Layout -->
            <div v-if="currentState === 'account'" class="flex flex-col md:flex-row">
                <!-- User Info Section -->
                <div class="p-6 border-b md:border-b-0 md:border-r border-white/20 md:w-1/3">
                    <div class="flex flex-col">
                        <h3 class="text-white text-2xl font-bold mb-1">{{ name }}</h3>
                        <div class="flex items-center gap-2 text-white/50 mb-4">
                            <Phone class="w-3 h-3" />
                            <p class="text-sm">{{ phoneNumber }}</p>
                        </div>
                        <Button variant="outline" size="sm"
                            class="text-red-400 hover:text-red-300 border-red-500/50 hover:border-red-500 hover:bg-red-500/10 w-full"
                            @click="handleSignOut">
                            <LogOut class="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
                
                <!-- Wallet Section -->
                <div class="p-6 flex-1">
                    <div class="space-y-6">
                        <!-- Wallet Balance -->
                        <div class="text-center relative">
                            <p class="text-white/50 text-sm">Wallet Balance</p>
                            <div class="flex items-center justify-center gap-2">
                                <p class="text-white text-xl font-bold">{{ Math.round(balance * 100000) / 100000 }} ETH</p>
                                <button 
                                    @click="refreshBalance" 
                                    class="text-white/50 hover:text-white/80 transition-colors p-1 rounded-full hover:bg-white/10"
                                    :class="{'animate-spin': isRefreshing}"
                                    :disabled="isRefreshing"
                                >
                                    <RefreshCw class="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <!-- QR Code and Address -->
                        <div class="flex flex-col items-center space-y-4">
                            <img :src="qrCode" alt="Wallet QR Code" class="w-32 h-32 bg-white rounded-xl" />

                            <div class="w-full py-2 px-4 bg-stone-800/50 rounded-lg border border-white/10">
                                <div class="flex items-center justify-between mb-2">
                                    <p class="text-white/50 text-sm">Wallet Address</p>
                                    <Button variant="ghost" size="icon" class="text-white/70 hover:text-white"
                                        @click="copyAddress">
                                        <Copy class="w-4 h-4" />
                                    </Button>
                                </div>
                                <p class="text-white/90 text-sm font-mono break-all">
                                    {{ walletAddress }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="relative z-[999]">
            <Toaster richColors closeButton />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, useAttrs } from 'vue'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    ChevronRight,
    Copy,
    LogOut,
    Phone,
    Loader2,
    SaveAll,
    ChevronLeft,
    RefreshCw
} from 'lucide-vue-next'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useClipboard } from '@vueuse/core'
import CallCard from './CallCard.vue'
import IntlTelInput from "intl-tel-input/vueWithUtils";
import "intl-tel-input/styles";
import { toast, Toaster } from 'vue-sonner'
import posthog from 'posthog-js'
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebase'

// Add prop for showCloseButton
const props = defineProps({
    showCloseButton: {
        type: Boolean,
        default: true
    }
})

// Explicitly handle attributes
defineOptions({
    inheritAttrs: false
})

const currentState = ref('phone')
const phoneNumber = ref('')
const name = ref('')
const walletAddress = ref('')
const balance = ref(0)
const isRefreshing = ref(false)

// const supabaseWallet = ref(null)
const accountView = ref('wallet')
const isValid = ref(false)
const errorCode = ref(null)

const { copy } = useClipboard()

import { createClient } from '@supabase/supabase-js'
import { http, createConfig, getBalance } from '@wagmi/core'
import { formatEther, parseEther } from 'viem'
import { base } from '@wagmi/core/chains'
const wagmiConfig = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(),
    },
})
// Initialize Supabase client
// const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
// if (!supabaseUrl || !supabaseAnonKey) {
//     throw new Error('Missing Supabase environment variables')
// }
// const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { setVariable } from '../stores/retellVariables'

const STORAGE_KEY = 'payphone_user'
const AUTH_KEY = 'payphone_auth'


// Add auto-login check
onMounted(async () => {
    const savedAuth = localStorage.getItem(AUTH_KEY)
    if (savedAuth) {
        console.log('savedAuth', savedAuth)
        currentState.value = 'welcome'
        await getUser()
        if (name.value) {
            transitionToAccount()
        } else {
            currentState.value = 'register'
        }
    }

    // Initialize Firebase reCAPTCHA verifier
    try {
        recaptchaVerifier.value = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved, allow signInWithPhoneNumber
                console.log('reCAPTCHA solved')
            }
        })
    } catch (error) {
        console.error('Error initializing reCAPTCHA:', error)
    }
})

// Generate QR code for wallet address
const qrCode = useQRCode(walletAddress)

const isLoading = ref(false)
const isRegistering = ref(false)

const transitionToAccount = () => {
    setTimeout(() => {
        currentState.value = 'account'
    }, 2000) // 2 second delay to show loading state
}

async function requestOtp() {
    if (!recaptchaVerifier.value) {
        throw new Error('reCAPTCHA not initialized')
    }

    // Use Firebase phone authentication
    return signInWithPhoneNumber(auth, phoneNumber.value, recaptchaVerifier.value)
}

const handlePhoneSubmit = async () => {
    if (isLoading.value) return

    try {
        isLoading.value = true

        // Send verification code via Firebase
        confirmationResult.value = await requestOtp()

        // Track OTP requested event
        posthog.capture('otp_requested', {
            phone_number_provided: true,
            method: 'firebase'
        })

        currentState.value = 'otp'
        startResendTimer()

        toast.success("Verification code sent", {
            description: "Check your phone for the code",
            duration: 3000,
        })
    } catch (error) {
        console.error('Error sending OTP:', error)

        // Track OTP request failure
        posthog.capture('otp_request_failed', {
            error: error.message,
            error_code: error.code,
            method: 'firebase'
        })

        // Handle specific Firebase errors
        let errorMessage = "Failed to send verification code"
        let errorDescription = error.message || "Please try again"

        if (error.code === 'auth/quota-exceeded' || error.message?.includes('Error code: 39')) {
            errorMessage = "SMS quota exceeded"
            errorDescription = "Please configure test phone numbers in Firebase Console or enable billing"
        } else if (error.code === 'auth/captcha-check-failed') {
            errorMessage = "CAPTCHA verification failed"
            errorDescription = "Please add your domain to Firebase authorized domains"
        } else if (error.code === 'auth/invalid-phone-number') {
            errorMessage = "Invalid phone number"
            errorDescription = "Please enter a valid phone number with country code"
        }

        toast.error(errorMessage, {
            description: errorDescription,
            duration: 7000,
        })
    } finally {
        isLoading.value = false
    }
}

const handleRegister = async () => {
    if (isRegistering.value) return

    try {
        isRegistering.value = true

        // Get the current Firebase token
        const firebaseToken = localStorage.getItem(AUTH_KEY)
        if (!firebaseToken) {
            throw new Error('No authentication token found')
        }

        // Sync with backend and update name
        const user = await syncWithBackend(firebaseToken, name.value)

        // Update local state with the response
        const _balance = Number(formatEther(await fetchWalletBalance(user.wallet_address)))
        name.value = user.name
        phoneNumber.value = user.phone_number
        walletAddress.value = user.wallet_address
        balance.value = _balance

        // Update Retell variables
        setVariable('user_name', user.name)
        setVariable('user_phone', user.phone_number)
        setVariable('wallet_address', user.wallet_address)
        setVariable('balance', _balance)

        // Track successful registration
        posthog.capture('user_registered', {
            name_provided: !!name.value
        })

        // Identify the user in PostHog
        posthog.identify(phoneNumber.value, {
            name: name.value,
            phone: phoneNumber.value,
            wallet_address: walletAddress.value
        })

        currentState.value = 'welcome'
        transitionToAccount()

    } catch (error) {
        console.error('Error registering user:', error)

        // Track registration failure
        posthog.capture('registration_failed', {
            error: error.message
        })

        toast.error("Registration failed", {
            description: "Please try again or contact support",
            duration: 5000,
        })
    } finally {
        isRegistering.value = false
    }
}

const copyAddress = async () => {
    await copy(walletAddress.value)
    // You might want to add a toast notification here
}

const handleSignOut = () => {
    // Track sign out event
    posthog.capture('user_signed_out')
    
    // Reset PostHog user
    posthog.reset()
    
    currentState.value = 'phone'
    name.value = ''
    phoneNumber.value = ''
    walletAddress.value = ''
    balance.value = 0

    // Clear local storage
    localStorage.removeItem(AUTH_KEY)

    // Reset Retell variables
    setVariable('user_name', '')
    setVariable('user_phone', '')
    setVariable('wallet_address', '')
    setVariable('balance', '0')
}

const fetchWalletBalance = async (_walletAddress) => {
    const balance = (await getBalance(wagmiConfig, {
        address: _walletAddress,
        chainId: base.id,
        unit: "ether",
    })).value;
    console.log('base_balance', balance)
    return Number(balance);
}
// Modify getUser to save data
const getUser = async () => {
    try {
        // const { data: walletData, error: walletError } = await supabase
        //     .from('users')
        //     .select('*')
        //     .eq('phone_number', phone)
        //     .single()

        // if (walletError) throw walletError

        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(AUTH_KEY)}`
            }
        }).then(res => res.json())

        // supabaseWallet.value = response.user
        // supabaseWallet.value.balance = formatEther(await fetchWalletBalance(supabaseWallet.value.wallet_address))
        // supabaseWallet.value.exists = true
        const _balance = Number(formatEther(await fetchWalletBalance(response.user.wallet_address)))
        // supabaseWallet.value.exists = true
        console.log('user', response.user)
        name.value = response.user.name
        balance.value = _balance
        walletAddress.value = response.user.wallet_address
        phoneNumber.value = response.user.phone_number
        // Save to local storage
        // saveToLocalStorage(supabaseWallet.value)

        // Update Retell variables
        setVariable('user_name', response.user.name)
        setVariable('user_phone', response.user.phone_number)
        setVariable('wallet_address', response.user.wallet_address)
        setVariable('balance', _balance)

        // return response.user
    } catch (error) {
        console.log('Error checking user:', error)
        return { exists: false }
    }
}


// Add these new refs
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref([])
const isVerifying = ref(false)
const resendTimer = ref(0)
const confirmationResult = ref(null)
const recaptchaVerifier = ref(null)

// Add computed property for OTP completion
const isOtpComplete = computed(() => {
    return otpDigits.value.every(digit => digit.length === 1)
})

// Add these new functions
const handleOtpInput = (index) => {
    // Ensure only numbers
    otpDigits.value[index] = otpDigits.value[index].replace(/[^0-9]/g, '')

    // Move to next input
    if (otpDigits.value[index] && index < 5) {
        otpInputs.value[index + 1].focus()
    }
}

const handleOtpKeydown = (event, index) => {
    if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        otpInputs.value[index - 1].focus()
    }
}

const handleOtpPaste = (event) => {
    event.preventDefault()
    const pastedData = event.clipboardData.getData('text')
    const numbers = pastedData.replace(/[^0-9]/g, '').split('')

    otpDigits.value = otpDigits.value.map((_, index) => numbers[index] || '')
}

const startResendTimer = () => {
    resendTimer.value = 60
    const timer = setInterval(() => {
        resendTimer.value--
        if (resendTimer.value <= 0) {
            clearInterval(timer)
        }
    }, 1000)
}

const resendOtp = async () => {
    if (resendTimer.value > 0) return

    try {
        // Reset OTP digits
        otpDigits.value = ['', '', '', '', '', '']

        // Request new OTP via Firebase
        confirmationResult.value = await requestOtp()

        startResendTimer()

        toast.success("New code sent", {
            description: "Check your phone for the new code",
            duration: 3000,
        })
    } catch (error) {
        console.error('Error resending OTP:', error)

        let errorDescription = "Please try again"
        if (error.code === 'auth/quota-exceeded' || error.message?.includes('Error code: 39')) {
            errorDescription = "SMS quota exceeded. Use test phone numbers or enable billing in Firebase"
        }

        toast.error("Failed to resend code", {
            description: errorDescription,
            duration: 7000,
        })
    }
}

const syncWithBackend = async (firebaseToken, userName = null) => {
    try {
        const body = {}
        if (userName) {
            body.name = userName
        }

        const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/auth/firebase`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${firebaseToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            throw new Error(`Backend sync failed: ${response.statusText}`)
        }

        const data = await response.json()
        return data.user
    } catch (error) {
        console.error('Error syncing with backend:', error)
        throw error
    }
}

const verifyOtp = async () => {
    if (isVerifying.value || !isOtpComplete.value || !confirmationResult.value) return

    isVerifying.value = true

    const otp = otpDigits.value.join('')
    try {
        // Verify the OTP code with Firebase
        const result = await confirmationResult.value.confirm(otp)

        // Get Firebase ID token
        const firebaseToken = await result.user.getIdToken()

        // Store Firebase token for future API calls
        localStorage.setItem(AUTH_KEY, firebaseToken)

        // Track successful verification
        posthog.capture('otp_verified_success', {
            method: 'firebase'
        })

        // Sync with backend - this creates or retrieves the user
        const user = await syncWithBackend(firebaseToken)

        // Update local state with user data from backend
        const _balance = Number(formatEther(await fetchWalletBalance(user.wallet_address)))
        name.value = user.name || ''
        phoneNumber.value = user.phone_number
        walletAddress.value = user.wallet_address
        balance.value = _balance

        // Update Retell variables
        setVariable('user_name', user.name || '')
        setVariable('user_phone', user.phone_number)
        setVariable('wallet_address', user.wallet_address)
        setVariable('balance', _balance)

        toast.success("Phone number verified successfully", {
            description: "Welcome back",
            duration: 5000,
        })
        currentState.value = 'welcome'

        // Identify user in PostHog after successful login
        if (name.value) {
            posthog.identify(phoneNumber.value, {
                name: name.value,
                phone: phoneNumber.value,
                wallet_address: walletAddress.value
            })

            transitionToAccount()
        } else {
            currentState.value = 'register'
        }
    } catch (error) {
        console.error('Error verifying OTP:', error)

        // Track verification error
        posthog.capture('otp_verification_error', {
            error: error.message,
            method: 'firebase'
        })

        // Check if it's an invalid code error
        if (error.code === 'auth/invalid-verification-code') {
            toast.error("Invalid verification code", {
                description: "Please check the code and try again",
                duration: 5000,
            })
        } else if (error.message?.includes('Backend sync failed')) {
            toast.error("Failed to sync with server", {
                description: "Please try again or contact support",
                duration: 5000,
            })
        } else {
            toast.error("An error occurred. Please try again.", {
                description: error.message,
                duration: 5000,
            })
        }
    } finally {
        isVerifying.value = false
    }
}

// Add refresh balance function
const refreshBalance = async () => {
    if (!walletAddress.value || isRefreshing.value) return;
    
    isRefreshing.value = true;
    try {
        const newBalance = Number(formatEther(await fetchWalletBalance(walletAddress.value)));
        balance.value = newBalance;
        
        // Update Retell variable
        setVariable('balance', newBalance);
        
        // Track balance refresh
        posthog.capture('wallet_balance_refreshed', {
            wallet_address: walletAddress.value,
            balance: newBalance
        })
        
        toast.success("Balance updated successfully");
    } catch (error) {
        console.error("Error refreshing balance:", error);
        
        // Track balance refresh failure
        posthog.capture('wallet_balance_refresh_failed', {
            error: error.message
        })
        
        toast.error("Failed to refresh balance");
    } finally {
        isRefreshing.value = false;
    }
}
</script>

<style scoped>
/* Add these styles */
.country-select {
    position: relative;
}

.country-select input:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
}

::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* IntlTelInput Custom Styles */
:deep(.tel-input-custom) {
    @apply w-full;
}

:deep(.iti__flag-container) {
    @apply left-3;
}

:deep(.iti__selected-flag) {
    @apply bg-transparent hover:bg-stone-700/50 rounded-l-md;
    padding-left: 8px;
}

:deep(.iti__country-list) {
    @apply bg-stone-800 border-white/20 text-white;
}

:deep(.iti__country) {
    @apply hover:bg-stone-700/50;
}

:deep(.iti__dial-code) {
    @apply text-white/70;
}

:deep(.iti input) {
    @apply w-full bg-stone-800 border-white/20 text-white rounded-md py-2 px-3 pl-14;
    @apply focus:ring-2 focus:ring-white/20 focus:border-white/20;
}

:deep(.iti--allow-dropdown input) {
    @apply pl-14;
}

input[type="text"]::-webkit-outer-spin-button,
input[type="text"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="text"] {
    -moz-appearance: textfield;
}
</style>