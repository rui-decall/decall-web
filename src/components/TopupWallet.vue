<template>
  <div class="wallet-container">
    <!-- Connect Wallet Section -->
    <div v-if="uiStep == 0" class="connect-section">
        <div class="connect-card">
            <h2>Find your account via phone number</h2>
            <input type="text" v-model="inputPhoneNumber" placeholder="Enter phone number" />
            <button @click="fetchWalletData()" class="primary-button">Find</button>
        </div>
      <!-- <div class="connect-card pointer-events-none">
        <h2>Connect Your Wallet</h2>
        <p class="connect-description">Connect your wallet to access your account and manage your ETH</p>
        <button 
          @click="connectWallet()" 
          class="connect-button pointer-events-auto"
          :class="{ 'loading': isConnecting }"
        >
          <span class="button-content">
            <span>{{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}</span>
          </span>
        </button>
      </div> -->
    </div>

    <!-- Main Wallet Content -->
    <div v-if="uiStep == 1">
      <div class="wallet-header">
        <div class="connected-info">
          <span class="connection-status"></span>
          Connected: {{ truncateAddress(connectedAddress) }}
        </div>

        <div v-if="isWalletConnected">
            <button @click="disconnectWallet" class="disconnect-button">
              Disconnect
            </button>
        </div>
        <div v-else>
            <button @click="connectWallet" class="connect-button">Connect Wallet</button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading wallet information...</p>
      </div>

      <!-- No Wallet Section -->
      <div v-if="!supabaseWallet" class="no-wallet-section">
        <h2>Create Your Wallet</h2>
        <p class="description">You don't have a wallet yet. Create one to start managing your ETH.</p>
        <div class="input-group">
          <label for="phone">Phone Number</label>
          <input
            type="text"
            id="phone"
            v-model="inputPhoneNumber"
            placeholder="Enter phone number"
          >
        </div>
        <div class="input-group">
          <label for="phone">Name</label>
          <input
            type="text"
            id="name"
            v-model="inputName"
            placeholder="Enter name"
          >
        </div>
        <button 
          @click="createWallet(inputPhoneNumber, inputName)" 
          class="primary-button"
          :disabled="creatingWallet"
        >
          {{ creatingWallet ? 'Creating Wallet...' : 'Create Wallet' }}
        </button>
      </div>

      <!-- Existing Wallet Section -->
      <div v-else class="wallet-section">
        <div class="wallet-info">
          <h2>Your Wallet</h2>
          <div class="balance-card">
            <div class="balance-header">
              <span class="label">Current Balance</span>
              <span class="value">{{ supabaseWallet?.balance || 0 }} ETH</span>
            </div>
            <div class="wallet-address">
              <span class="label">Wallet Address</span>
              <div class="address-container">
                <span class="address">{{ supabaseWallet?.wallet_address || '' }}</span>
                <button @click="copyAddress(supabaseWallet?.wallet_address || '')" class="copy-button">
                  <span class="icon">📋</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="topup-section">
          <h3>Top Up Wallet</h3>
          <div class="input-group">
            <label for="amount">Amount (ETH)</label>
            <input 
              type="number" 
              id="amount" 
              v-model="topupAmount" 
              min="0.00001" 
              step="0.00001" 
              placeholder="Enter ETH amount"
            >
          </div>

          <button 
            @click="handleTopup" 
            class="primary-button"
            :disabled="isTopupDisabled"
          >
            {{ processingTopup ? 'Processing...' : 'Top Up' }}
          </button>
        </div>

      </div>


    </div>

    <!-- Toast Notification -->
    <div v-if="notification" class="toast" :class="notification.type">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { createClient } from '@supabase/supabase-js'
// TEMPORARILY DISABLED: Blockchain features
// import { http, createConfig, connect, getAccount, disconnect, reconnect, readContract, getBalance, sendTransaction, waitForTransactionReceipt } from '@wagmi/core'
// import { formatEther, parseEther } from 'viem'
// import { baseSepolia } from '@wagmi/core/chains'
// import { coinbaseWallet } from '@wagmi/connectors'

const wallet : any = ref(null);
const supabaseWallet : any = ref(null);
const inputPhoneNumber = ref<string>('60123456789')
const inputName = ref<string>('')

// TEMPORARILY DISABLED: Blockchain config
// const wagmiConfig = createConfig({
//   chains: [baseSepolia],
//   connectors: [
//     coinbaseWallet({ appName: 'Create Wagmi', preference: 'smartWalletOnly' }),
//   ],
//   transports: {
//     [baseSepolia.id]: http(),
//   },
// })
const wagmiConfig = null

const isWalletConnected = ref(false)
const isConnecting = ref(false)
const connectedAddress = ref<string>('')
const uiStep = ref(0)


// TEMPORARILY DISABLED: Wallet connection
// const connectWallet = async () => {
//     console.log('connectWallet')
//     isConnecting.value = true

//     try {
//         await connect(wagmiConfig, { connector: coinbaseWallet({ appName: 'Create Wagmi' }) })
//         const account = getAccount(wagmiConfig)
//         connectedAddress.value = account.address || ''
//         isWalletConnected.value = true

//         showNotification('success', 'Wallet connected successfully!')
//     } catch (error) {
//         console.error('Wallet connection error:', error)
//         showNotification('error', 'Failed to connect wallet')
//     } finally {
//         isConnecting.value = false
//     }
// }
const connectWallet = async () => {
    showNotification('error', 'Blockchain features temporarily disabled')
}

// const disconnectWallet = async () => {
//   try {
//     await disconnect(wagmiConfig)
//     isWalletConnected.value = false
//     connectedAddress.value = ''
//     wallet.value = null
//     showNotification('success', 'Wallet disconnected')
//   } catch (error) {
//     console.error('Disconnect error:', error)
//     showNotification('error', 'Failed to disconnect wallet')
//   }
// }
const disconnectWallet = async () => {
    showNotification('error', 'Blockchain features temporarily disabled')
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}
const supabase = createClient(supabaseUrl, supabaseAnonKey)



const loading = ref(true)
const creatingWallet = ref(false)
const processingTopup = ref(false)
const topupAmount = ref(0.00001)

const notification = ref<{ type: 'success' | 'error', message: string } | null>(null)

// Computed property for topup button state
const isTopupDisabled = computed(() => {
  const amount = parseFloat(String(topupAmount.value))
  return processingTopup.value || !amount || amount <= 0 || isWalletConnected.value == false
})

// Fetch wallet and transaction data
const fetchWalletData = async () => {
  
  loading.value = true
  try {
    const { data: walletData, error: walletError } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', inputPhoneNumber.value)
      .single()

    supabaseWallet.value = walletData;

    if (walletError) throw walletError

    // TEMPORARILY DISABLED: Blockchain balance query
    // supabaseWallet.value.balance = formatEther(await fetchWalletBalance(supabaseWallet.value.wallet_address))
    supabaseWallet.value.balance = 0
    console.log('supabaseWallet', supabaseWallet.value)

    // const topupWallet = await fetch(`https://decall-api.junyaoxiandingchan.workers.dev/phones/${inputPhoneNumber.value}/wallets`).then(res => res.json())
    // console.log('topupWallet', topupWallet)

    uiStep.value = 1;

  } catch (error) {
    showNotification('error', 'Failed to fetch wallet data')
    console.error('Error fetching wallet data:', error)
  }

  loading.value = false
}

// TEMPORARILY DISABLED: Blockchain balance query
// const fetchWalletBalance = async (_walletAddress: any) => {
//     const balance = (await getBalance(wagmiConfig, {
//         address: _walletAddress,
//         chainId: 84532,
//         unit: "ether",
//     })).value;
//     console.log('base_balance', balance)
//     return balance;
// }
const fetchWalletBalance = async (_walletAddress: any) => {
    console.log('Blockchain balance query disabled, returning 0')
    return 0;
}


// Create new wallet
async function createWallet(_phonenumber: string, _name: string) {
  creatingWallet.value = true
  try {

    const response = await fetch(`https://decall-api.junyaoxiandingchan.workers.dev/phones/${_phonenumber}/wallets`, {
        method: 'POST',
        body: JSON.stringify({
            name: _name,
        })
    }).then(res => res.json())
    console.log('response', response)


    showNotification('success', 'Wallet created successfully!')
  } catch (error) {
    showNotification('error', 'Failed to create wallet')
    console.error('Error creating wallet:', error)
  }
    creatingWallet.value = false
}

// Handle topup
// TEMPORARILY DISABLED: Blockchain transactions
// async function handleTopup() {
//   processingTopup.value = true
//   try {
//     const amount = parseFloat(String(topupAmount.value))
//     const weiAmount = parseEther(String(amount))

//     const txn = await sendTransaction(wagmiConfig, {
//       to: supabaseWallet.value.wallet_address,
//       value: weiAmount,
//       chainId: 84532,
//     })

//     console.log('txn', txn)

//     await waitForTransactionReceipt(wagmiConfig, {
//         hash: txn,
//         chainId: 84532,
//         confirmations: 1,
//     })

//     // Refresh wallet data
//     await fetchWalletData()
//     topupAmount.value = 0.00001

//     showNotification('success', `Successfully topped up ${amount} ETH`)
//   } catch (error) {
//     showNotification('error', 'Failed to process top-up')
//     console.error('Error processing top-up:', error)
//   }
//     processingTopup.value = false
// }
async function handleTopup() {
    showNotification('error', 'Blockchain features temporarily disabled')
}

// Utility functions
function truncateAddress(address: string): string {
  return `${address?.slice(0, 6)}...${address?.slice(-4)}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function copyAddress(_text: string) {
  navigator.clipboard.writeText(_text)
  showNotification('success', 'Address copied to clipboard!')
}


function showNotification(type: 'success' | 'error', message: string) {
  notification.value = { type, message }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

onMounted(() => {
  // TEMPORARILY DISABLED: Blockchain wallet check
  // const account = getAccount(wagmiConfig)
  // if (account.isConnected) {
  //   isWalletConnected.value = true
  //   connectedAddress.value = account.address
  // }
})
</script>

<style scoped>
.wallet-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

.loading-state {
  text-align: center;
  padding: 2rem;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-wallet-section {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.wallet-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.wallet-info {
  padding: 2rem;
  border-bottom: 1px solid #eee;
}

.balance-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.wallet-address {
  margin-top: 1rem;
}

.address-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.copy-button:hover {
  opacity: 1;
}

.topup-section {
  padding: 2rem;
  border-bottom: 1px solid #eee;
}

.input-group {
  margin: 1rem 0;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.input-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.primary-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.primary-button:hover:not(:disabled) {
  background: #2980b9;
}

.primary-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.transaction-history {
  padding: 2rem;
}

.transaction-list {
  margin-top: 1rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.tx-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.tx-type.topup {
  background: #e8f5e9;
  color: #2e7d32;
}

.tx-type.withdrawal {
  background: #ffebee;
  color: #c62828;
}

.tx-amount {
  font-weight: 500;
}

.tx-date {
  color: #666;
  font-size: 0.875rem;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 2rem;
  border-radius: 4px;
  color: white;
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  background: #2ecc71;
}

.toast.error {
  background: #e74c3c;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.description {
  color: #666;
  margin: 1rem 0 2rem;
}

.label {
  color: #666;
  font-size: 0.875rem;
}

.value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c5282;
}

.address {
  font-family: monospace;
  background: #fff;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.no-transactions {
  text-align: center;
  color: #666;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.connect-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.connect-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  max-width: 400px;
  width: 100%;
}

.wallet-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
}

.connect-description {
  color: #666;
  margin: 1rem 0 2rem;
  font-size: 1.1rem;
  line-height: 1.5;
}

.connect-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.connect-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.connect-button.loading {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  cursor: wait;
}

.connect-button .icon {
  font-size: 1.2rem;
}

.connect-button.loading .icon {
  animation: spin 1s linear infinite;
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.connected-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #4b5563;
}

.connection-status {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  display: inline-block;
}

.disconnect-button {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.disconnect-button:hover {
  background: #e5e7eb;
  color: #1f2937;
}
</style> 