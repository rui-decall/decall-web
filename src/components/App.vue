<template>
  <main class="bg-stone-900 w-screen h-[100dvh] max-h-[100dvh] text-white flex flex-col justify-start items-center overflow-hidden">
    <div class="w-full flex items-center justify-center flex-col gap-y-12 duration-300" :class="[isExpanded ? 'h-[3rem]' : 'h-full']">

      <div v-if="!isExpanded" class="max-w-3xl text-left px-4">
        
        <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent text-center">
          Payphone Demo
        </h1>
        
        <p class="text-sm mb-6 text-white/80 text-center">
          Make a call to schedule your haircut at <strong class="text-white font-medium">Ojisan Barber Salon</strong>
        </p>
  
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
          <!-- Instructions Card -->
          <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 class="font-medium mb-3 text-white">Instructions</h3>
            <div class="grid grid-cols-1 gap-3 text-sm text-white/80">
              <div class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <span>Register first to make a call</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <span>You will have a wallet after registration</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <span>Send a minimum of 0.0011 ETH on Base to your wallet to fund it</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <span>Use phone or web call to schedule</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <span>Phone call won't work if you don't have a wallet!</span>
              </div>
            </div>
          </div>

          <!-- Operating Hours Card -->
          <div class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 class="font-medium mb-3 text-white">Operating Hours</h3>
            <div class="grid grid-cols-1 gap-3 text-sm text-white/80">
              <div class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5"></div>
                <span>Monday - Saturday: 9:00 AM - 9:00 PM</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5"></div>
                <span>Break Time: 3:00 PM - 6:00 PM</span>
              </div>
              <div class="flex items-start gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5"></div>
                <span>Sunday: Closed</span>
              </div>
              <div class="mt-2">
                You can schedule, modify, or cancel your appointment through our phone system.
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-center w-full gap-4">
          <!-- Phone Card -->
          <div class="flex items-center gap-3 bg-stone-800/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
            <span class="text-white/60 text-sm">Phone:</span>
            <a class="text-blue-400 hover:text-blue-300 transition-colors" 
               href="tel:+1(419)7806507">
              +1 (419) 780-6507
            </a>
          </div>

          <!-- User Info Card -->
          <div class="flex items-center gap-4 bg-stone-800/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
            <template v-if="variables.user_name">
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <User class="w-3 h-3 text-white/50" />
                  <span class="text-white/70 text-sm">{{ variables.user_name }}</span>
                </div>
                <div class="w-px h-4 bg-white/10"></div>
                <div class="flex items-center gap-2">
                  <Wallet class="w-3 h-3 text-white/50" />
                  <span class="text-white/70 text-sm">{{ truncateAddress(variables.wallet_address) }}</span>
                </div>
                <div class="w-px h-4 bg-white/10"></div>
                <div class="flex items-center gap-2">
                  <CircleDollarSign class="w-3 h-3 text-white/50" />
                  <span class="text-white/70 text-sm">{{ Math.round(variables.balance * 100000) / 100000 }} ETH</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="flex items-center gap-2">
                <User class="w-3 h-3 text-white/50" />
                <span class="text-white/50 text-sm">Not logged in</span>
              </div>
            </template>
          </div>
        </div>

      </div>

      <div class="w-full" :class="[isExpanded ? 'flex justify-start items-center' : 'max-w-4xl grid grid-cols-3 gap-x-4']">
        <button 
          v-for="tab in tabs" 
          :key="tab.key" 
          @click="selectTab(tab.key)" 
          class="w-full flex justify-center items-center flex-col p-4 text-center space-y-4 relative transition-all duration-200" 
          :class="[
            isExpanded ? 'h-auto hover:bg-white/5' : 'min-h-36 rounded-lg backdrop-blur-sm',
            isExpanded && activeTab === tab.key ? 'bg-white/5' : '',
            !isExpanded ? 'bg-gradient-to-br from-stone-800/90 to-stone-800/70 shadow-lg shadow-black/30 border border-white/5 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-black/40' : ''
          ]"
        >
          <div v-if="!isExpanded" class="absolute inset-0 rounded-lg overflow-hidden">
            <div class="absolute top-0 left-[-100%] w-[120%] h-[100px] bg-gradient-to-r from-transparent via-white/5 to-transparent transform rotate-[-35deg] transition-transform duration-1500 hover:translate-x-[150%]"></div>
          </div>

          <div v-if="!isExpanded" class="absolute top-0 left-2 bg-stone-700/80 backdrop-blur-sm rounded-sm px-2 py-1 text-sm border border-white/10"
            :class="{
              'text-blue-300 border-blue-500/20': tab.tag === 'Customer',
              'text-emerald-300 border-emerald-500/20': tab.tag === 'Business'
            }"
          >
            {{ tab.tag }}
          </div>

          <h2 
            :class="[
              isExpanded ? 'text-white/70' : 'text-2xl font-bold pt-2',
              isExpanded && activeTab === tab.key ? '!text-white' : ''
            ]" 
            class="font-bold pt-2"
          >
            {{ tab.label }}
          </h2>
          <p v-if="!isExpanded" class="text-sm text-white/50">{{ tab.description }}</p>
        </button>
      </div>

    </div>

    <div :class="[
      isExpanded ? 'h-[calc(100dvh-3rem)] w-full flex justify-center items-center' : 'h-[0px] overflow-hidden opacity-0',
      'duration-300 transition-all ease-in-out'
    ]">
      <section :class="[
        isExpanded ? 'opacity-100 delay-50' : 'opacity-0',
        'duration-300 transition-all ease-in-out'
      ]" class="flex justify-center items-center w-full h-full">
        <Slides />
      </section>
    </div>


    <button v-if="isExpanded" class="absolute bottom-6 w-12 h-12 bg-white/20 border border-white/50 rounded-full p-2 flex justify-center items-center z-50 pointer-events-auto hover:scale-110 transition-all duration-200" @click="isExpanded = !isExpanded">
        <X class="w-8 h-8 text-white" />
    </button>

  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '@nanostores/vue'
import Slides from './Slides.vue'
import { $activeTab, setActiveTab } from '../stores/ui'
import { X, User, Wallet, CircleDollarSign } from 'lucide-vue-next'
import { $retellVariables } from '../stores/retellVariables'

const isExpanded = ref(false)
const activeTab = useStore($activeTab)
const variables = useStore($retellVariables)

const tabs = [
  {
    key: 'register',
    label: 'Register / Login',
    description: 'Register or login with phone number',
    tag: 'Customer'
  },
  {
    key: 'call',
    label: 'Web Call',
    description: 'Call `Ojisan Barber Salon` to schedule an appointment',
    tag: 'Customer'
  },
  {
    key: 'calendar',
    label: 'Calendar',
    description: 'View the Appointments in the Calendar',
    tag: 'Business'
  }
]

const selectTab = (key) => {
  if (!isExpanded.value) {
    isExpanded.value = true
  }
  setActiveTab(key)
}

const truncateAddress = (address) => {
  if (!address) return '-'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
</script>
