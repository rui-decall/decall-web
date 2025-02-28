<template>
  <section class="flex flex-col gap-8 max-w-3xl mx-auto w-full" :class="{'opacity-50': !isLoggedIn}">
    <div class="flex flex-col items-center gap-3 text-center">
      <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl">2</div>
      <h2 class="text-2xl font-semibold">Talk to Agent</h2>
    </div>

    <div v-if="!isLoggedIn" class="text-center text-red-500 text-sm mb-6">
      Please register first before talking to the agent
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Phone Call -->
      <div class="flex flex-col items-center text-center gap-4">
        <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <Phone class="w-8 h-8 text-white/70" />
        </div>
        <h3 class="text-lg font-medium">Phone Call</h3>
        <p class="text-white/70">Call directly from your phone to schedule an appointment</p>
        <a 
          href="tel:+1(419)7806507" 
          @click="trackPhoneCall"
          class="w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 mt-auto"
          :class="{'pointer-events-none': !isLoggedIn}"
        >
          <Phone class="w-4 h-4" />
          +1 (419) 780-6507
        </a>
      </div>
      
      <!-- Web Call -->
      <div class="flex flex-col items-center text-center gap-4">
        <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <Video class="w-8 h-8 text-white/70" />
        </div>
        <h3 class="text-lg font-medium">Web Call</h3>
        <p class="text-white/70">Make a call directly from your browser to schedule</p>
        <button 
          @click="startWebCall" 
          class="w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 mt-auto"
          :disabled="!isLoggedIn"
          :class="{'pointer-events-none': !isLoggedIn}"
        >
          <Video class="w-4 h-4" />
          Start Web Call
        </button>
      </div>
      
      <!-- WhatsApp -->
      <div class="flex flex-col items-center text-center gap-4">
        <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <MessageSquare class="w-8 h-8 text-white/70" />
        </div>
        <h3 class="text-lg font-medium">WhatsApp</h3>
        <p class="text-white/70">Chat with us on WhatsApp to schedule an appointment</p>
        <button 
          @click="openWhatsApp" 
          class="w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 mt-auto"
          :disabled="!isLoggedIn"
          :class="{'pointer-events-none': !isLoggedIn}"
        >
          <MessageSquare class="w-4 h-4" />
          Chat on WhatsApp
        </button>
      </div>
    </div>
    
    <!-- Web Call Modal -->
    <HeadlessModal 
      :is-open="showWebCallModal" 
      @close="handleCloseWebCall"
      content-class="flex items-center justify-center"
    >
      <div class="bg-stone-900 rounded-xl border border-white/20 p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">Web Call</h2>
          <button 
            @click="handleCloseWebCall" 
            class="text-white/70 hover:text-white focus:outline-none"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <CallCard 
          ref="callCardRef"
          @close="handleCloseWebCall" 
        />
      </div>
    </HeadlessModal>
  </section>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { Phone, Video, MessageSquare } from 'lucide-vue-next';
import HeadlessModal from '../layout/HeadlessModal.vue';
import CallCard from '../CallCard.vue';
import posthog from 'posthog-js';

defineProps({
  isLoggedIn: Boolean
});

defineEmits(['selectTab']);

const showWebCallModal = ref(false);
const callCardRef = ref(null);
const callInitiated = ref(false);

// Function to start web call with tracking
const startWebCall = () => {
  // Track web call initiated
  posthog.capture('web_call_initiated', {
    logged_in: true
  });
  
  showWebCallModal.value = true;
  callInitiated.value = false;
  
  // Wait for modal to be fully rendered before triggering call
  nextTick(() => {
    // Small delay to ensure modal transition is complete
    setTimeout(() => {
      if (callCardRef.value && !callInitiated.value) {
        // Find and click the webcall button instead of calling handleCall directly
        triggerWebCall();
        callInitiated.value = true;
      }
    }, 500);
  });
};

// Function to trigger the web call by finding and clicking the button
const triggerWebCall = () => {
  // Look for the hidden webcall container and click the button
  const webCallContainer = document.getElementById('hidden-webcall');
  if (webCallContainer) {
    const webCallButton = webCallContainer.querySelector('.webcall-button');
    if (webCallButton) {
      webCallButton.click();
    } else {
      console.error('Web call button not found');
    }
  } else {
    console.error('Hidden webcall container not found');
  }
};

// Handle closing the web call modal with tracking
const handleCloseWebCall = () => {
  // Track web call ended
  posthog.capture('web_call_ended');
  
  // If call is in progress, end it by triggering the call button again
  if (document.querySelector('.webcall-button[data-call-active="true"]')) {
    triggerWebCall(); // This will toggle/end the call
  }
  
  showWebCallModal.value = false;
  callInitiated.value = false;
};

// Track phone call
const trackPhoneCall = () => {
  posthog.capture('phone_call_initiated');
};

// Track WhatsApp click
const openWhatsApp = () => {
  posthog.capture('whatsapp_initiated');
  // Emit the event to parent component
  emit('selectTab', 'whatsapp');
};
</script> 