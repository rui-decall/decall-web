<template>
  <div class="bg-stone-950 w-full min-h-[100dvh] text-white/90 p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-medium">Business Management</h1>
      <UserButton />
    </div>
    
    <!-- Navigation Tabs -->
    <div class="mb-6">
      <nav class="flex gap-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="currentTab = tab.id"
          class="px-4 py-2 text-sm rounded-lg transition-colors duration-200"
          :class="[
            currentTab === tab.id 
              ? 'bg-stone-800/50 text-white/90'
              : 'text-white/70 hover:bg-stone-800/30'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="bg-stone-900/50 rounded-lg p-6">
      <BusinessInfo 
        v-if="currentTab === 'info'"
        :business="businessData"
        @update="updateBusinessInfo"
      />
      
      <StaffManagement 
        v-if="currentTab === 'staff'"
        :staff="staffList"
        @add="addStaffMember"
        @update="updateStaffMember"
        @delete="deleteStaffMember"
      />
      
      <ServiceManagement 
        v-if="currentTab === 'services'"
        :services="servicesList"
        @add="addService"
        @update="updateService"
        @delete="deleteService"
      />

      <CommunicationChannels 
        v-if="currentTab === 'channels'"
        :channels="channelsList"
        @update="updateChannels"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BusinessInfo from './BusinessInfo.vue'
import StaffManagement from './StaffManagement.vue'
import ServiceManagement from './ServiceManagement.vue'
import CommunicationChannels from './CommunicationChannels.vue'
import { UserButton } from '@clerk/vue'

const tabs = [
  { id: 'info', name: 'Business Info' },
  { id: 'staff', name: 'Staff' },
  { id: 'services', name: 'Services' },
  { id: 'channels', name: 'Communication Channels' }
]

const currentTab = ref('info')
const businessData = ref(null)
const staffList = ref([])
const servicesList = ref([])
const channelsList = ref([])

onMounted(async () => {
  try {
    // Fetch business data
    const response = await fetch('/api/business/details')
    const data = await response.json()
    businessData.value = data.business
    staffList.value = data.staff
    servicesList.value = data.services
    channelsList.value = data.channels
  } catch (error) {
    console.error('Error fetching business data:', error)
  }
})

// Business Info methods
const updateBusinessInfo = async (updatedInfo) => {
  try {
    const response = await fetch('/api/business/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedInfo)
    })
    if (response.ok) {
      businessData.value = await response.json()
    }
  } catch (error) {
    console.error('Error updating business:', error)
  }
}

// Staff management methods
const addStaffMember = async (staffData) => {
  try {
    const response = await fetch('/api/staff/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData)
    })
    if (response.ok) {
      const newStaff = await response.json()
      staffList.value.push(newStaff)
    }
  } catch (error) {
    console.error('Error adding staff:', error)
  }
}

const updateStaffMember = async (staffId, updatedData) => {
  try {
    const response = await fetch(`/api/staff/${staffId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
    if (response.ok) {
      const updatedStaff = await response.json()
      const index = staffList.value.findIndex(s => s.staff_id === staffId)
      if (index !== -1) {
        staffList.value[index] = updatedStaff
      }
    }
  } catch (error) {
    console.error('Error updating staff:', error)
  }
}

const deleteStaffMember = async (staffId) => {
  try {
    const response = await fetch(`/api/staff/${staffId}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      staffList.value = staffList.value.filter(s => s.staff_id !== staffId)
    }
  } catch (error) {
    console.error('Error deleting staff:', error)
  }
}

// Service management methods
const addService = async (serviceData) => {
  try {
    const response = await fetch('/api/services/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData)
    })
    if (response.ok) {
      const newService = await response.json()
      servicesList.value.push(newService)
    }
  } catch (error) {
    console.error('Error adding service:', error)
  }
}

const updateService = async (serviceId, updatedData) => {
  try {
    const response = await fetch(`/api/services/${serviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
    if (response.ok) {
      const updatedService = await response.json()
      const index = servicesList.value.findIndex(s => s.service_id === serviceId)
      if (index !== -1) {
        servicesList.value[index] = updatedService
      }
    }
  } catch (error) {
    console.error('Error updating service:', error)
  }
}

const deleteService = async (serviceId) => {
  try {
    const response = await fetch(`/api/services/${serviceId}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      servicesList.value = servicesList.value.filter(s => s.service_id !== serviceId)
    }
  } catch (error) {
    console.error('Error deleting service:', error)
  }
}

// Communication channels methods
const updateChannels = async (updatedChannels) => {
  try {
    const response = await fetch('/api/channels/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedChannels)
    })
    if (response.ok) {
      channelsList.value = await response.json()
    }
  } catch (error) {
    console.error('Error updating channels:', error)
  }
}
</script> 