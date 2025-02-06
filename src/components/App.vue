<template>
  <main class="bg-stone-900 w-screen h-[100dvh] max-h-[100dvh] text-white flex flex-col justify-start items-center overflow-hidden">
    <div class="w-full flex items-center justify-center flex-col gap-y-12 duration-300" :class="[isExpanded ? 'h-[3rem]' : 'h-full']">

      <div v-if="!isExpanded" >
        
        <h1 class="text-4xl font-bold mb-8">Payphone Demo</h1>
        <p class="mb-8">This demo allows you to make a call to schedule a hair cut at the <strong>Ojisan Barber Salon</strong> salon, a fictional business. </p>
  
        <div>
          <ul class="list-disc list-inside">
            <li>You must register first to make a call.</li>
            <li>You will have a wallet after registration.</li>
            <li>Send ETH to your wallet to fund it for your haircut appointment.</li>
            <li>You can make an actual call to the phone number, or use the web call to schedule the appointment.</li>
          </ul>
        </div>

        <div class="w-full max-w-sm">
          <p>Phone Call</p>
          <a class="text-blue-500 underline" href="tel:+1(419)7806507">+(419)780-6507</a>
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

          <div v-if="!isExpanded" class="absolute top-0 left-2 bg-stone-700/80 backdrop-blur-sm rounded-sm px-2 py-1 text-sm border border-white/10">
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
      isExpanded ? 'h-[calc(100dvh-6rem)] w-full flex justify-center items-center' : 'h-[0px] overflow-hidden opacity-0',
      'duration-300 transition-all ease-in-out'
    ]">
      <section :class="[
        isExpanded ? 'opacity-100 delay-50' : 'opacity-0',
        'duration-300 transition-all ease-in-out'
      ]" class="flex justify-center items-center w-full h-full">
        <Slides />
      </section>
    </div>


    <button v-if="isExpanded" class="absolute bottom-12 w-14 h-14 bg-white/20 border border-white/50 rounded-full p-2 flex justify-center items-center z-50 pointer-events-auto hover:scale-110 transition-all duration-200" @click="isExpanded = !isExpanded">
        <X class="w-8 h-8 text-white" />
    </button>

  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '@nanostores/vue'
import Slides from './Slides.vue'
import { $activeTab, setActiveTab } from '../stores/ui'
import { X } from 'lucide-vue-next'
const isExpanded = ref(false)
const activeTab = useStore($activeTab)

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
</script>