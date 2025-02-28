<template>
  <section class="w-full py-32 px-6 border-b border-white/5 relative overflow-hidden">
    <!-- Dot Pattern Background -->
    <DotPattern
        :size="32"
        :radius="1.5"
        :offset-x="0"
        :offset-y="0"
        class="absolute inset-0 h-full w-full fill-white/20 [mask-image:radial-gradient(white,transparent_85%)]">
    </DotPattern>

    <!-- Accent glow -->
    <div class="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-white/10 blur-[120px]"></div>
    <div class="absolute bottom-1/3 -right-20 w-96 h-96 rounded-full bg-white/10 blur-[120px]"></div>
    
    <div class="max-w-5xl mx-auto w-full relative">
      <!-- Main Content -->
      <div class="text-center mb-16">
        <!-- Logo Container -->
        <div class="inline-flex items-center justify-center p-4 mb-10">
          <img src="/logo.png" alt="Payphone Logo" class="h-20 w-auto drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]" />
        </div>
        
        <!-- Title Section -->
        <h1 class="text-6xl md:text-7xl font-semibold tracking-tight mb-6 leading-tight">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/80">
            Payphone Demo
          </span>
        </h1>
        <p class="text-3xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-3">
          AI + Blockchain Reservations
        </p>
        <p class="text-sm md:text-base text-white/60 max-w-2xl mx-auto">
          Schedule your haircut at Ojisan Barber Salon with AI and Pay On-Chain
        </p>
      </div>
      
      <!-- What is This Card - Improved Design -->
      <div class="max-w-3xl mx-auto">
        <div class="p-6 rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.10] to-white/[0.02] backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,0.15)]">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 mt-1">
              <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span class="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></span>
              </div>
            </div>
            <div>
              <h2 class="text-xl text-white font-medium mb-2">What is This?</h2>
              <p class="text-white/80 text-sm leading-relaxed">
                Payphone is a demo showcasing how businesses can automate appointments with AI voice agents while integrating secure onchain payments. This system lets customers schedule, pay for, and confirm services using natural conversation - with all transactions recorded on Base blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import DotPattern from '../DotPattern.vue';
</script> 