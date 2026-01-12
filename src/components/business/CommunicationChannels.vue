<template>
  <div class="text-white/90">
    <h2 class="text-xl font-medium mb-6">Communication Channels</h2>
    
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Channel Cards -->
      <div 
        v-for="channel in availableChannels" 
        :key="channel.type"
        class="bg-stone-800/50 rounded-lg p-4"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="font-medium capitalize text-white/90">{{ channel.type }}</h3>
            <p class="text-sm text-white/70">{{ channel.description }}</p>
          </div>
          <div class="flex items-center">
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                class="sr-only peer"
                :checked="isChannelActive(channel.type)"
                @change="toggleChannel(channel.type)"
              />
              <div class="w-11 h-6 bg-stone-700 rounded-full peer 
                          peer-checked:after:translate-x-full peer-checked:after:border-white 
                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                          after:bg-white after:rounded-full after:h-5 after:w-5 
                          after:transition-all peer-checked:bg-blue-600">
              </div>
            </label>
          </div>
        </div>

        <!-- Channel Configuration -->
        <div v-if="isChannelActive(channel.type)" class="mt-4">
          <div v-if="channel.type === 'phone'">
            <label class="block mb-2 text-white/70">Phone Number</label>
            <input 
              v-model="channelConfigs.phone.number"
              type="tel"
              class="w-full p-3 bg-stone-800 rounded-lg text-white/90 focus:outline-none"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div v-if="channel.type === 'web'">
            <label class="block mb-2 text-white/70">Website URL</label>
            <input 
              v-model="channelConfigs.web.url"
              type="url"
              class="w-full p-3 bg-stone-800 rounded-lg text-white/90 focus:outline-none"
              placeholder="https://example.com"
            />
          </div>

          <div v-if="channel.type === 'whatsapp'">
            <label class="block mb-2 text-white/70">WhatsApp Number</label>
            <input 
              v-model="channelConfigs.whatsapp.number"
              type="tel"
              class="w-full p-3 bg-stone-800 rounded-lg text-white/90 focus:outline-none"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div v-if="channel.type === 'instagram'">
            <label class="block mb-2 text-white/70">Instagram Handle</label>
            <div class="flex">
              <span class="bg-stone-800 px-4 py-3 rounded-l-lg text-white/70">@</span>
              <input 
                v-model="channelConfigs.instagram.handle"
                type="text"
                class="w-full p-3 bg-stone-800 rounded-r-lg text-white/90 focus:outline-none"
                placeholder="yourbusiness"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-6">
      <button 
        @click="saveChanges"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg 
               hover:bg-blue-700 transition-colors duration-200"
      >
        Save Channel Settings
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface ChannelConfig {
  phone: { number: string }
  web: { url: string }
  whatsapp: { number: string }
  instagram: { handle: string }
}

const props = defineProps<{
  channels: Array<{
    channel_id: string
    channel_type: 'phone' | 'web' | 'whatsapp' | 'instagram'
    configuration: any
    status: 'active' | 'inactive'
  }>
}>()

const emit = defineEmits<{
  (e: 'update', data: any): void
}>()

const availableChannels = [
  { 
    type: 'phone', 
    description: 'Direct phone communication with customers' 
  },
  { 
    type: 'web', 
    description: 'Your business website' 
  },
  { 
    type: 'whatsapp', 
    description: 'WhatsApp Business messaging' 
  },
  { 
    type: 'instagram', 
    description: 'Instagram business profile' 
  }
]

const activeChannels = ref<string[]>([])
const channelConfigs = ref<ChannelConfig>({
  phone: { number: '' },
  web: { url: '' },
  whatsapp: { number: '' },
  instagram: { handle: '' }
})

onMounted(() => {
  // Initialize active channels and configurations from props
  props.channels.forEach(channel => {
    if (channel.status === 'active') {
      activeChannels.value.push(channel.channel_type)
      if (channel.configuration) {
        channelConfigs.value[channel.channel_type] = channel.configuration
      }
    }
  })
})

const isChannelActive = (channelType: string): boolean => {
  return activeChannels.value.includes(channelType)
}

const toggleChannel = (channelType: string) => {
  const index = activeChannels.value.indexOf(channelType)
  if (index === -1) {
    activeChannels.value.push(channelType)
  } else {
    activeChannels.value.splice(index, 1)
  }
}

const saveChanges = () => {
  const updatedChannels = activeChannels.value.map(channelType => ({
    channel_type: channelType,
    configuration: channelConfigs.value[channelType],
    status: 'active' as const
  }))

  emit('update', updatedChannels)
}
</script>

<style scoped>
.communication-channels {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 