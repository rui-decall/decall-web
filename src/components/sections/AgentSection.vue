<template>
  <!-- COMMENTED OUT: opacity-50 class - Registration no longer required -->
  <section class="flex flex-col gap-8 max-w-3xl mx-auto w-full">
    <div class="flex flex-col items-center gap-3 text-center">
      <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl">1</div>
      <h2 class="text-2xl font-semibold">Talk to Agent</h2>
    </div>

    <!-- COMMENTED OUT: Login required warning - Registration no longer required
    <div v-if="!isLoggedIn" class="text-center text-red-500 text-sm mb-6">
      Please register first before talking to the agent
    </div>
    -->

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        <!-- Microphone Permission Button -->
        <button
          v-if="!isMicEnabled"
          @click="requestMicPermission"
          class="w-full py-2 px-4 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Mic class="w-4 h-4" />
          Enable Microphone
        </button>

        <button
          @click="startWebCall"
          class="w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 mt-auto"
          :disabled="!isMicEnabled"
          :class="{
            'pointer-events-none': !isMicEnabled,
            'bg-green-500/20 text-green-400 hover:bg-green-500/30': isMicEnabled,
            'opacity-50': !isMicEnabled
          }"
        >
          <Video class="w-4 h-4" />
          Start Web Call
        </button>
      </div>
    </div>

    <!-- Web Call Modal -->
    <HeadlessModal
      :is-open="showWebCallModal"
      @close="handleCloseWebCall"
      content-class="overflow-hidden"
    >
      <CallCard
        ref="callCardRef"
        @close="handleCloseWebCall"
      />
    </HeadlessModal>
  </section>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import { Phone, Video, MessageSquare, Mic } from 'lucide-vue-next';
import HeadlessModal from '../layout/HeadlessModal.vue';
import CallCard from '../CallCard.vue';
import posthog from 'posthog-js';
import { usePermission } from '@vueuse/core';

// COMMENTED OUT: isLoggedIn prop - Registration no longer required
// defineProps({
//   isLoggedIn: Boolean
// });

const showWebCallModal = ref(false);
const callCardRef = ref(null);
const callInitiated = ref(false);

// Add microphone permission handling
const micPermission = usePermission('microphone');
const isMicEnabled = ref(false);

// Function to request microphone permission
const requestMicPermission = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    isMicEnabled.value = true;
    posthog.capture('microphone_permission_granted');
  } catch (error) {
    console.error('Microphone permission denied:', error);
    posthog.capture('microphone_permission_denied', { error: error.message });
    alert('Microphone permission is required for web calls. Please enable it in your browser settings.');
  }
};

// Check if microphone is already enabled
onMounted(() => {
  if (micPermission.value === 'granted') {
    isMicEnabled.value = true;
  }
});

// Fix: Capture the emit function from defineEmits
const emit = defineEmits(['selectTab']);

// Function to start web call with tracking
const startWebCall = () => {
  // Check if microphone is enabled
  if (!isMicEnabled.value) {
    requestMicPermission();
    return;
  }

  // Check if a call is already in progress
  if (callCardRef.value && callCardRef.value.isCallActive) {
    // Alert the user or show a notification
    alert('A call is already in progress. Please end the current call before starting a new one.');
    return;
  }

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
        // Use the exposed handleCall method from CallCard to trigger the phone dialog
        callCardRef.value.handleCall();
        callInitiated.value = true;
      }
    }, 500);
  });
};

// Function to trigger the web call by finding and clicking the button
// NO LONGER USED, keeping for reference or potential future use
/* const triggerWebCall = () => {
  // Look for the hidden webcall container and click the button
  const webCallContainer = document.getElementById('hidden-webcall');
  if (webCallContainer) {
    const webCallButton = webCallContainer.querySelector('#webcall-start-btn');
    if (webCallButton) {
      webCallButton.click();
    } else {
      console.error('Web call start button not found');
    }
  } else {
    console.error('Hidden webcall container not found');
  }
}; */

// Handle closing the web call modal with tracking
const handleCloseWebCall = () => {
  // Track web call modal closed (not necessarily ended)
  posthog.capture('web_call_modal_closed');

  // Note: We deliberately DO NOT end the call here anymore.
  // The user can browse the site while the call is active.
  // The call can be ended via the "Hang Up" button in the CallCard,
  // or via the hidden buttons if we expose a global control.

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
  // Now emit will be properly defined
  emit('selectTab', 'whatsapp');
};
</script>
