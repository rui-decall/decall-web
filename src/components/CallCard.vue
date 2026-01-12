<template>
    <div class="w-full flex flex-col items-center gap-6 bg-stone-900 rounded-2xl overflow-hidden">
        <!-- Header -->
        <div class="w-full bg-stone-800/50 px-6 py-4 flex justify-between items-center">
            <h2 class="text-xl font-semibold">Web Call</h2>
            <button 
                @click="$emit('close')" 
                class="text-white/70 hover:text-white focus:outline-none"
                aria-label="Close modal"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Call Content -->
        <div class="w-full flex flex-col items-center gap-6 px-6 pb-8">
            <!-- Main Call Button -->
            <div class="relative">
                <!-- Active Call Glow Effect -->
                <div v-if="callState.isCalling" 
                     class="absolute inset-0 bg-green-500/30 rounded-full blur-xl animate-pulse">
                </div>
                
                <button 
                    class="relative group w-[220px] h-[220px] rounded-full flex flex-col justify-center items-center gap-4 transition-all duration-200"
                    :class="callState.isCalling ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/10 hover:bg-white/20 border border-white/20'"
                    :disabled="callState.isCalling"
                    @click="handleCall"
                >
                    <div class="relative flex flex-col items-center gap-2">
                        <Phone class="w-12 h-12" 
                              :class="callState.isCalling ? 'text-green-400' : 'text-white/70 group-hover:text-white/90'" />
                    </div>
                </button>

                <!-- Mic Activity Indicator -->
                <div v-if="callState.isCalling" 
                     class="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-blue-400">
                    <div class="flex items-center gap-1">
                        <div 
                            v-for="i in 3" 
                            :key="i" 
                            class="h-1.5 w-1.5 rounded-full"
                            :class="[
                                micActivity > (i-1) * 0.33 ? 'opacity-100' : 'opacity-30',
                                {'animate-pulse': micActivity > (i-1) * 0.33}
                            ]"
                        ></div>
                    </div>
                </div>

                <!-- Hang Up Button -->
                <button v-if="callState.isCalling"
                        @click="handleCall"
                        class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-500/60 hover:bg-red-500/30 border border-red-500/30 
                               rounded-full p-4 transition-all duration-200 group">
                    <PhoneOff class="w-6 h-6 text-white group-hover:text-red-300" />
                </button>
            </div>

            <!-- Call Status -->
            <div class="text-center space-y-4 w-full">
                <div v-if="callState.callStatus !== 'Not started'" 
                     class="text-white/70 text-lg">
                    {{ callState.callStatus }}
                </div>
                
                <!-- Agent State Indicator -->
                <div v-if="callState.isCalling" 
                     class="inline-flex items-center gap-2 px-5 py-2 rounded-full"
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
                    
                    <!-- User Microphone Activity Indicator -->
                    <div v-if="callState.agentState === 'Listening'" class="ml-2 flex items-center gap-1">
                        <div 
                            v-for="i in 3" 
                            :key="i" 
                            class="h-1.5 w-1.5 rounded-full"
                            :class="[
                                micActivity > (i-1) * 0.33 ? 'bg-blue-400' : 'bg-blue-400/30',
                                {'animate-pulse': micActivity > (i-1) * 0.33}
                            ]"
                        ></div>
                    </div>
                </div>
            </div>

            <!-- COMMENTED OUT: User Info - Registration no longer required
            <div class="flex items-center gap-2 mt-4 bg-stone-800/50 px-5 py-3 rounded-lg w-full">
                <User class="w-5 h-5 text-white/50" />
                <span class="text-white/70">Calling As:</span>
                <span class="text-white font-medium ml-1">{{ variables.user_name || '-' }}</span>
            </div>

            <Button
                v-if="!isLoggedIn"
                @click="setActiveTab('register')"
                class="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg"
            >
                <AlertTriangle class="w-4 h-4" />
                <span class="text-sm">Please register/login first</span>
            </Button>
            -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useStore } from '@nanostores/vue'
import { Phone, PhoneOff, Loader2, Settings } from 'lucide-vue-next'
// COMMENTED OUT: User, AlertTriangle - Registration no longer required
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { $callState } from '../stores/callState'
import { $retellVariables, setVariable } from '../stores/retellVariables'
import { $activeTab, setActiveTab } from '../stores/ui'

const STORAGE_KEY = 'payphone_user'
const isEditing = ref(false)
const userName = ref('')
const userPhone = ref('')
const walletAddress = ref('')

// Use stores
const callState = useStore($callState)
const variables = useStore($retellVariables)

// Add microphone activity tracking
const micActivity = ref(0)
let audioContext = null
let analyser = null
let microphone = null
let dataArray = null
let animationFrameId = null

// Function to start microphone analysis
const startMicrophoneAnalysis = async () => {
    try {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        
        // Get microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        
        // Create analyser
        analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        
        // Connect microphone to analyser
        microphone = audioContext.createMediaStreamSource(stream)
        microphone.connect(analyser)
        
        // Create data array for frequency data
        const bufferLength = analyser.frequencyBinCount
        dataArray = new Uint8Array(bufferLength)
        
        // Start analyzing
        analyzeMicrophone()
    } catch (error) {
        console.error('Error accessing microphone:', error)
    }
}

// Function to analyze microphone input
const analyzeMicrophone = () => {
    if (!analyser) return
    
    // Get frequency data
    analyser.getByteFrequencyData(dataArray)
    
    // Calculate average volume
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
    }
    const average = sum / dataArray.length
    
    // Normalize to 0-1 range (typical values are 0-255)
    micActivity.value = Math.min(average / 128, 1)
    
    // Continue analyzing
    animationFrameId = requestAnimationFrame(analyzeMicrophone)
}

// Stop microphone analysis
const stopMicrophoneAnalysis = () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }
    
    if (microphone) {
        microphone.disconnect()
        microphone = null
    }
    
    if (analyser) {
        analyser = null
    }
    
    if (audioContext) {
        audioContext.close()
        audioContext = null
    }
    
    dataArray = null
    micActivity.value = 0
}

// Watch for call state changes to start/stop microphone analysis
watch(() => callState.value.isCalling, (isCalling) => {
    if (isCalling) {
        startMicrophoneAnalysis()
    } else {
        stopMicrophoneAnalysis()
    }
})

// Clean up on component unmount
onUnmounted(() => {
    stopMicrophoneAnalysis()
})

// COMMENTED OUT: callDisabled - Registration no longer required
// const callDisabled = computed(() => {
//     // TEMPORARILY DISABLED: Blockchain balance check
//     // return !variables.value.wallet_address || !variables.value.user_phone || Number(variables.value.balance) < 0.001
//     return !variables.value.wallet_address || !variables.value.user_phone
// })

// COMMENTED OUT: isLoggedIn - Registration no longer required
// const isLoggedIn = computed(() => {
//   return !!variables.value.user_name && !!variables.value.wallet_address
// })

// Initialize form values from store
onMounted(() => {
    console.log('variables', variables.value)
})

const updateVariable = (key: string, value: string) => {
    setVariable(key, value)
}

const handleSave = () => {
    isEditing.value = false
}

const handleCall = async () => {
    // Remove the balance check for web calls
    // console.log(variables.value.balance)
    // if (Number(variables.value.balance) < 0.0015) {
    //         alert('Make sure you have at least 0.0015 ETH')
    //         return
    // }

    const webCallContainer = document.getElementById('hidden-webcall')
    if (webCallContainer) {
        const webCallButton = webCallContainer.querySelector('.webcall-button')
        if (webCallButton) {
            (webCallButton as HTMLElement).click()
        }
    }
}

// Add method to end call that can be called from parent
const endCall = () => {
    if (callState.value.isCalling) {
        handleCall() // This will end the call if one is in progress
    }
}

// Add a computed property to check if a call is active
const isCallActive = computed(() => {
  return callState.value.isCalling;
});

// Expose the isCallActive property to parent components
defineExpose({
  endCall,
  isCallActive
});

watch(() => variables.value.user_name, (newVal) => {
  if (!newVal) {
    // Reset call state when user signs out
    if (callState.value.isCalling) {
      handleCall() // This will end the call if one is in progress
    }
  }
})
</script> 
