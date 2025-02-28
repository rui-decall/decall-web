<template>
  <div v-if="isExpanded" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="w-full max-w-5xl h-[90vh] bg-stone-900 rounded-lg overflow-hidden flex flex-col">
      <div class="p-3 border-b border-white/5 flex justify-between items-center">
        <h2 class="text-lg font-medium">
          {{ tabs.find(tab => tab.key === activeTab)?.label || 'Content' }}
        </h2>
        <button 
          @click="$emit('close')" 
          class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div class="flex-1 overflow-auto">
        <Slides />
      </div>
    </div>
  </div>
</template>

<script setup>
import { X } from 'lucide-vue-next'
import Slides from '../Slides.vue'

defineProps({
  isExpanded: Boolean,
  activeTab: String,
  tabs: Array
})

defineEmits(['close'])
</script> 