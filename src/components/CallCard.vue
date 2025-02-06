<template>
    <div class="w-full max-w-lg flex flex-col items-center gap-8">
        <!-- Compact Call State -->
        <div v-if="!isEditing" class="flex flex-col items-center gap-12">
            <!-- Main Call Button -->
            <div class="relative">
                <!-- Active Call Glow Effect -->
                <div v-if="callState.isCalling" 
                     class="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse">
                </div>
                
                <button 
                    class="relative group w-[220px] h-[220px] rounded-full flex flex-col justify-center items-center gap-4 transition-all duration-200"
                    :class="callState.isCalling ? 'bg-green-500/20 border-green-500/30' : 'bg-white/10 hover:bg-white/20 border-white/20'"
                    :disabled="callState.isCalling"
                    @click="handleCall"
                >
                    <div class="relative flex flex-col items-center gap-2">
                        <Phone class="w-12 h-12" 
                              :class="callState.isCalling ? 'text-green-400' : 'text-white/70 group-hover:text-white/90'" />
                    </div>
                </button>

                <!-- Hang Up Button -->
                <button v-if="callState.isCalling"
                        @click="handleCall"
                        class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-500/60 hover:bg-red-500/30 border border-red-500/30 
                               rounded-full p-4 transition-all duration-200 group">
                    <PhoneOff class="w-6 h-6 text-white group-hover:text-red-300" />
                </button>
            </div>

            <!-- Call Status -->
            <div v-if="callState.callStatus !== 'Not started'" 
                 class="text-white/70 flex flex-col items-center gap-2">
                <div>{{ callState.callStatus }}</div>
                <!-- Show agent state indicator when call is active -->
                <div v-if="callState.isCalling" 
                     class="flex items-center gap-2 px-3 py-1 rounded-full"
                     :class="{
                         'bg-green-500/20 text-green-400': callState.agentState === 'Speaking',
                         'bg-blue-500/20 text-blue-400': callState.agentState === 'Listening',
                         'bg-white/10 text-white/50': callState.agentState === 'Idle'
                     }">
                    <div class="w-2 h-2 rounded-full animate-pulse"
                         :class="{
                             'bg-green-400': callState.agentState === 'Speaking',
                             'bg-blue-400': callState.agentState === 'Listening',
                             'bg-white/50': callState.agentState === 'Idle'
                         }" />
                    {{ callState.agentState }}
                </div>
            </div>

            <div class="flex items-center gap-2">
                <User class="w-4 h-4 text-white/50" />
                Calling As: 
                <!-- Compact User Badge -->
            <button 
                class="group flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-md px-4 py-1.5 transition-all duration-200"
                @click="isEditing = true"
            >
                <span class="text-white font-medium text-xl">{{ variables.user_name || 'User' }}</span>
                <Settings class="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
            </button>
            </div>
        </div>

        <!-- Edit State (RetellVariables functionality) -->
        <div v-else class="w-full space-y-6">
            <div class="w-full">
                <div class="text-white text-sm mb-3 flex justify-between items-center">
                    <div>
                        <p class="text-white font-medium">Dev Tool</p>
                        <p class="text-white/50 text-sm">Configure test user details below</p>
                    </div>
                </div>
                <div class="w-full border border-white/20 rounded-xl bg-white/10 p-4 grid grid-cols-3 gap-4">
                    <div>
                        <Label for="dev_name" class="text-sm">Name</Label>
                        <Input 
                            id="dev_name"
                            v-model="userName" 
                            class="mt-1.5 bg-stone-800 border-white/20" 
                            placeholder="Enter name"
                            @change="updateVariable('user_name', $event.target.value)"
                        />
                    </div>

                    <div>
                        <Label for="dev_phone" class="text-sm">Phone</Label>
                        <Input 
                            id="dev_phone"
                            v-model="userPhone" 
                            class="mt-1.5 bg-stone-800 border-white/20" 
                            placeholder="Enter phone"
                            @change="updateVariable('user_phone', $event.target.value)"
                        />
                    </div>

                    <div>
                        <Label for="dev_wallet" class="text-sm">Wallet</Label>
                        <Input 
                            id="dev_wallet"
                            v-model="walletAddress" 
                            class="mt-1.5 bg-stone-800 border-white/20" 
                            placeholder="Enter wallet"
                            @change="updateVariable('wallet_address', $event.target.value)"
                        />
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3">
                <Button 
                    variant="ghost" 
                    class="text-white/70"
                    @click="isEditing = false"
                >
                    Cancel
                </Button>
                <Button 
                    class="bg-stone-900 border-white/20" 
                    @click="handleSave"
                >
                    Save
                </Button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '@nanostores/vue'
import { Phone, PhoneOff, Loader2, Settings, User } from 'lucide-vue-next'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { $callState } from '../stores/callState'
import { $retellVariables, setVariable } from '../stores/retellVariables'

const STORAGE_KEY = 'retell_variables'
const isEditing = ref(false)
const userName = ref('')
const userPhone = ref('')
const walletAddress = ref('')

// Use stores
const callState = useStore($callState)
const variables = useStore($retellVariables)

// Initialize form values from store
onMounted(() => {
    // Try to load from localStorage first
    const savedVariables = localStorage.getItem(STORAGE_KEY)
    
    if (savedVariables) {
        const parsed = JSON.parse(savedVariables)
        userName.value = parsed.find((v: any) => v.key === 'user_name')?.value || ''
        userPhone.value = parsed.find((v: any) => v.key === 'user_phone')?.value || ''
        walletAddress.value = parsed.find((v: any) => v.key === 'wallet_address')?.value || ''
        
        // Restore to store immediately
        updateVariable('user_name', userName.value)
        updateVariable('user_phone', userPhone.value)
        updateVariable('wallet_address', walletAddress.value)
    } else {
        // Initialize with default variables
        const defaults = {
            user_name: 'Steve',
            user_phone: '',
            wallet_address: '0x0'
        }
        
        userName.value = defaults.user_name
        userPhone.value = defaults.user_phone
        walletAddress.value = defaults.wallet_address
        
        // Set default values in store
        Object.entries(defaults).forEach(([key, value]) => {
            setVariable(key, value)
        })
        
        // Save defaults to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            { key: 'user_name', value: defaults.user_name },
            { key: 'user_phone', value: defaults.user_phone },
            { key: 'wallet_address', value: defaults.wallet_address }
        ]))
    }
})

const updateVariable = (key: string, value: string) => {
    setVariable(key, value)
}

const handleSave = () => {
    updateVariable('user_name', userName.value)
    updateVariable('user_phone', userPhone.value)
    updateVariable('wallet_address', walletAddress.value)
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify([
        { key: 'user_name', value: userName.value },
        { key: 'user_phone', value: userPhone.value },
        { key: 'wallet_address', value: walletAddress.value }
    ]))
    
    isEditing.value = false
}

const handleCall = async () => {
    const webCallContainer = document.getElementById('hidden-webcall')
    if (webCallContainer) {
        const webCallButton = webCallContainer.querySelector('.webcall-button')
        if (webCallButton) {
            (webCallButton as HTMLElement).click()
        }
    }
}
</script> 