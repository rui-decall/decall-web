<template>
    <div class="w-full flex flex-col items-center gap-6 bg-stone-900 rounded-2xl overflow-hidden">
        <!-- Phone Number Input Dialog -->
        <Dialog v-model:open="showPhoneDialog">
            <DialogContent class="bg-stone-800 border-white/20 text-white">
                <DialogHeader>
                    <DialogTitle>Enter Your Phone Number</DialogTitle>
                    <DialogDescription class="text-white/70">
                        Please enter your phone number to make the call
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4 py-4">
                    <div>
                        <Label for="caller_phone" class="text-sm text-white/90">Phone Number</Label>
                        <Input
                            id="caller_phone"
                            v-model="tempPhoneNumber"
                            class="mt-2 bg-stone-900 border-white/20 text-white"
                            placeholder="e.g., +1234567890"
                            @keyup.enter="confirmPhoneNumber"
                        />
                        <p class="text-xs text-white/50 mt-2">Include country code (e.g., +1 for US)</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        class="text-white/70"
                        @click="showPhoneDialog = false"
                    >
                        Cancel
                    </Button>
                    <Button
                        class="bg-green-500 hover:bg-green-600 text-white"
                        @click="confirmPhoneNumber"
                        :disabled="!tempPhoneNumber.trim()"
                    >
                        Start Call
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <!-- Header -->
        <div class="w-full bg-stone-800/50 px-6 py-4 flex justify-between items-center">
            <h2 class="text-xl font-semibold">Web Call</h2>
            <button
                @click="handleClose"
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
                    @click.stop.prevent="handleCall"
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
                        @click.stop.prevent="endCall"
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

            <!-- Display cached phone number if available -->
            <div v-if="callerPhoneNumber && !callState.isCalling" class="flex flex-col items-center gap-1 mt-2">
                <div class="flex items-center gap-2 text-sm text-white/60">
                    <Phone class="w-3 h-3" />
                    <span>{{ callerPhoneNumber }}</span>
                    <button
                        @click="showPhoneDialog = true; tempPhoneNumber = callerPhoneNumber"
                        class="text-blue-400 hover:text-blue-300 text-xs underline ml-1"
                    >
                        Change
                    </button>
                </div>
            </div>
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { $callState } from '../stores/callState'
import { $retellVariables, setVariable } from '../stores/retellVariables'
import { $activeTab, setActiveTab } from '../stores/ui'
import { $callerPhoneNumber, setCallerPhoneNumber } from '../stores/phoneNumber'

// Define emits
const emit = defineEmits(['close'])

const STORAGE_KEY = 'payphone_user'
const isEditing = ref(false)
const userName = ref('')
const userPhone = ref('')
const walletAddress = ref('')
const showPhoneDialog = ref(false)
const tempPhoneNumber = ref('')

// Use stores
const callState = useStore($callState)
const variables = useStore($retellVariables)
const callerPhoneNumber = useStore($callerPhoneNumber)

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
}, { immediate: true })

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

const handleCall = () => {
    // Check if we have a cached phone number
    if (callerPhoneNumber.value) {
        // If we have a number, start the call directly
        startWebCall()
    } else {
        // Otherwise show the dialog
        tempPhoneNumber.value = ''
        showPhoneDialog.value = true
    }
}

const confirmPhoneNumber = () => {
    const phoneNumber = tempPhoneNumber.value.trim()

    if (!phoneNumber) {
        return
    }

    // Cache the phone number
    setCallerPhoneNumber(phoneNumber)

    // Close dialog
    showPhoneDialog.value = false

    // Start the call after user confirms
    startWebCall()
}

const startWebCall = () => {
    const webCallContainer = document.getElementById('hidden-webcall')
    if (webCallContainer) {
        const webCallButton = webCallContainer.querySelector('#webcall-start-btn')
        if (webCallButton) {
            (webCallButton as HTMLElement).click()
        }
    }
}

// Handle close button - just emit close, do NOT end call
const handleClose = () => {
    // Emit close event to parent
    emit('close')
}

// Add method to end call that can be called from parent
const endCall = () => {
    if (callState.value.isCalling) {
        // End the call by clicking the webcall button (toggles the call off)
        const webCallContainer = document.getElementById('hidden-webcall')
        if (webCallContainer) {
            const webCallButton = webCallContainer.querySelector('#webcall-stop-btn')
            if (webCallButton) {
                (webCallButton as HTMLElement).click()
            }
        }
    }
}

// Add a computed property to check if a call is active
const isCallActive = computed(() => {
  return callState.value.isCalling;
});

// Expose the isCallActive property to parent components
defineExpose({
  endCall,
  isCallActive,
  handleCall
});

watch(() => variables.value.user_name, (newVal) => {
  if (!newVal) {
    // End the call when user signs out
    if (callState.value.isCalling) {
      endCall()
    }
  }
})
</script>
