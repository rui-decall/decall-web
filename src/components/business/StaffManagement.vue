<template>
  <div class="text-white/90">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-medium">Staff Management</h2>
      <button 
        @click="showAddModal = true"
        class="px-4 py-2 bg-stone-800/50 rounded-lg text-white/90 
               hover:bg-stone-800/70 transition-colors duration-200"
      >
        Add Staff Member
      </button>
    </div>

    <!-- Staff List -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div 
        v-for="member in staff" 
        :key="member.staff_id"
        class="bg-stone-800/50 rounded-lg p-4"
      >
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-medium text-white/90">{{ member.position }}</h3>
          <div class="flex gap-2">
            <button 
              @click="editStaff(member)"
              class="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Edit
            </button>
            <button 
              @click="deleteStaff(member.staff_id)"
              class="text-red-400 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
        <p class="text-white/70">{{ member.bio }}</p>
        <div class="mt-3">
          <span 
            :class="{
              'px-3 py-1 rounded-full text-sm': true,
              'bg-emerald-500/20 text-emerald-300': member.status === 'active',
              'bg-yellow-500/20 text-yellow-300': member.status === 'on_leave',
              'bg-red-500/20 text-red-300': member.status === 'inactive'
            }"
          >
            {{ member.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingStaff" 
         class="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div class="bg-stone-900 rounded-lg w-full max-w-md p-6">
        <h3 class="text-xl font-medium mb-4">
          {{ editingStaff ? 'Edit Staff Member' : 'Add Staff Member' }}
        </h3>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block mb-2 text-white/70">Position</label>
            <input 
              v-model="staffForm.position"
              type="text"
              class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90 focus:outline-none"
              required
            />
          </div>

          <div>
            <label class="block mb-2 text-white/70">Bio</label>
            <textarea 
              v-model="staffForm.bio"
              class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90 focus:outline-none"
              rows="3"
              required
            ></textarea>
          </div>

          <div>
            <label class="block mb-2 text-white/70">Status</label>
            <select 
              v-model="staffForm.status"
              class="w-full p-3 bg-stone-800/50 rounded-lg text-white/90 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
            </select>
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
              {{ editingStaff ? 'Save Changes' : 'Add Staff' }}
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
  staff: Array<{
    staff_id: string
    position: string
    bio: string
    status: 'active' | 'inactive' | 'on_leave'
    working_hours: Record<string, any>
  }>
}>()

const emit = defineEmits<{
  (e: 'add', data: any): void
  (e: 'update', id: string, data: any): void
  (e: 'delete', id: string): void
}>()

const showAddModal = ref(false)
const editingStaff = ref<null | any>(null)
const staffForm = ref({
  position: '',
  bio: '',
  status: 'active' as const,
  working_hours: {}
})

const editStaff = (staff: any) => {
  editingStaff.value = staff
  staffForm.value = { ...staff }
}

const closeModal = () => {
  showAddModal.value = false
  editingStaff.value = null
  staffForm.value = {
    position: '',
    bio: '',
    status: 'active',
    working_hours: {}
  }
}

const handleSubmit = () => {
  if (editingStaff.value) {
    emit('update', editingStaff.value.staff_id, staffForm.value)
  } else {
    emit('add', staffForm.value)
  }
  closeModal()
}

const deleteStaff = (staffId: string) => {
  if (confirm('Are you sure you want to delete this staff member?')) {
    emit('delete', staffId)
  }
}
</script> 