<template>
  <div class="h-[80vh] w-full max-w-3xl mx-auto p-4 flex flex-col relative bg-stone-900 rounded-xl border border-white/20">
    <!-- Close button -->
    <button 
      @click="$emit('close')" 
      class="absolute top-4 right-4 text-white/70 hover:text-white focus:outline-none z-10"
      aria-label="Close modal"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <!-- Chat Header -->
    <div class="bg-stone-800 rounded-t-lg p-4 border-b border-white/10">
      <h2 class="text-xl font-semibold">Wallet Agent</h2>
      <p class="text-sm text-white/60">Ask about your balance, transfer funds, or view transactions</p>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto bg-stone-800/50 p-4 space-y-4" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" 
           :class="[message.type === 'user' ? 'ml-auto bg-blue-500/20' : 'mr-auto bg-stone-700/50',
                   'max-w-[80%] rounded-lg p-3']">
        <p class="text-sm">{{ message.content }}</p>
      </div>
    </div>

    <!-- Input Area -->
    <div v-if="accessToken" class="bg-stone-800 rounded-b-lg p-4 border-t border-white/10">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input 
          v-model="newMessage" 
          type="text" 
          placeholder="Ask about your wallet..."
          class="flex-1 bg-stone-700 rounded-lg px-4 py-2 text-sm border border-white/10 focus:outline-none focus:border-blue-500/50"
        >
        <button 
          type="submit"
          class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Send
        </button>
      </form>
    </div>
    <div v-else class="bg-stone-800 rounded-b-lg p-4 border-t border-white/10">
      <p class="text-yellow-500 font-medium flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        Please login to use this feature
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useStore } from '@nanostores/vue'
import { $retellVariables } from '../stores/retellVariables'
const AUTH_KEY = 'payphone_auth'
const accessToken = ref(localStorage.getItem(AUTH_KEY))

// Add close to emits
const emit = defineEmits(['close'])

const variables = useStore($retellVariables)
const newMessage = ref('')
const messages = ref([
  {
    type: 'agent',
    content: 'Hello! I can help you manage your wallet. You can ask about your balance, transfer funds, or view your transaction history.'
  }
])
const messagesContainer = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  // Add user message
  messages.value.push({
    type: 'user',
    content: newMessage.value
  })

  // Simulate agent response based on user query
  const query = newMessage.value.toLowerCase()
//   let response = ''

// console.log(variables.value)
  const response = await fetch('https://decall-rhdveh5il-yikkais-projects.vercel.app/messages', {
    method: 'POST',
    body: JSON.stringify({
      message: query,
      phone: variables.value.user_phone
    }),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken.value}`
    }
  })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        return data.agent_message
    })

//   if (query.includes('balance')) {
//     response = `Your current balance is ${variables.value.balance || 0} ETH`
//   } else if (query.includes('transfer')) {
//     response = 'To transfer funds, please provide the recipient address and amount. Format: "transfer [address] [amount]"'
//   } else if (query.includes('transactions') || query.includes('history')) {
//     response = 'Your recent transactions will be displayed here. (Transaction history feature coming soon)'
//   } else {
//     response = 'I can help you with checking your balance, transferring funds, or viewing your transaction history. What would you like to do?'
//   }

  // Add agent response
  messages.value.push({
    type: 'agent',
    content: response
  })

  newMessage.value = ''
  scrollToBottom()
}

onMounted(() => {
  if (localStorage.getItem(AUTH_KEY)) {
    accessToken.value = localStorage.getItem(AUTH_KEY)
  }
  scrollToBottom()
})
</script> 
