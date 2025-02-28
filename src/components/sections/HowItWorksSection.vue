<template>
  <section class="w-full py-12 px-6 border-b border-white/5 relative overflow-hidden">
    <!-- Accent glow -->
    <div class="absolute top-1/3 -left-20 w-96 h-96 rounded-full bg-white/10 blur-[120px]"></div>
    
    <div class="max-w-6xl mx-auto w-full relative">
      <h2 class="text-3xl text-white font-medium mb-12 text-center">
        How it Works
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <!-- Left Column: Steps -->
        <div class="space-y-12">
          <!-- Step 1 -->
          <div class="flex gap-6">
            <div class="flex-shrink-0">
              <div class="relative flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-xl font-medium text-white mb-3">Register Your Account</h3>
              <p class="text-white/70 leading-relaxed">
                Create an account to get your free onchain wallet. Fund at least 0.0015+ ETH on Base so you can book appointments.
              </p>
            </div>
          </div>
          
          <!-- Step 2 -->
          <div class="flex gap-6">
            <div class="flex-shrink-0">
              <div class="relative flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-xl font-medium text-white mb-3">Talk to the AI Assistant</h3>
              <p class="text-white/70 leading-relaxed">
                Choose your preferred channel to book an appointment - phone call, web call, or WhatsApp.
              </p>
            </div>
          </div>
          
          <!-- Step 3 -->
          <div class="flex gap-6">
            <div class="flex-shrink-0">
              <div class="relative flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 class="text-xl font-medium text-white mb-3">Track Your Appointments</h3>
              <p class="text-white/70 leading-relaxed">
                View your appointments in the calendar, check status and transaction hash.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Right Column: Business Info Card -->
        <div class="p-8 rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.10] to-white/[0.02] backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.15)]">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Store class="h-8 w-8 text-white/90" />
            </div>
            <div>
              <h3 class="text-xl font-medium text-white">Ojisan Barber Salon</h3>
              <p class="text-white/60 text-sm">Our Fictional Demo Business</p>
            </div>
          </div>
          
          <div class="mb-6">
            <p class="text-white/80 text-sm leading-relaxed mb-4">
              The agent works 24/7, but take note of the below business hours.
            </p>
            <p class="text-white/80 text-sm leading-relaxed">
              You can reach the agent via Phone Call, Web Call (on this website) or WhatsApp.
            </p>
          </div>
          
          <div class="border border-white/15 rounded-lg overflow-hidden">
            <div class="bg-white/10 px-4 py-3">
              <h4 class="text-white/90 text-sm font-medium">Business Hours</h4>
            </div>
            <div class="p-4 space-y-3">
              <div class="flex justify-between items-center text-white/80 text-sm">
                <span>Monday - Saturday</span>
                <span>9:00 AM - 9:00 PM</span>
              </div>
              <div class="flex justify-between items-center text-white/80 text-sm">
                <span>Break Time</span>
                <span>3:00 PM - 6:00 PM</span>
              </div>
              <div class="flex justify-between items-center text-white/80 text-sm">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
              <div class="pt-2 border-t border-white/10 mt-2">
                <p class="text-white/60 text-xs">AI available 24/7 for pre-booking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No DotPattern import needed anymore
import { Store } from 'lucide-vue-next';
</script> 