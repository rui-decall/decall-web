<template>
  <div class="retell-variables">
    <h3>Dynamic Variables</h3>
    
    <div class="variables-list">
      <div v-for="(variable, index) in localVariables" :key="index" class="variable-item">
        <input 
          type="text" 
          v-model="variable.key"
          placeholder="Variable name"
          class="input-key"
        />
        <input 
          type="text" 
          v-model="variable.value"
          placeholder="Value"
          class="input-value"
        />
        <button @click="removeLocalVariable(index)" class="remove-btn">×</button>
      </div>
    </div>

    <div class="button-group">
      <button @click="addLocalVariable" class="add-btn">Add Variable</button>
      <button @click="saveToStore" class="save-btn">Save</button>
    </div>

   
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '@nanostores/vue'
import { $retellVariables, setVariable, removeVariable } from '../stores/retellVariables'

interface LocalVariable {
  key: string;
  value: string;
}

const STORAGE_KEY = 'retell_variables'
const storeVariables = useStore($retellVariables)
const localVariables = ref<LocalVariable[]>([])

// Load initial data from store
onMounted(() => {
  // Try to load from localStorage first
  const savedVariables = localStorage.getItem(STORAGE_KEY)
  
  if (savedVariables) {
    localVariables.value = JSON.parse(savedVariables)
    // Restore to store immediately
    localVariables.value.forEach(variable => {
      if (variable.key && variable.value) {
        setVariable(variable.key, variable.value)
      }
    })
  } else {
    // Initialize with default variables
    const defaultVariables = [
      {
        key: 'user_name',
        value: 'Steve'
      },
      {
        key: 'wallet_address',
        value: '0x0'
      }
    ]
    localVariables.value = defaultVariables
    // Set default values in store
    defaultVariables.forEach(variable => {
      setVariable(variable.key, variable.value)
    })
  }
})

function addLocalVariable() {
  localVariables.value.push({
    key: `variable_${localVariables.value.length + 1}`,
    value: ''
  })
}

function removeLocalVariable(index: number) {
  localVariables.value.splice(index, 1)
}

function saveToStore() {
  // Clear existing store
  Object.keys(storeVariables.value).forEach(key => {
    removeVariable(key)
  })

  // Save new variables
  localVariables.value.forEach(variable => {
    if (variable.key && variable.value) {
      setVariable(variable.key, variable.value)
    }
  })

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localVariables.value))
}
</script> 

<style scoped>
.retell-variables {
  padding: 1rem;
  max-width: 500px;
  margin: 0 auto;
}
.variables-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}
.variable-item {
  display: flex;
  gap: 0.5rem;
}
.input-key, .input-value {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
}
.button-group {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
.add-btn, .save-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  color: white;
  transition: opacity 0.2s;
}
.add-btn {
  background: #4CAF50;
}
.save-btn {
  background: #2196F3;
}
.remove-btn {
  padding: 0.5rem 1rem;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  opacity: 0.9;
}
button:active {
  opacity: 0.8;
}
</style>