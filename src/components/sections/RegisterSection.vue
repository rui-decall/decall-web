<template>
  <section class="flex flex-col gap-8 max-w-3xl mx-auto w-full">
    <div class="flex flex-col items-center gap-3 mb-6 text-center">
      <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl">1</div>
      <h2 class="text-2xl font-semibold">Register & Manage Your Wallet</h2>
    </div>
    
    <div class="flex flex-col items-center">
      <!-- Account Card - Already contains all wallet info -->
      <AccountCard :showCloseButton="false" class="mb-8 w-full" />
      
      <!-- Wallet Assistant Button - Only show when logged in -->
      <div v-if="isLoggedIn" class="w-full flex flex-col md:flex-row justify-center items-center gap-8 mt-12">
        <div class="flex-1 max-w-sm text-center md:text-left">
          <h3 class="text-lg font-medium mb-2">Wallet Assistant</h3>
          <p class="text-white/70">Need help managing your wallet? Chat with our AI assistant.</p>
        </div>
        
        <button 
          @click="openWalletAssistant" 
          class="w-full md:w-auto px-6 py-3 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors duration-200"
        >
          <span class="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
            </svg>
            Open Wallet Assistant
          </span>
        </button>
      </div>
    </div>
    
    <!-- Wallet Agent Modal -->
    <HeadlessModal 
      :is-open="showWalletAgentModal" 
      @close="showWalletAgentModal = false"
      content-class="flex items-center justify-center"
    >
      <WalletAgent @close="showWalletAgentModal = false" />
    </HeadlessModal>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import HeadlessModal from '../layout/HeadlessModal.vue';
import AccountCard from '../AccountCard.vue';
import WalletAgent from '../WalletAgent.vue';
import posthog from 'posthog-js';

// Check if user is logged in
const isLoggedIn = computed(() => {
  return localStorage.getItem('payphone_auth') !== null;
});

defineEmits(['selectTab']);

const showWalletAgentModal = ref(false);

// Track wallet assistant open event
const openWalletAssistant = () => {
  posthog.capture('wallet_assistant_opened', {
    logged_in: isLoggedIn.value
  });
  showWalletAgentModal.value = true;
}
</script> 