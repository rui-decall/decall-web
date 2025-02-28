<template>
  <main class="bg-black min-h-[100dvh] text-white flex flex-col overflow-x-hidden font-inter">
    <!-- Header -->
    <AppHeader 
      :userName="variables.user_name"
      :walletAddress="variables.wallet_address"
      :balance="getNumericBalance"
      :truncateAddress="truncateAddress"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col">
      <!-- Hero Section -->
      <HeroSection />
      
      <!-- How It Works Section -->
      <HowItWorksSection />
      
      <!-- Steps Sections Container -->
      <div class="w-full px-6 py-24 flex flex-col gap-32 max-w-7xl mx-auto">
        <!-- Step 1: Account & Wallet -->
        <RegisterSection 
          :walletAddress="variables.wallet_address" 
          :balance="getNumericBalance"
          :truncateAddress="truncateAddress"
          @selectTab="selectTab"
        />
        
        <!-- Step 2: Talk to Agent -->
        <AgentSection 
          :isLoggedIn="!!variables.user_name"
          @selectTab="selectTab"
        />
        
        <!-- Step 3: Calendar -->
        <CalendarSection />
      </div>
    </div>

    <!-- Modal for expanded content -->
    <ExpandedContentModal 
      :isExpanded="isExpanded" 
      :activeTab="activeTab"
      :tabs="tabs"
      @close="isExpanded = false"
    />

    <!-- Footer -->
    <AppFooter />
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from '@nanostores/vue'
import { $activeTab, setActiveTab } from '../stores/ui'
import { $retellVariables } from '../stores/retellVariables'

// Components
import AppHeader from './layout/AppHeader.vue'
import HeroSection from './sections/HeroSection.vue'
import RegisterSection from './sections/RegisterSection.vue'
import AgentSection from './sections/AgentSection.vue'
import CalendarSection from './sections/CalendarSection.vue'
import ExpandedContentModal from './layout/ExpandedContentModal.vue'
import AppFooter from './layout/AppFooter.vue'
import HowItWorksSection from './sections/HowItWorksSection.vue'
import posthog from 'posthog-js'

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
    key: 'whatsapp',
    label: 'WhatsApp',
    description: 'Chat with us on WhatsApp to schedule an appointment',
    tag: 'Customer'
  },
  {
    key: 'wallet',
    label: 'Wallet Agent',
    description: 'Chat with wallet agent to manage your funds',
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
  if (key === 'whatsapp') {
    window.open('https://wa.me/601154179530', '_blank')
    return
  }
  
  setActiveTab(key)
  isExpanded.value = true
}

const truncateAddress = (address) => {
  if (!address) return '-'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getNumericBalance = computed(() => {
  return typeof variables.balance === 'string' 
    ? Number(variables.balance) 
    : variables.balance || 0
})

onMounted(() => {
  // Initialize PostHog with proper configuration
  posthog.init('phc_MYWynwuSwWg0Fg0GMudKApGxYMpnsJM9VXWkMmjRAEg', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true, // Automatically capture page views
    persistence: 'localStorage' // Use localStorage for persistence
  })
})
</script>
