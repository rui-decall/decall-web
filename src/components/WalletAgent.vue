<template>
  <div class="h-full w-full max-w-3xl mx-auto p-4 flex flex-col">
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
    <div class="bg-stone-800 rounded-b-lg p-4 border-t border-white/10">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useStore } from '@nanostores/vue'
import { $retellVariables } from '../stores/retellVariables'

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
  const response = await fetch('https://icncc0kb39.execute-api.ap-southeast-1.amazonaws.com/messages', {
    method: 'POST',
    body: JSON.stringify({
      message: query,
      phone: variables.value.user_phone
    }),
    headers: {
      'Content-Type': 'application/json'
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
  scrollToBottom()
})
</script> 