<template>
  <div class="w-full max-w-sm bg-stone-900 rounded-xl border border-white/20 overflow-hidden">
    <div class="px-6 pt-6 pb-4 border-b border-white/20 flex justify-between items-center">
      <h3 class="text-white text-xl font-medium">Wallet Manager</h3>
      <button @click="$emit('close')" class="text-white/70 hover:text-white">
        <X class="h-5 w-5" />
      </button>
    </div>
    
    <div class="p-6 space-y-6">
      <!-- Wallet Balance -->
      <div class="text-center">
        <p class="text-white/50 text-sm">Wallet Balance</p>
        <p class="text-white text-2xl font-bold">{{ balance ? Math.round(balance * 100000) / 100000 : '0.0000' }} ETH</p>
      </div>
      
      <!-- QR Code Section -->
      <div class="flex flex-col items-center space-y-4">
        <div class="w-32 h-32 bg-white rounded-xl flex items-center justify-center p-2">
          <img :src="qrCode" alt="Wallet QR Code" class="w-full h-full" />
        </div>
        
        <div class="w-full py-3 px-4 bg-stone-800/50 rounded-lg border border-white/10">
          <div class="flex items-center justify-between mb-2">
            <p class="text-white/50 text-sm">Wallet Address</p>
            <button @click="copyAddress" class="text-white/70 hover:text-white">
              <Copy class="w-4 h-4" />
            </button>
          </div>
          <p class="text-white/90 text-sm font-mono break-all">
            {{ walletAddress }}
          </p>
        </div>
      </div>
      
      <div class="pt-4 border-t border-white/10">
        <p class="text-white/60 text-sm mb-2">Need ETH for transactions?</p>
        <a 
          href="https://bridge.base.org/deposit" 
          target="_blank" 
          class="w-full py-2 px-4 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <ExternalLink class="w-4 h-4" />
          Bridge ETH to Base
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Copy, X, ExternalLink } from 'lucide-vue-next';
import { useQRCode } from '@vueuse/integrations/useQRCode';
import { useClipboard } from '@vueuse/core';
import { toast } from 'vue-sonner';

const props = defineProps({
  walletAddress: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  }
});

defineEmits(['close']);

const { copy } = useClipboard();
const qrCode = useQRCode(props.walletAddress);

const copyAddress = async () => {
  await copy(props.walletAddress);
  toast.success('Wallet address copied to clipboard');
};
</script> 