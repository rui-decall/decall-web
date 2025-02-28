<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <!-- Backdrop -->
        <div 
          class="fixed inset-0 bg-black/80 backdrop-blur-sm" 
          @click="closeOnBackdrop && $emit('close')"
        ></div>
        
        <!-- Modal Content -->
        <div 
          class="relative z-10 w-full max-w-lg transform transition-all text-white flex flex-col max-h-[90vh]"
          :class="contentClass"
        >
          <slot></slot>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  contentClass: {
    type: String,
    default: ''
  }
});

defineEmits(['close']);

// Handle escape key to close modal
const handleEscKey = (e) => {
  if (props.isOpen && e.key === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
  
  // Prevent body scrolling when modal is open
  if (props.isOpen) {
    document.body.style.overflow = 'hidden';
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscKey);
  document.body.style.overflow = '';
});

// Watch for changes to isOpen prop
watch(() => props.isOpen, (newVal) => {
  document.body.style.overflow = newVal ? 'hidden' : '';
});
</script> 