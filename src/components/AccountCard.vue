<template>
    <div class="w-full max-w-xl bg-white/10 rounded-xl border border-white/20 aspect-[3/4] flex flex-col">
        <!-- Phone Number Entry State -->
        <div v-if="currentState === 'phone'" class="flex flex-col h-full">
            <div class="px-6 pt-6 pb-4 border-b border-white/20">
                <h3 class="text-white text-2xl font-bold mb-2">Welcome</h3>
                <p class="text-white/50 text-sm">Enter your phone number to continue</p>
            </div>

            <div class="p-6 space-y-4 flex-1">
                <div>
                    <Label for="phone">Phone Number</Label>
                    <Input class="mt-2 bg-stone-800 border-white/20" 
                           id="phone" 
                           v-model="phoneNumber" 
                           placeholder="Enter your phone number"
                           type="tel" />
                </div>
            </div>

            <div class="px-6 pb-6 flex justify-end">
                <Button 
                    class="bg-stone-900 border-white/20" 
                    @click="handlePhoneSubmit"
                    :disabled="isLoading"
                >
                    <span class="flex items-center">
                        <span v-if="isLoading" class="mr-2 h-4 w-4 animate-spin">
                            <Loader2 class="h-4 w-4" />
                        </span>
                        {{ isLoading ? 'Checking...' : 'Next' }}
                        <ChevronRight v-if="!isLoading" class="ml-2 h-4 w-4" />
                    </span>
                </Button>
            </div>
        </div>

        <!-- Register State -->
        <div v-if="currentState === 'register'" class="flex flex-col h-full">
            <div class="px-6 pt-6 pb-4 border-b border-white/20">
                <h3 class="text-white text-2xl font-bold mb-2">Register</h3>
                <p class="text-white/50 text-sm">Create a new account using your phone number</p>
            </div>

            <div class="p-6 space-y-4 flex-1">
                <div>
                    <Label for="name">Name</Label>
                    <Input class="mt-2 bg-stone-800 border-white/20" 
                           id="name" 
                           v-model="name" 
                           placeholder="Enter name" />
                </div>
            </div>

            <div class="px-6 pb-6 flex justify-end">
                <Button 
                    class="bg-stone-900 border-white/20" 
                    @click="handleRegister"
                    :disabled="isRegistering"
                >
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

        <!-- Welcome Back State - Now with auto-transition -->
        <div v-if="currentState === 'welcome'" class="flex flex-col h-full">
            <div class="px-6 pt-6 pb-4 border-b border-white/20">
                <h3 class="text-white text-2xl font-bold mb-2">Welcome Back!</h3>
                <p class="text-white/50 text-sm">{{ name }}</p>
            </div>

            <div class="p-6 flex-1 flex items-center justify-center">
                <div class="flex flex-col items-center gap-2">
                    <span class="loading loading-spinner loading-md"></span>
                    <p class="text-white/70">Logging you in...</p>
                </div>
            </div>
        </div>

        <!-- Account State -->
        <div v-if="currentState === 'account'" class="flex flex-col h-full">
            <div class="px-6 pt-6 pb-4 border-b border-white/20 flex justify-between items-center">
                <div>
                    <h3 class="text-white text-2xl font-bold mb-1">{{ name }}</h3>
                    <div class="flex items-center gap-2 text-white/50">
                        <Phone class="w-3 h-3" />
                        <p class="text-sm">{{ phoneNumber }}</p>
                    </div>
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    class="text-red-400 hover:text-red-300 border-red-500/50 hover:border-red-500 hover:bg-red-500/10"
                    @click="handleSignOut"
                >
                    <LogOut class="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>

            <div class="p-6 flex-1 scroll-auto">
                <div v-if="accountView === 'wallet'" class="space-y-8">
                    <!-- Wallet Balance -->
                    <div class="text-center space-y-1">
                        <p class="text-white/50 text-sm">Wallet Balance</p>
                        <p class="text-white text-2xl font-bold">{{ balance }} ETH</p>
                    </div>

                    <!-- QR Code Section -->
                    <div class="flex flex-col items-center space-y-6">
                        <img 
                            :src="qrCode" 
                            alt="Wallet QR Code" 
                            class="w-48 h-48 bg-white p-3 rounded-xl"
                        />

                        <div class="w-full p-4 bg-stone-800/50 rounded-lg border border-white/10">
                            <div class="flex items-center justify-between mb-2">
                                <p class="text-white/50 text-sm">Wallet Address</p>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    class="text-white/70 hover:text-white"
                                    @click="copyAddress"
                                >
                                    <Copy class="w-4 h-4" />
                                </Button>
                            </div>
                            <p class="text-white/90 text-sm font-mono break-all">
                                {{ walletAddress }}
                            </p>
                        </div>
                        
                        <Button @click="accountView = 'call'" :disabled="callDisabled" class="w-full p-4 bg-stone-800/50 rounded-lg border border-white/10">
                            <Phone class="w-4 h-4 mr-2" />
                            Call Now
                        </Button>
                        
                    </div>
                </div>

                <div v-if="accountView === 'call'" class="space-y-8">
                    <CallCard />
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
    ChevronRight, 
    User, 
    Settings, 
    Copy, 
    LogOut, 
    Phone,
    Loader2 
} from 'lucide-vue-next'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useClipboard } from '@vueuse/core'
import CallCard from './CallCard.vue'

const currentState = ref('phone')
const phoneNumber = ref('0123')
const name = ref('')
const walletAddress = ref('')
const balance = ref('0.0000')
const supabaseWallet = ref(null)
const accountView = ref('wallet')

const { copy } = useClipboard()


import { createClient } from '@supabase/supabase-js'
import { http, createConfig, connect, getAccount, disconnect, reconnect, readContract, getBalance, sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
import { formatEther, parseEther } from 'viem'
import { base } from '@wagmi/core/chains'
const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
})
// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}
const supabase = createClient(supabaseUrl, supabaseAnonKey)

import { setVariable } from '../stores/retellVariables'

const callDisabled = computed(() => {
    return !supabaseWallet.value.wallet_address || !supabaseWallet.value.phone_number || Number(supabaseWallet.value.balance) < 0.001
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

const handlePhoneSubmit = async () => {
    if (isLoading.value) return
    
    try {
        isLoading.value = true
        const response = await checkUserExists(phoneNumber.value)
        
        if (response.exists) {
            name.value = response.name
            currentState.value = 'welcome'
            transitionToAccount()
        } else {
            currentState.value = 'register'
        }
    } catch (error) {
        console.error('Error checking user:', error)
    } finally {
        isLoading.value = false
    }
}

const handleRegister = async () => {
    if (isRegistering.value) return
    
    try {
        isRegistering.value = true
        const succeed = await registerUser({
            phone: phoneNumber.value,
            name: name.value
        })

        if (succeed) {
            await checkUserExists(phoneNumber.value)
            currentState.value = 'welcome'
            transitionToAccount()
        } else {
            console.log('Error registering user:', succeed)
        }

    } catch (error) {
        console.error('Error registering user:', error)
    } finally {
        isRegistering.value = false
    }
}

const copyAddress = async () => {
    await copy(walletAddress.value)
    // You might want to add a toast notification here
}

const handleSignOut = () => {
    currentState.value = 'phone'
    // Reset other states as needed
    name.value = ''
    phoneNumber.value = ''
    // Add any other cleanup or API calls needed
}

const fetchWalletBalance = async (_walletAddress) => {
    const balance = (await getBalance(wagmiConfig, {
        address: _walletAddress,
        chainId: base.id,
        unit: "ether",
    })).value;
    console.log('base_balance', balance)
    return balance;
}


// Simulate API calls
const checkUserExists = async (phone) => {
    // Replace with actual API call
    // await new Promise(resolve => setTimeout(resolve, 1000))
    // return { exists: false }

    try {

        const { data: walletData, error: walletError } = await supabase
          .from('users')
          .select('*')
          .eq('phone_number', phone)
          .single()
    
        supabaseWallet.value = walletData;
        
        if (walletError) throw walletError
        
        supabaseWallet.value.balance = formatEther(await fetchWalletBalance(supabaseWallet.value.wallet_address))
        supabaseWallet.value.exists = true;
        balance.value = supabaseWallet.value.balance
        walletAddress.value = supabaseWallet.value.wallet_address
        console.log('supabaseWallet', supabaseWallet.value)

        setVariable('user_name', supabaseWallet.value.name);
        setVariable('user_phone', supabaseWallet.value.phone_number);
        setVariable('wallet_address', supabaseWallet.value.wallet_address);
    

        return supabaseWallet.value;
    } catch (error) {
        console.log('Error checking user:', error)
        return { exists: false }
    }


}

const registerUser = async (userData) => {
    // Replace with actual API call
    // await new Promise(resolve => setTimeout(resolve, 1000))
    // return true
    try {

        const response = await fetch(`https://decall-api.junyaoxiandingchan.workers.dev/phones/${userData.phone}/wallets`, {
            method: 'POST',
            body: JSON.stringify({
                name: userData.name,
            })
        }).then(res => res.json())
    
        console.log('response', response)
        return response;

    } catch(error) {
        console.log('Error registering user:', error)
        return false;
    }
}


// Simulate getting wallet balance
const fetchBalance = async () => {
    // Replace with actual API call
    // await new Promise(resolve => setTimeout(resolve, 1000))
    // balance.value = '1.2345'
    // balance.value = supabaseWallet.value.balance
}

onMounted(() => {
    // fetchBalance()
})
</script> 