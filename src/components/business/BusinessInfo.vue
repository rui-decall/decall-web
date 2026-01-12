<template>
  <div class="text-white/90">
    <h2 class="text-xl font-medium mb-6">Business Information</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block mb-2 text-white/70">Business Name</label>
        <input 
          v-model="form.name"
          type="text"
          class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90
                 focus:outline-none"
          required
        />
      </div>

      <div>
        <label class="block mb-2 text-white/70">Description</label>
        <textarea 
          v-model="form.description"
          class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90
                 focus:outline-none"
          rows="4"
          required
        ></textarea>
      </div>

      <div>
        <label class="block mb-2 text-white/70">Address</label>
        <input 
          v-model="form.address"
          type="text"
          class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90
                 focus:outline-none"
          required
        />
      </div>

      <div>
        <label class="block mb-2 text-white/70">Contact Number</label>
        <input 
          v-model="form.contact_number"
          type="tel"
          class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90
                 focus:outline-none"
          required
        />
      </div>

      <div>
        <h3 class="text-white/70 mb-4">Business Hours</h3>
        <div class="space-y-2">
          <div v-for="(hours, day) in form.business_hours" :key="day" 
               class="flex items-center gap-4 p-3 bg-stone-800/50 rounded-lg">
            <span class="w-24 capitalize text-white/70">{{ day }}</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                v-model="hours.isOpen"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-stone-700 rounded-full peer 
                          peer-checked:after:translate-x-full peer-checked:after:border-white 
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                          after:bg-white after:rounded-full after:h-5 after:w-5 
                          after:transition-all peer-checked:bg-blue-600">
              </div>
            </label>
            <input 
              type="time" 
              v-model="hours.open"
              :disabled="!hours.isOpen"
              class="p-2 bg-stone-700 rounded-lg text-white/90
                     disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            />
            <span class="text-white/60">to</span>
            <input 
              type="time" 
              v-model="hours.close"
              :disabled="!hours.isOpen"
              class="p-2 bg-stone-700 rounded-lg text-white/90
                     disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>
      </div>

      <button 
        type="submit"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg 
               transition-colors duration-200"
      >
        Save Changes
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  business: {
    business_id: string
    name: string
    description: string
    address: string
    contact_number: string
    business_hours: Record<string, { open: string, close: string, isOpen: boolean }>
    status: 'active' | 'inactive'
  }
}>()

const emit = defineEmits<{
  (e: 'update', data: any): void
}>()

const form = ref({
  name: '',
  description: '',
  address: '',
  contact_number: '',
  business_hours: {
    monday: { open: '09:00', close: '17:00', isOpen: true },
    tuesday: { open: '09:00', close: '17:00', isOpen: true },
    wednesday: { open: '09:00', close: '17:00', isOpen: true },
    thursday: { open: '09:00', close: '17:00', isOpen: true },
    friday: { open: '09:00', close: '17:00', isOpen: true },
    saturday: { open: '09:00', close: '17:00', isOpen: false },
    sunday: { open: '09:00', close: '17:00', isOpen: false },
  }
})

watch(() => props.business, (newBusiness) => {
  if (newBusiness) {
    form.value = { ...newBusiness }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('update', form.value)
}
</script> 