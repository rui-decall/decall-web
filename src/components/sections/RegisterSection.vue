<template>
  <section class="flex flex-col gap-8 max-w-3xl mx-auto w-full">
    <!-- COMMENTED OUT: Registration section header - User no longer needs to register
    <div class="flex flex-col items-center gap-3 mb-6 text-center">
      <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl">1</div>
      <h2 class="text-2xl font-semibold">Register & Manage Your Account</h2>
    </div>
    -->

    <div class="flex flex-col items-center">
      <!-- COMMENTED OUT: Account Card - User no longer needs to register
      <AccountCard :showCloseButton="false" class="mb-8 w-full" />
      -->

      <!-- Placeholder - Registration not required -->
      <div class="w-full bg-stone-800 rounded-xl border border-white/20 p-6 text-center mb-8">
        <h3 class="text-white text-2xl font-bold mb-2">Welcome</h3>
        <p class="text-white/50 text-sm">Registration is not required. You can proceed directly to use the service.</p>
      </div>

      <!-- COMMENTED OUT: Wallet Assistant Button - User no longer needs to register
      <div v-if="isLoggedIn" class="w-full flex flex-col md:flex-row justify-center items-center gap-8 mt-12">
        <div class="flex-1 max-w-sm text-center md:text-left">
          <h3 class="text-lg font-medium mb-2">Account Assistant</h3>
          <p class="text-white/70">Need help managing your account? Chat with our AI assistant.</p>
        </div>

        <button
          @click="openWalletAssistant"
          class="w-full md:w-auto px-6 py-3 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors duration-200"
        >
          <span class="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
            </svg>
            Open Account Assistant
          </span>
        </button>
      </div>
      -->
    </div>

    <!-- COMMENTED OUT: Wallet Agent Modal - User no longer needs to register
    <HeadlessModal
      :is-open="showWalletAgentModal"
      @close="showWalletAgentModal = false"
      content-class="flex items-center justify-center"
    >
      <WalletAgent @close="showWalletAgentModal = false" />
    </HeadlessModal>
    -->
  </section>
</template>

<script setup>
// COMMENTED OUT: Login/Registration imports - User no longer needs to register
// import { ref, computed } from 'vue';
// import HeadlessModal from '../layout/HeadlessModal.vue';
// import AccountCard from '../AccountCard.vue';
// import WalletAgent from '../WalletAgent.vue';
// import posthog from 'posthog-js';

// COMMENTED OUT: Check if user is logged in - User no longer needs to register
// const isLoggedIn = computed(() => {
//   return localStorage.getItem('payphone_auth') !== null;
// });

defineEmits(['selectTab']);

// COMMENTED OUT: Wallet assistant modal - User no longer needs to register
// const showWalletAgentModal = ref(false);

// COMMENTED OUT: Track wallet assistant open event - User no longer needs to register
// const openWalletAssistant = () => {
//   posthog.capture('wallet_assistant_opened', {
//     logged_in: isLoggedIn.value
//   });
//   showWalletAgentModal.value = true;
// }
</script> 