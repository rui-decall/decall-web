<template>
  <header class="w-full py-3 px-4 flex justify-center items-center border-b border-white/10 fixed top-0 left-0 right-0 bg-stone-900/80 backdrop-blur-md z-50 shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
    <div class="w-full max-w-7xl mx-auto flex flex-wrap justify-between items-center">
      <!-- Logo and Title -->
      <div class="flex items-center gap-2">
        <img src="/logo.png" alt="Payphone Logo" class="h-7 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        <h1 class="text-lg font-medium text-white/90">Payphone</h1>
      </div>
      
      <!-- User Info -->
      <div class="flex items-center gap-4 py-1.5">
        <template v-if="userName">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <User class="w-3 h-3 text-white/60" />
              <span class="text-white/80 text-sm">{{ userName }}</span>
            </div>
            <div class="w-px h-4 bg-white/15"></div>
            <div class="flex items-center gap-2">
              <Wallet class="w-3 h-3 text-white/60" />
              <span class="text-white/80 text-sm">{{ truncateAddress(walletAddress) }}</span>
            </div>
            <div class="w-px h-4 bg-white/15"></div>
            <div class="flex items-center gap-2">
              <CircleDollarSign class="w-3 h-3 text-white/60" />
              <span class="text-white/80 text-sm">{{ balance ? Math.round(balance * 100000) / 100000 : '0.0000' }} ETH</span>
            </div>
            <button 
              @click="handleSignOut" 
              class="ml-4 px-3 py-1 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-md flex items-center gap-1 hover:bg-red-500/10 transition-colors"
            >
              <LogOut class="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-2">
            <User class="w-3 h-3 text-white/60" />
            <span class="text-white/60 text-sm">Not logged in</span>
          </div>
        </template>
      </div>
    </div>
  </header>
  
  <!-- Spacer to account for fixed header -->
  <div class="h-14"></div>
</template>

<script setup>
import { User, Wallet, CircleDollarSign, LogOut } from 'lucide-vue-next'

defineProps({
  userName: String,
  walletAddress: String,
  balance: Number,
  truncateAddress: Function
})

const emit = defineEmits(['signOut'])

const handleSignOut = () => {
  emit('signOut')
}
</script> 