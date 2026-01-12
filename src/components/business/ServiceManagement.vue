<template>
  <div class="text-white/90">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium">Services</h2>
      <button 
        @click="showAddModal = true"
        class="px-4 py-2 bg-stone-800/50 rounded-lg text-white/90 
               hover:bg-stone-800/70 transition-colors duration-200"
      >
        Add Service
      </button>
    </div>

    <!-- Services Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="service in services" 
        :key="service.service_id"
        class="bg-stone-800/50 rounded-lg p-4"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium text-white/90">{{ service.name }}</h3>
            <p class="text-sm text-white/70">{{ service.duration }} minutes</p>
          </div>
          <div class="text-right">
            <div class="font-medium text-white/90">${{ service.price }}</div>
            <div class="text-sm text-white/70">
              Deposit: ${{ service.deposit_amount }}
            </div>
          </div>
        </div>
        
        <p class="text-white/70 mt-3">{{ service.description }}</p>
        
        <div class="mt-4 flex justify-end gap-2">
          <button 
            @click="editService(service)"
            class="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Edit
          </button>
          <button 
            @click="deleteService(service.service_id)"
            class="text-red-400 hover:text-red-300 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingService" 
         class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div class="bg-stone-900 rounded-lg w-full max-w-md p-6">
        <h3 class="text-xl font-medium mb-4">
          {{ editingService ? 'Edit Service' : 'Add New Service' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block mb-2 text-white/70">Service Name</label>
            <input 
              v-model="serviceForm.name"
              type="text"
              class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block mb-2 text-white/70">Description</label>
            <textarea 
              v-model="serviceForm.description"
              class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90 focus:outline-none"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-2 text-white/70">Duration (minutes)</label>
              <input 
                v-model.number="serviceForm.duration"
                type="number"
                min="1"
                class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90 focus:outline-none"
                required
              />
            </div>
            <div>
              <label class="block mb-2 text-white/70">Price ($)</label>
              <input 
                v-model.number="serviceForm.price"
                type="number"
                min="0"
                step="0.01"
                class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label class="block mb-2 text-white/70">Deposit Amount ($)</label>
            <input 
              v-model.number="serviceForm.deposit_amount"
              type="number"
              min="0"
              step="0.01"
              class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90 focus:outline-none"
              required
            />
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button 
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-stone-800/50 rounded-lg text-white/70 
                     hover:bg-stone-800/70 transition-colors duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 transition-colors duration-200"
            >
              {{ editingService ? 'Save Changes' : 'Add Service' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  services: Array<{
    service_id: string
    name: string
    description: string
    duration: number
    price: number
    deposit_amount: number
  }>
}>()

const emit = defineEmits<{
  (e: 'add', data: any): void
  (e: 'update', id: string, data: any): void
  (e: 'delete', id: string): void
}>()

const showAddModal = ref(false)
const editingService = ref<null | any>(null)
const serviceForm = ref({
  name: '',
  description: '',
  duration: 60,
  price: 0,
  deposit_amount: 0
})

const editService = (service: any) => {
  editingService.value = service
  serviceForm.value = { ...service }
}

const closeModal = () => {
  showAddModal.value = false
  editingService.value = null
  serviceForm.value = {
    name: '',
    description: '',
    duration: 60,
    price: 0,
    deposit_amount: 0
  }
}

const handleSubmit = () => {
  if (editingService.value) {
    emit('update', editingService.value.service_id, serviceForm.value)
  } else {
    emit('add', serviceForm.value)
  }
  closeModal()
}

const deleteService = (serviceId: string) => {
  if (confirm('Are you sure you want to delete this service?')) {
    emit('delete', serviceId)
  }
}
</script> 